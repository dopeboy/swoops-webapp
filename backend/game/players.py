import logging
import time
from collections import namedtuple

from django.conf import settings
from django.db import connection, transaction

import game.models
import simulator.models
import simulator.processing
import utils.db
from services.crypto_currency_converter import (
    convert_wei_to_eth,
    get_eth_to_usd_conversion_factor,
)
from services.opensea import OpenSeaAPI

LOGGER = logging.getLogger(__name__)


@utils.db.mutex
@transaction.atomic
def sync():
    """
    Sync players from the simulator and create new Player objects
    when necessary
    """
    simulator.processing.sync_players()

    game.models.Player.objects.bulk_create(
        [
            game.models.Player(simulated_id=simulated_player_id)
            for simulated_player_id in simulator.models.Player.objects.filter(
                player__isnull=True
            ).values_list("uuid", flat=True)
        ]
    )


# When updating a players ownership, there are 4 cases:
# 0. a user with an account has a player correctly assigned (no action needed)
# 1. a user without an account mints a token
# 2. a user with an account mints a token
# 3. a user with an account acquires a token from another address
# 4. a user without an account acquires a token from another address
#
# Secnario 1 is simple in that there is no team linking in the model- there is no team
# for the acquiring user, so no field is set on the player to show it's owned.
#
# Scenarios 2 and 3 are analagous- the acquiring user has an account and so, the player
# has a team id that can be set.
#
# Scenario 4 means that the player now has no team to link, so the team id should be
# nulled.


@utils.db.mutex
@transaction.atomic
def update_team_ownership():
    """
    Update players team ownership based on the current ownership as
    defined by eth_transfers.
    This process is done for all players and all owners.
    """

    sql = """
    SELECT gp.id AS player_id, team.id AS rightful_owning_team
    FROM eth_transfer et
    INNER JOIN (
        WITH mbx AS (SELECT
            token AS token,
            max(block) AS max_block
        FROM eth_transfer
        GROUP BY token)
        SELECT
            mli.token AS token,
            mli.block AS max_block,
            max(mli.log_index) AS max_log_index
        FROM eth_transfer mli
            JOIN mbx ON mli.token = mbx.token AND mli.block = mbx.max_block
        GROUP BY mli.token, mli.block
    ) mbt ON et.token = mbt.token AND et.block = mbt.max_block AND et.log_index = mbt.max_log_index
    JOIN simulator_player sp ON sp.token = et.token and sp.kind='ON_CHAIN'
    JOIN game_player gp ON gp.simulated_id = sp.uuid
    LEFT JOIN accounts_user token_holder ON token_holder.wallet_address = et.to_address
    LEFT JOIN game_team team ON token_holder.id = team.owner_id
    WHERE
        (
            team.id != gp.team_id
            OR gp.team_id IS NULL
            OR token_holder.id IS NULL
        )
        AND
        NOT (
            team.id IS NULL
            AND gp.team_id IS NULL
            );
    """  # noqa: E501

    return execute_and_process(sql)


@utils.db.mutex
@transaction.atomic
def update_team_ownership_for_wallet(wallet):
    """
    Update players team ownership based on the current ownership as
    defined by eth_transfers. The wallet address parameter is a wallet that has just
    obtained a token and should have its ownership reflected.
    """

    sql = """
    SELECT gp.id AS player_id, team.id AS rightful_owning_team
    FROM eth_transfer et
    INNER JOIN (
        WITH mbx AS (SELECT
            token AS token,
            max(block) AS max_block
        FROM eth_transfer
        GROUP BY token)
        SELECT
            mli.token AS token,
            mli.block AS max_block,
            max(mli.log_index) AS max_log_index
        FROM eth_transfer mli
            JOIN mbx ON mli.token = mbx.token AND mli.block = mbx.max_block
        WHERE to_address = %s
        GROUP BY mli.token, mli.block
    ) mbt ON et.token = mbt.token AND mbt.max_block = et.block
    JOIN simulator_player sp ON sp.token = et.token and sp.kind='ON_CHAIN'
    JOIN game_player gp ON gp.simulated_id = sp.uuid
    LEFT JOIN accounts_user token_holder ON token_holder.wallet_address = et.to_address
    LEFT JOIN game_team team ON token_holder.id = team.owner_id
    WHERE
        (
            token_holder.wallet_address = %s
            AND team.id != gp.team_id
            OR gp.team_id IS NULL
            OR token_holder.id IS NULL
        )
        AND
        NOT (
                team.id IS NULL
                AND gp.team_id IS NULL
            );
    """
    return execute_and_process(sql, wallet)


def execute_and_process(sql, wallet=None):
    with connection.cursor() as cursor:
        cursor.execute(sql, [wallet, wallet])

        Result = namedtuple("Result", ["player_id", "rightful_owning_team"])
        results = [Result(*row) for row in cursor.fetchall()]

        LOGGER.info(
            "update_team_ownership found {} players to update for wallet {}".format(
                len(results), wallet
            )
        )

        for result in results:
            player = game.models.Player.objects.get(pk=result.player_id)

            new_team = None
            if result.rightful_owning_team is not None:
                new_team = game.models.Team.objects.get(pk=result.rightful_owning_team)
            player.team = new_team
            player.save()

        return len(results)


def sync_opensea_player_prices():
    return # ADDED 10/9 to halt zombie instances
    os = OpenSeaAPI(base_url=settings.OPENSEA_BASE_URL, apikey=settings.OPENSEA_API_KEY)

    ethusd_conversion_factor = get_eth_to_usd_conversion_factor()

    for player in game.models.Player.objects.filter(simulated__token__gte=0):
        listings = os.retrieve_listings_by_created_date(
            asset_contract_address=settings.SMART_CONTRACT_ADDRESS,
            token_ids=(player.simulated.token,),
        )
        if not listings:
            continue
        elif listings["orders"]:
            # the first value in the listing contains the latest price of the NFT token
            listing = listings["orders"][0]

            price_eth = convert_wei_to_eth(listing["current_price"])

            player.opensea_price_usd = price_eth * ethusd_conversion_factor

        else:
            player.opensea_price_usd = None

        player.save()

        # input a delay to prevent error due to rate delay of API request
        time.sleep(0.4)

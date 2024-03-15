import json
import logging
from decimal import Decimal
from enum import Enum

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from web3 import Web3

import game.models
import services.crypto_currency_converter
import utils.db
from comm.notification import notify_slack_payout
from eth.gas import (
    InsufficentFundsException,
    get_gas_prices_in_wei,
    verify_wallet_balance,
)

LOGGER = logging.getLogger(__name__)


def match_prizes_to_payouts(tournament):
    # get payout breakdown
    payout_breakdown_usd = json.loads(tournament.meta)["payout_breakdown_usd"]

    # match entrant placement to payout breakdown (prize level)
    # sort breakdown by highest to lowest
    payout_breakdown_usd = sorted(payout_breakdown_usd, reverse=True)

    # get entrants and ensure they are sorted by placement- best performing first
    entrants = game.models.TournamentEntry.objects.for_tournament_in_placement_order(
        tournament.id
    )

    # enumerate over prizes, matching highest prize with best finishing entrants
    entrants_payouts = []

    # we only care about entrants that place in a payout position
    for index, prize in enumerate(payout_breakdown_usd):
        entrants_payouts.append(
            {"entrant": entrants[index], "prize": Decimal(prize), "payout": None}
        )

    # match existing payouts for this tournament to entrants
    for tournament_payout in tournament.tournamentpayout_set.filter(
        payout__status__iexact="CONFIRMED"
    ).all():
        for entrant_payout in entrants_payouts:
            if tournament_payout.payout.team_id == entrant_payout["entrant"].team_id:
                entrant_payout["payout"] = tournament_payout.payout

    # sort by highest payout to lowest- we should pay out highest paying positions
    # to lowest
    entrants_payouts = sorted(entrants_payouts, key=lambda k: k["prize"], reverse=True)
    return entrants_payouts


def get_next_entrant_to_pay_out(tournament_id, entrants_payouts):
    entrant_to_payout = None
    for ep in entrants_payouts:
        if ep["payout"] is None:
            entrant_to_payout = ep
            break
    if entrant_to_payout is None:
        raise Exception(
            "tournament_id={} was identified as needing a payout, but all payouts have been processed. This should not happen.".format(  # noqa: E501
                tournament_id
            )
        )
    return entrant_to_payout


def determine_conversion_rate(tournament_id, entrants_payouts):
    existing_payout = None
    for ep in entrants_payouts:
        if ep["payout"] is not None:
            existing_payout = ep["payout"]
            break

    if existing_payout is not None:
        conversion_rate = existing_payout.usd_to_eth_conversion_rate
        LOGGER.info(
            "Found an existing conversion rate for tournament_id={} from payout_id={}. Using that.".format(  # noqa: E501
                tournament_id, existing_payout.id
            )
        )
    else:
        conversion_rate = (
            services.crypto_currency_converter.get_usd_to_eth_conversion_factor()
        )
        LOGGER.info(
            "Could not find an existing conversion rate for tournament_id={}. Got one from external.".format(  # noqa: E501
                tournament_id
            )
        )

    return conversion_rate


def get_transaction_count(client, wallet_address):
    return client.eth.get_transaction_count(wallet_address)


def get_chain_id(client):
    return client.eth.chain_id


def create_payout_transaction(
    web3_client, team, amount_usd, usd_to_eth_conversion_rate, tournament, dry_run=False
):
    max_fee_per_gas, max_priority_fee_per_gas = get_gas_prices_in_wei(
        settings.ETHEREUM_NETWORK
    )
    payout_amount_wei = Web3.toWei(amount_usd * usd_to_eth_conversion_rate, "ether")

    gas_required_for_transaction = 21000  # sending ETH is a flat amount of gas
    total_cost_of_transaction = (
        gas_required_for_transaction * max_fee_per_gas + payout_amount_wei
    )

    wallet_that_pays_out = Web3.toChecksumAddress(settings.PAYOUT_WALLET_ADDRESS)
    wallet_to_receive_funds = Web3.toChecksumAddress(team.owner.wallet_address)

    try:
        verify_wallet_balance(
            web3_client, wallet_that_pays_out, total_cost_of_transaction
        )
    except InsufficentFundsException as e:
        if not dry_run:
            notify_slack_payout(
                f"While paying out tournament_id={tournament.id}: " + str(e)
            )
        raise e

    nonce = get_transaction_count(web3_client, wallet_that_pays_out)
    signed_txn = web3_client.eth.account.sign_transaction(
        dict(
            nonce=nonce,
            gas=21000,
            maxFeePerGas=max_fee_per_gas,
            maxPriorityFeePerGas=max_priority_fee_per_gas,
            to=wallet_to_receive_funds,
            value=payout_amount_wei,
            data=b"",
            chainId=get_chain_id(web3_client),
        ),
        settings.PAYOUT_WALLET_PRIVATE_KEY,
    )

    payout = game.models.Payout(
        amount_wei=payout_amount_wei,
        amount_usd=amount_usd,
        usd_to_eth_conversion_rate=usd_to_eth_conversion_rate,
        team=team,
        to_address=wallet_to_receive_funds,
        status=game.models.PayoutStatus.INITIATED,
        transaction_hash=signed_txn.hash.hex(),
        nonce=nonce,
    )
    tournament_payout = game.models.TournamentPayout(
        tournament=tournament, payout=payout
    )

    if not dry_run:
        payout.save()
        tournament_payout.save()
        message = f"[PAYOUT={payout.id}] Initiating payout for tournament_id={tournament.id}. team_id={team.id} aka {wallet_to_receive_funds} to receive ${amount_usd}/{payout_amount_wei}wei."  # noqa: E501
        LOGGER.info(message)
        notify_slack_payout(message)
    else:
        LOGGER.info(
            "Dry run. Not saving payout or tournament payout. Would have saved: payout={} and tournament_payout={}".format(  # noqa: E501
                payout, tournament_payout
            )
        )

    return signed_txn


class PayoutInitiationStatus(Enum):
    NOTHING_TO_DO = 1
    INITIATED = 2
    WAITING_FOR_RESOLUTION = 3


def send_transaction(web3_client, raw_transaction):
    web3_client.eth.send_raw_transaction(raw_transaction)


@utils.db.mutex
def initiate_payouts(dry_run=False):
    """
    Initiate payouts for tournaments that have not been paid out yet.

    Due to how the block chain pays out (sequential nonces), without things getting
    very confusing and hard to manage, you should only attempt one payout at a time.
    Accordingly, if there are any payouts that have been initiated and are waiting
    to be confirmed, this job will exit and wait for them to be confirmed before
    initiating any more payments.

    This job will find the oldest tournament that still needs a payout and initiate
    the next payout for its entrants in payout placements.
    """

    with transaction.atomic():
        transactions_awaiting_confirmation = game.models.Payout.objects.filter(
            status=game.models.PayoutStatus.INITIATED
        )
        if len(transactions_awaiting_confirmation) > 0:
            payout_ids = [p.id for p in transactions_awaiting_confirmation]
            LOGGER.info(
                "Still waiting on payouts {} to be processed. Terminating and will retry later.".format(  # noqa: E501
                    payout_ids
                )
            )
            # TODO can we flag to the job running to exponential backoff or something?
            return PayoutInitiationStatus.WAITING_FOR_RESOLUTION

        LOGGER.info("Checking for tournaments to payout...")

        tournaments = game.models.Tournament.payouts.tournaments_needing_a_pay_out(
            timezone.now() - timezone.timedelta(days=30)
        )
        if not tournaments:
            LOGGER.info("No pending tournaments to pay out. Exiting.")
            return PayoutInitiationStatus.NOTHING_TO_DO

        tournament = tournaments[0]
        LOGGER.info(f"Found tournament_id={tournament.id} to pay out")

        entrants_payouts = match_prizes_to_payouts(tournament)
        next_to_pay_out = get_next_entrant_to_pay_out(tournament.id, entrants_payouts)

        web3_client = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER))
        transaction_to_submit = create_payout_transaction(
            web3_client,
            next_to_pay_out["entrant"].team,
            next_to_pay_out["prize"],
            determine_conversion_rate(tournament.id, entrants_payouts),
            tournament,
            dry_run=dry_run,
        )

    if not dry_run:
        send_transaction(web3_client, transaction_to_submit.rawTransaction)
    LOGGER.info("Done.")
    return PayoutInitiationStatus.INITIATED

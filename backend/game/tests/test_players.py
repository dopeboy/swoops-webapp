from decimal import Decimal

import pytest

import game.players
from conftest import (
    build_player,
    build_player_and_owner,
    build_transfer,
    build_user_and_team,
)
from services.crypto_currency_converter import convert_wei_to_eth
from services.opensea import OpenSeaAPI
from simulator.client import Client


@pytest.mark.django_db
def test_sync(mocker, settings):
    """Tests game.players.sync()"""
    settings.SIMULATOR_CLIENT = "simulator.client.Client"

    fake_players = [
        {
            "uuid": "090bf6c9-f7b7-448f-8753-c484387e83c7",
            "full_name": "SWOOPSTER-99",
            "token": 500,
            "canonical": "swoopster-99",
            "positions": ["C"],
            "age": 7.0,
            "star_rating": 1.0,
            "free_agent": False,
            "stats": {
                "wins": {"value": 0, "description": "Games won"},
                "losses": {"value": 0, "description": "Games lost"},
                "g": {"value": None, "description": "Games played"},
                "fg": {"value": None, "description": "Field goals per game"},
                "fga": {"value": None, "description": "Field goal attempts per game"},
                "fg_pct": {"value": None, "description": "Field goal percentage"},
                "three_p": {"value": None, "description": "Three pointers per game"},
                "three_pa": {
                    "value": None,
                    "description": "Three pointer attempts per game",
                },
                "three_p_pct": {"value": None, "description": "Three point percentage"},
                "two_p": {"value": None, "description": "Two pointers per game"},
                "two_pa": {
                    "value": None,
                    "description": "Two pointer attempts per game",
                },
                "two_p_pct": {"value": None, "description": "Two point percentage"},
                "ft": {"value": None, "description": "Free throws per game"},
                "fta": {"value": None, "description": "Free throw attempts per game"},
                "ft_pct": {"value": None, "description": "Free throw percentage"},
                "orpg": {"value": None, "description": "Offensive rebounds per game"},
                "drpg": {"value": None, "description": "Defensive rebounds per game"},
                "rpg": {"value": None, "description": "Rebounds per game"},
                "apg": {"value": None, "description": "Assists per game"},
                "spg": {"value": None, "description": "Steals per game"},
                "bpg": {"value": None, "description": "Blocks per game"},
                "tpg": {"value": None, "description": "Turnovers per game"},
                "fpg": {"value": None, "description": "Fouls per game"},
                "ppg": {"value": None, "description": "Points per game"},
            },
            "visual_attributes": {
                "accessory": "VISOR",
                "balls": "CHROME",
                "exo_shell": "MATTE_GREEN",
                "finger_tips": "FINGER_TIPS_CHROME",
                "hair": "MOHAWK_BLUE",
                "jersey_trim": "GREEN",
                "background": "BLUE",
                "ear_plate": "GOLD",
                "face": "FACE_BLUE_DIP",
                "guts": "SILVER",
                "jersey": "PURPLE",
                "ensemble": None,
            },
            "attributes": {
                "three_pt_rating": 52.2837943457,
                "interior_2pt_rating": 69.4586862818,
                "midrange_2pt_rating": None,
                "ft_rating": None,
                "drb_rating": 57.5753043195,
                "orb_rating": 91.3331329326,
                "ast_rating": 42.4898009474,
                "physicality_rating": None,
                "interior_defense_rating": 62.6485767275,
                "perimeter_defense_rating": 60.9858495673,
                "longevity_rating": None,
                "hustle_rating": None,
                "bball_iq_rating": None,
                "leadership_rating": None,
                "coachability_rating": None,
            },
            "top_attributes": [
                "orb_rating",
                "midrange_2pt_rating",
                "interior_2pt_rating",
            ],
            "created_at": "2022-09-21T23:42:00.281069Z",
            "updated_at": "2022-09-21T23:42:00.281092Z",
        },
        {
            "uuid": "ec63a159-6539-413b-9754-f0f0ab8d2d40",
            "full_name": "SWOOPSTER-98",
            "canonical": "swoopster-98",
            "token": -1,
            "positions": ["C"],
            "age": 3.0,
            "star_rating": 1.0,
            "free_agent": False,
            "stats": {
                "wins": {"value": 0, "description": "Games won"},
                "losses": {"value": 0, "description": "Games lost"},
                "g": {"value": None, "description": "Games played"},
                "fg": {"value": None, "description": "Field goals per game"},
                "fga": {"value": None, "description": "Field goal attempts per game"},
                "fg_pct": {"value": None, "description": "Field goal percentage"},
                "three_p": {"value": None, "description": "Three pointers per game"},
                "three_pa": {
                    "value": None,
                    "description": "Three pointer attempts per game",
                },
                "three_p_pct": {"value": None, "description": "Three point percentage"},
                "two_p": {"value": None, "description": "Two pointers per game"},
                "two_pa": {
                    "value": None,
                    "description": "Two pointer attempts per game",
                },
                "two_p_pct": {"value": None, "description": "Two point percentage"},
                "ft": {"value": None, "description": "Free throws per game"},
                "fta": {"value": None, "description": "Free throw attempts per game"},
                "ft_pct": {"value": None, "description": "Free throw percentage"},
                "orpg": {"value": None, "description": "Offensive rebounds per game"},
                "drpg": {"value": None, "description": "Defensive rebounds per game"},
                "rpg": {"value": None, "description": "Rebounds per game"},
                "apg": {"value": None, "description": "Assists per game"},
                "spg": {"value": None, "description": "Steals per game"},
                "bpg": {"value": None, "description": "Blocks per game"},
                "tpg": {"value": None, "description": "Turnovers per game"},
                "fpg": {"value": None, "description": "Fouls per game"},
                "ppg": {"value": None, "description": "Points per game"},
            },
            "visual_attributes": {
                "accessory": "VISOR",
                "balls": "CLASSIC_ABA",
                "exo_shell": "MATTE_RED",
                "finger_tips": "FINGER_TIPS_CHROME",
                "hair": "MOHAWK_RED",
                "jersey_trim": "BLUE",
                "background": "GREEN",
                "ear_plate": "GOLD",
                "face": "FACE_STEEL",
                "guts": "SILVER",
                "jersey": "ZEBRA",
                "ensemble": None,
            },
            "attributes": {
                "three_pt_rating": None,
                "interior_2pt_rating": None,
                "midrange_2pt_rating": None,
                "ft_rating": None,
                "drb_rating": None,
                "orb_rating": 73.7499382268,
                "ast_rating": None,
                "physicality_rating": None,
                "interior_defense_rating": 55.0357999278,
                "perimeter_defense_rating": 71.7152202312,
                "longevity_rating": None,
                "hustle_rating": None,
                "bball_iq_rating": None,
                "leadership_rating": None,
                "coachability_rating": None,
            },
            "top_attributes": ["drb_rating", "orb_rating", "perimeter_defense_rating"],
            "created_at": "2022-09-21T23:42:00.094998Z",
            "updated_at": "2022-09-21T23:42:00.095021Z",
        },
    ]

    # The simulator client will return 15 players, 15 players, and then 16
    mocker.patch.object(
        Client,
        "players",
        autospec=True,
        side_effect=[fake_players, fake_players],
    )

    game.players.sync()
    assert game.models.Player.objects.count() == 2

    # Do a duplicate sync. Things should be fine
    game.players.sync()
    assert game.models.Player.objects.count() == 2

    # Sanity check - there should be 1 free agents
    assert game.models.Player.objects.filter(simulated__token__lt=0).count() == 1


@pytest.mark.django_db
def test_update_team_ownership_has_an_owner_and_whose_ownership_hasnt_changed():
    # a token that has an owner and whose ownership hasnt changed
    # Won't be processed.
    build_player_and_owner("0xf407dF7897ADa7B18Be503f6E45b992a682c3906", 20)

    assert game.players.update_team_ownership() == 0


@pytest.mark.django_db
def test_update_team_ownership_a_user_without_an_account_mints_a_token():
    # A user without an account mints a token. That means you have a player without an
    # owner and a transfer to a wallet that doesnt have an associated account.
    # Will not be processed.
    build_player(33)
    build_transfer("0xf407dF7897ADa7B18Be503f6E45b992a682c3906", 33)

    assert game.players.update_team_ownership() == 0


@pytest.mark.django_db
def test_update_team_ownership_a_user_with_an_account_mints_a_token():
    # A user with an account mints a token. That means a player exists without
    # ownership, a team exists without any players, and a transfer is created
    # to establish ownership.
    # Will be processed.
    player = build_player(11)

    _, team = build_user_and_team("0xf407dF7897ADa7B18Be503f6E45b992a682c3906")
    build_transfer(token_id=11, to_address="0xf407dF7897ADa7B18Be503f6E45b992a682c3906")

    assert game.players.update_team_ownership() == 1
    assert game.players.update_team_ownership() == 0
    player.refresh_from_db()
    assert player.team.id == team.id


@pytest.mark.django_db
def test_update_team_ownership_a_user_with_an_account_acquires_a_token_from_another_address():  # noqa E401
    # a user with an account acquires a token from another address
    # Will be processed.
    _, team, player = build_player_and_owner(
        "0xf407dF7897ADa7B18Be503f6E45b992a682c3906", 15
    )

    build_transfer(
        token_id=15,
        from_address="0xf407dF7897ADa7B18Be503f6E45b992a682c3906",
        to_address="0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E",
    )

    _, team = build_user_and_team("0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E")

    assert game.players.update_team_ownership() == 1
    # the job modifies the players, so when it runs again, it modifies nothing
    assert game.players.update_team_ownership() == 0
    player.refresh_from_db()
    assert player.team.id == team.id


@pytest.mark.django_db
def test_update_team_ownership_a_user_without_an_account_acquires_a_token_from_another_address():  # noqa E501
    # a user without an account acquires a token from another address
    # Will be processed.

    _, _, player = build_player_and_owner(
        "0xc0ffee254729296a45a3885639AC7E10F9d54979", 20
    )

    build_transfer(
        token_id=20,
        from_address="0xc0ffee254729296a45a3885639AC7E10F9d54979",
        to_address="0xf407dF7897ADa7B18Be503f6E45b992a682c3906",
    )

    assert game.players.update_team_ownership() == 1
    assert game.players.update_team_ownership() == 0
    player.refresh_from_db()
    assert player.team is None


@pytest.mark.django_db
def test_update_team_ownership_for_wallet_has_an_owner_and_whose_ownership_hasnt_changed():  # noqa E401
    # a token that has an owner and whose ownership hasnt changed
    # Won't be processed.
    build_player_and_owner("0xf407dF7897ADa7B18Be503f6E45b992a682c3906", 20)

    assert (
        game.players.update_team_ownership_for_wallet(
            "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
        )
        == 0
    )


@pytest.mark.django_db
def test_update_team_ownership_for_wallet_a_user_without_an_account_mints_a_token():
    # A user without an account mints a token. That means you have a player without an
    # owner and a transfer to a wallet that doesnt have an associated account.
    # Will not be processed.
    build_player(33)
    build_transfer("0xf407dF7897ADa7B18Be503f6E45b992a682c3906", 33)

    assert (
        game.players.update_team_ownership_for_wallet(
            "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
        )
        == 0
    )


@pytest.mark.django_db
def test_update_team_ownership_for_wallet_a_user_with_an_account_mints_a_token():
    # A user with an account mints a token. That means a player exists without
    # ownership, a team exists without any players, and a transfer is created
    # to establish ownership.
    # Will be processed.
    player = build_player(11)

    _, team = build_user_and_team("0xf407dF7897ADa7B18Be503f6E45b992a682c3906")
    build_transfer(token_id=11, to_address="0xf407dF7897ADa7B18Be503f6E45b992a682c3906")

    assert (
        game.players.update_team_ownership_for_wallet(
            "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
        )
        == 1
    )
    assert (
        game.players.update_team_ownership_for_wallet(
            "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
        )
        == 0
    )
    player.refresh_from_db()
    assert player.team.id == team.id


@pytest.mark.django_db
def test_update_team_ownership_a_user_with_an_account_acquires_a_token_from_another_address():  # noqa E401
    # a user with an account acquires a token from another address
    # Will be processed.
    _, team, player = build_player_and_owner(
        "0xf407dF7897ADa7B18Be503f6E45b992a682c3906", 15
    )

    build_transfer(
        token_id=15,
        from_address="0xf407dF7897ADa7B18Be503f6E45b992a682c3906",
        to_address="0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E",
    )

    _, team = build_user_and_team("0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E")

    assert (
        game.players.update_team_ownership_for_wallet(
            "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E"
        )
        == 1
    )
    # the job modifies the players, so when it runs again, it modifies nothing
    assert (
        game.players.update_team_ownership_for_wallet(
            "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E"
        )
        == 0
    )
    player.refresh_from_db()
    assert player.team.id == team.id


@pytest.mark.django_db
def test_update_team_ownership_for_wallet_a_user_without_an_account_acquires_a_token_from_another_address():  # noqa E501
    # a user without an account acquires a token from another address
    # Will be processed.

    _, _, player = build_player_and_owner(
        "0xc0ffee254729296a45a3885639AC7E10F9d54979", 20
    )

    build_transfer(
        token_id=20,
        from_address="0xc0ffee254729296a45a3885639AC7E10F9d54979",
        to_address="0xf407dF7897ADa7B18Be503f6E45b992a682c3906",
    )

    assert (
        game.players.update_team_ownership_for_wallet(
            "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
        )
        == 1
    )
    assert (
        game.players.update_team_ownership_for_wallet(
            "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
        )
        == 0
    )
    player.refresh_from_db()
    assert player.team is None


@pytest.mark.django_db
def test_update_team_ownership_for_wallet_a_user_acquires_a_token_and_tokens_they_used_to_own_remain_with_their_current_owners():  # noqa E501
    # the problem was that update_team_ownership_for_wallet was returning every player
    # the wallet passed to it ever owned, not just the ones it currently owns.

    # userA owns the player first
    userA, teamA, player1 = build_player_and_owner(
        "0xCAFEBABE4729296a45a3885639AC7E10F9d54979", 44
    )

    userB, teamB = build_user_and_team("0xFFFFFFFF4729296a45a3885639AC7E10F9d54979")

    # userA transfers the player1 to userB
    build_transfer(
        to_address="0xFFFFFFFF4729296a45a3885639AC7E10F9d54979",
        token_id=44,
        from_address="0xCAFEBABE4729296a45a3885639AC7E10F9d54979",
    )

    updates_made_count = game.players.update_team_ownership()
    player1.refresh_from_db()
    # userB owns player1
    assert updates_made_count == 1
    assert player1.team_id == teamB.id

    player2 = build_player(45)

    # userA acquires a new player
    build_transfer(
        to_address="0xCAFEBABE4729296a45a3885639AC7E10F9d54979",
        token_id=45,
        from_address="0x0000000000000000000000000000000000000000",
    )

    # when the job runs for userA, it should only show that the newest player needs its
    # ownership updated
    assert (
        game.players.update_team_ownership_for_wallet(
            "0xCAFEBABE4729296a45a3885639AC7E10F9d54979"
        )
        == 1
    )
    player1.refresh_from_db()
    player2.refresh_from_db()

    assert player1.team_id == teamB.id
    assert player2.team_id == teamA.id


@pytest.mark.django_db
def test_player_acquired_and_moved_in_the_same_block():  # noqa E501
    # the problem was that `update_team_ownership` was bouncing the player back and
    # forth between the team it should have and no owner.

    user, team = build_user_and_team("0xc0ffee254729296a45a3885639AC7E10F9d54979")
    player = build_player(42)

    build_transfer(
        token_id=42,
        from_address="0x0000000000000000000000000000000000000000",
        to_address="0xf407dF7897ADa7B18Be503f6E45b992a682c3906",
        block_number=1000,
        log_index=10,
    )

    build_transfer(
        token_id=42,
        from_address="0xf407dF7897ADa7B18Be503f6E45b992a682c3906",
        to_address="0xc0ffee254729296a45a3885639AC7E10F9d54979",
        block_number=1000,
        log_index=15,
    )

    # the player is not yet owned by anyone until an ownership update runs
    updates_made_count = game.players.update_team_ownership()
    assert updates_made_count == 1
    player.refresh_from_db()
    # now the player is owned by the correct user
    assert player.team_id == team.id

    updates_made_count = game.players.update_team_ownership()
    # the update job is stable, and wont update the ownership
    assert updates_made_count == 0


@pytest.mark.django_db
def test_sync_opensea_player_prices(mocker, settings):
    settings.SMART_CONTRACT_ADDRESS = "0x6447f7d21f19af6c11824b06e3a6618542cedf33"
    eth_to_usd_value = Decimal("1623.85")
    player1_token_id = "1340"
    player1_wei_price = "250000000000000000"

    fake_opensea_listing_response = {
        "next": None,
        "previous": None,
        "orders": [
            {
                "created_date": "2023-05-06T19:11:10.157961",
                "closing_date": "2023-05-13T19:10:53",
                "listing_time": 1683400253,
                "expiration_time": 1684005053,
                "order_hash": "0x8b22c21312f5c1728f99301ae505f298441cd8004490e9b203ec0b7fe8983936",  # noqa: E501
                "protocol_data": {
                    "parameters": {
                        "offerer": "0x4b9f9b3309f375b3ff5ceaa0afc22db88df97f2d",
                        "offer": [
                            {
                                "itemType": 2,
                                "token": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                                "identifierOrCriteria": player1_token_id,
                                "startAmount": "1",
                                "endAmount": "1",
                            }
                        ],
                        "consideration": [
                            {
                                "itemType": 0,
                                "token": "0x0000000000000000000000000000000000000000",
                                "identifierOrCriteria": "0",
                                "startAmount": "243750000000000000",
                                "endAmount": "243750000000000000",
                                "recipient": "0x4B9F9B3309F375B3ff5CeAA0afC22db88dF97F2d",  # noqa: E501
                            },
                            {
                                "itemType": 0,
                                "token": "0x0000000000000000000000000000000000000000",
                                "identifierOrCriteria": "0",
                                "startAmount": "6250000000000000",
                                "endAmount": "6250000000000000",
                                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719",  # noqa: E501
                            },
                        ],
                        "startTime": "1683400253",
                        "endTime": "1684005053",
                        "orderType": 0,
                        "zone": "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
                        "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",  # noqa: E501
                        "salt": "0x360c6ebe00000000000000000000000000000000000000001702c03d1cbc4e11",  # noqa: E501
                        "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",  # noqa: E501
                        "totalOriginalConsiderationItems": 2,
                        "counter": 0,
                    },
                    "signature": None,
                },
                "protocol_address": "0x00000000000000adc04c56bf30ac9d3c0aaf14dc",
                "current_price": player1_wei_price,
                "maker": {
                    "user": 2187224,
                    "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/28.png",  # noqa: E501
                    "address": "0x4b9f9b3309f375b3ff5ceaa0afc22db88df97f2d",
                    "config": "",
                },
                "taker": None,
                "maker_fees": [
                    {
                        "account": {
                            "user": None,
                            "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",  # noqa: E501
                            "address": "0x0000a26b00c1f0df003000390027140000faa719",
                            "config": "",
                        },
                        "basis_points": "250",
                    }
                ],
                "taker_fees": [],
                "side": "ask",
                "order_type": "basic",
                "cancelled": False,
                "finalized": False,
                "marked_invalid": False,
                "remaining_quantity": 1,
                "relay_id": "T3JkZXJWMlR5cGU6OTM2MTA3ODkxOA",
                "criteria_proof": None,
                "maker_asset_bundle": {
                    "assets": [
                        {
                            "id": 656207208,
                            "token_id": player1_token_id,
                            "num_sales": 0,
                            "background_color": None,
                            "image_url": "https://i.seadn.io/gcs/files/b1e829a4582b13ada05eb771a98c887b.png?w=500&auto=format",  # noqa: E501
                            "image_preview_url": "https://i.seadn.io/gcs/files/b1e829a4582b13ada05eb771a98c887b.png?w=500&auto=format",  # noqa: E501
                            "image_thumbnail_url": "https://i.seadn.io/gcs/files/b1e829a4582b13ada05eb771a98c887b.png?w=500&auto=format",  # noqa: E501
                            "image_original_url": f"https://s3.us-west-2.amazonaws.com/images.playswoops.com/{player1_token_id}.png",  # noqa: E501
                            "animation_url": None,
                            "animation_original_url": None,
                            "name": f"SWOOPSTER-{player1_token_id}",
                            "description": f"SWOOPSTER-{player1_token_id}",
                            "external_link": f"https://app.playswoops.com/player-detail/{player1_token_id}",  # noqa: E501
                            "asset_contract": {
                                "address": "0xc211506d58861857c3158af449e832cc5e1e7e7b",
                                "asset_contract_type": "non-fungible",
                                "chain_identifier": "ethereum",
                                "created_date": "2022-05-17T20:15:25.689545",
                                "name": "Swoops",
                                "nft_version": None,
                                "opensea_version": None,
                                "owner": 432688846,
                                "schema_name": "ERC721",
                                "symbol": "SWOOPS",
                                "total_supply": "1500",
                                "description": "Swoops is a blockchain-powered basketball simulation game that allows users to own and operate a 100% unique team, enter real money contests with their squads, and win daily cash prizes. If you’ve ever dreamt of owning, operating and profiting off of your own basketball franchise, this is your chance.\n\nBacked by top investors including Courtside Ventures, Slow VC, Alpaca VC, Gary and AJ Vaynerchuk, Jason Robins (DraftKings CEO), and multiple NBA  ownership groups, Swoops is a play & earn game that looks and feels like daily fantasy basketball but with its own IP and world of Swoopsters (robotic players), each a one-of-one player that evolves and ages over time.",  # noqa: E501
                                "external_link": "http://playswoops.com",
                                "image_url": "https://i.seadn.io/gae/RlyAdnSIksJ8U3CJ8WCRr2SGKCtvoseilRGDHiMpZjotkzM5zTYyfELghcJpI1817q-8WeVlnXkAF5lYV0We4Y9KztaHZBR-CPIgLQ?w=500&auto=format",  # noqa: E501
                                "default_to_fiat": False,
                                "dev_buyer_fee_basis_points": 0,
                                "dev_seller_fee_basis_points": 500,
                                "only_proxied_transfers": False,
                                "opensea_buyer_fee_basis_points": 0,
                                "opensea_seller_fee_basis_points": 250,
                                "buyer_fee_basis_points": 0,
                                "seller_fee_basis_points": 750,
                                "payout_address": "0x45a74ffca27ed901e2fa110223d1f65ec30b9f24",  # noqa: E501
                            },
                            "permalink": f"https://opensea.io/assets/ethereum/0xc211506d58861857c3158af449e832cc5e1e7e7b/{player1_token_id}",  # noqa: E501
                            "collection": {
                                "banner_image_url": "https://i.seadn.io/gae/hJdn-NkB-Ig1it7PKIxO9VhMxR6haUEG6daTt2UmlDiKt_xUVaDZj1g3GHJ6maE1awbchS9PYVVOWrPxG06KNIGjafhKX634Q821JQ?w=500&auto=format",  # noqa: E501
                                "chat_url": None,
                                "created_date": "2022-05-20T17:28:53.175961+00:00",
                                "default_to_fiat": False,
                                "description": "Swoops is a blockchain-powered basketball simulation game that allows users to own and operate a 100% unique team, enter real money contests with their squads, and win daily cash prizes. If you’ve ever dreamt of owning, operating and profiting off of your own basketball franchise, this is your chance.\n\nBacked by top investors including Courtside Ventures, Slow VC, Alpaca VC, Gary and AJ Vaynerchuk, Jason Robins (DraftKings CEO), and multiple NBA ownership groups, Swoops is a play & earn game that looks and feels like daily fantasy basketball but with its own IP and world of Swoopsters (robotic players), each a one-of-one player that evolves and ages over time.",  # noqa: E501
                                "dev_buyer_fee_basis_points": "0",
                                "dev_seller_fee_basis_points": "500",
                                "discord_url": "https://discord.gg/swoops",
                                "display_data": {
                                    "card_display_style": "contain",
                                    "images": None,
                                },
                                "external_url": "http://playswoops.com",
                                "featured": False,
                                "featured_image_url": "https://i.seadn.io/gae/s9QNWbaQ0jpYDFhOeSrnCmteaemW4S_jE9KRS1fbYC9wsYFBnaVML_H4tGfJT9xx7HLEla5R6p5-oDOIS6LcNJ40459MXvvu1lpaAMk?w=500&auto=format",  # noqa: E501
                                "hidden": False,
                                "safelist_request_status": "verified",
                                "image_url": "https://i.seadn.io/gae/RlyAdnSIksJ8U3CJ8WCRr2SGKCtvoseilRGDHiMpZjotkzM5zTYyfELghcJpI1817q-8WeVlnXkAF5lYV0We4Y9KztaHZBR-CPIgLQ?w=500&auto=format",  # noqa: E501
                                "is_subject_to_whitelist": False,
                                "large_image_url": "https://i.seadn.io/gae/s9QNWbaQ0jpYDFhOeSrnCmteaemW4S_jE9KRS1fbYC9wsYFBnaVML_H4tGfJT9xx7HLEla5R6p5-oDOIS6LcNJ40459MXvvu1lpaAMk?w=500&auto=format",  # noqa: E501
                                "medium_username": None,
                                "name": "PlaySwoops",
                                "only_proxied_transfers": False,
                                "opensea_buyer_fee_basis_points": "0",
                                "opensea_seller_fee_basis_points": 250,
                                "payout_address": "0x45a74ffca27ed901e2fa110223d1f65ec30b9f24",  # noqa: E501
                                "require_email": False,
                                "short_description": None,
                                "slug": "swoops",
                                "telegram_url": None,
                                "twitter_username": None,
                                "instagram_username": None,
                                "wiki_url": None,
                                "is_nsfw": False,
                                "fees": {
                                    "seller_fees": {
                                        "0x45a74ffca27ed901e2fa110223d1f65ec30b9f24": 500  # noqa: E501
                                    },
                                    "opensea_fees": {
                                        "0x0000a26b00c1f0df003000390027140000faa719": 250  # noqa: E501
                                    },
                                },
                                "is_rarity_enabled": False,
                                "is_creator_fees_enforced": False,
                            },
                            "decimals": None,
                            "token_metadata": f"https://api.playswoops.com/api/baller/{player1_token_id}",  # noqa: E501
                            "is_nsfw": False,
                            "owner": None,
                        }
                    ],
                    "maker": None,
                    "slug": None,
                    "name": None,
                    "description": None,
                    "external_link": None,
                    "asset_contract": None,
                    "permalink": None,
                    "seaport_sell_orders": None,
                },
                "taker_asset_bundle": {
                    "assets": [
                        {
                            "id": 13689077,
                            "token_id": "0",
                            "num_sales": 4,
                            "background_color": None,
                            "image_url": "https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg",  # noqa: E501
                            "image_preview_url": "https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg",  # noqa: E501
                            "image_thumbnail_url": "https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg",  # noqa: E501
                            "image_original_url": "https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg",  # noqa: E501
                            "animation_url": None,
                            "animation_original_url": None,
                            "name": "Ether",
                            "description": "",
                            "external_link": None,
                            "asset_contract": {
                                "address": "0x0000000000000000000000000000000000000000",
                                "asset_contract_type": "fungible",
                                "chain_identifier": "ethereum",
                                "created_date": "2019-08-02T23:41:09.503168",
                                "name": "Ether",
                                "nft_version": None,
                                "opensea_version": None,
                                "owner": None,
                                "schema_name": "ERC20",
                                "symbol": "ETH",
                                "total_supply": None,
                                "description": None,
                                "external_link": None,
                                "image_url": None,
                                "default_to_fiat": False,
                                "dev_buyer_fee_basis_points": 0,
                                "dev_seller_fee_basis_points": 0,
                                "only_proxied_transfers": False,
                                "opensea_buyer_fee_basis_points": 0,
                                "opensea_seller_fee_basis_points": 250,
                                "buyer_fee_basis_points": 0,
                                "seller_fee_basis_points": 250,
                                "payout_address": None,
                            },
                            "permalink": "https://opensea.io/assets/ethereum/0x0000000000000000000000000000000000000000/0",  # noqa: E501
                            "collection": {
                                "banner_image_url": None,
                                "chat_url": None,
                                "created_date": "2022-08-11T13:34:04.673691+00:00",
                                "default_to_fiat": False,
                                "description": None,
                                "dev_buyer_fee_basis_points": "0",
                                "dev_seller_fee_basis_points": "0",
                                "discord_url": None,
                                "display_data": {
                                    "card_display_style": "contain",
                                    "images": [],
                                },
                                "external_url": None,
                                "featured": False,
                                "featured_image_url": None,
                                "hidden": True,
                                "safelist_request_status": "not_requested",
                                "image_url": None,
                                "is_subject_to_whitelist": False,
                                "large_image_url": None,
                                "medium_username": None,
                                "name": "OpenSea PaymentAssets",
                                "only_proxied_transfers": False,
                                "opensea_buyer_fee_basis_points": "0",
                                "opensea_seller_fee_basis_points": 250,
                                "payout_address": None,
                                "require_email": False,
                                "short_description": None,
                                "slug": "opensea-paymentassets",
                                "telegram_url": None,
                                "twitter_username": None,
                                "instagram_username": None,
                                "wiki_url": None,
                                "is_nsfw": False,
                                "fees": {
                                    "seller_fees": {},
                                    "opensea_fees": {
                                        "0x0000a26b00c1f0df003000390027140000faa719": 250  # noqa: E501
                                    },
                                },
                                "is_rarity_enabled": False,
                                "is_creator_fees_enforced": False,
                            },
                            "decimals": 18,
                            "token_metadata": None,
                            "is_nsfw": False,
                            "owner": None,
                        }
                    ],
                    "maker": None,
                    "slug": None,
                    "name": None,
                    "description": None,
                    "external_link": None,
                    "asset_contract": None,
                    "permalink": None,
                    "seaport_sell_orders": None,
                },
            }
        ],
    }

    mocker.patch(
        "game.players.get_eth_to_usd_conversion_factor", return_value=eth_to_usd_value
    )

    mocker.patch.object(
        OpenSeaAPI,
        "retrieve_listings_by_created_date",
        return_value=fake_opensea_listing_response,
    )

    build_player(token_id=player1_token_id)

    game.players.sync_opensea_player_prices()

    assert round(
        Decimal(
            game.models.Player.objects.get(
                simulated__token=player1_token_id
            ).opensea_price_usd
        ),
        3,
    ) == round(convert_wei_to_eth(player1_wei_price) * eth_to_usd_value, 3)

    fake_opensea_listing_response = {"next": None, "previous": None, "orders": []}
    mocker.patch.object(
        OpenSeaAPI,
        "retrieve_listings_by_created_date",
        return_value=fake_opensea_listing_response,
    )

    game.players.sync_opensea_player_prices()
    assert (
        game.models.Player.objects.get(
            simulated__token=player1_token_id
        ).opensea_price_usd
        is None
    )

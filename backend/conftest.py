import datetime
import json
import random
import secrets
import socket
import uuid
from decimal import Decimal
from unittest import mock
from unittest.mock import MagicMock

import boto3
import ddf
import pytest
from django.conf import settings
from django.utils import timezone
from django.utils.crypto import get_random_string
from django_otp import DEVICE_ID_SESSION_KEY
from eth_account import Account
from moto import mock_s3

import game.models
import game.utils
import simulator.client
import simulator.models

# NOTE:
# This is the root conftest: limit the fixtures here to only
# those that are very broad.


@pytest.fixture(autouse=True)
def mock_player_stats(mocker):
    player_stats = mock.Mock()
    player_stats.id = "023b513c-c317-4d10-b417-bc11703dd533"
    player_stats.token = 9999
    player_stats.full_name = "Test-Player-9999"
    player_stats.age = 2
    player_stats.star_rating = 2
    player_stats.g = 0.5
    player_stats.fg = 3.9954337
    player_stats.fga = 10.2054794520
    player_stats.fg_pct = 0.39149888
    player_stats.three_p = 0.98630136
    player_stats.three_pa = 3.0913242
    player_stats.three_p_pct = 0.319054
    player_stats.two_p = 3.00913242
    player_stats.two_pa = 7.114155
    player_stats.two_p_pct = 0.4229781
    player_stats.ft = 2.525114155
    player_stats.fta = 3.2557077
    player_stats.ft_pct = 0.775596072
    player_stats.orpg = 3.41095890
    player_stats.drpg = 1356.0000
    player_stats.rpg = 9.6027397
    player_stats.apg = 7.8995433
    player_stats.spg = 0.447488584
    player_stats.bpg = 0.771689497
    player_stats.tpg = 1.310502283
    player_stats.fpg = 4.2054794
    player_stats.ppg = 11.50228
    player_stats.wins = 5
    player_stats.losses = 10
    player_stats.accessory = ""
    player_stats.balls = ""
    player_stats.exo_shell = ""
    player_stats.finger_tips = ""
    player_stats.hair = ""
    player_stats.jersey_trim = ""
    player_stats.background = ""
    player_stats.ear_plate = ""
    player_stats.face = ""
    player_stats.guts = ""
    player_stats.jersey = ""
    player_stats.ensemble = ""
    player_stats.three_pt_rating = 0.0
    player_stats.interior_2pt_rating = 0.0
    player_stats.midrange_2pt_rating = 0.0
    player_stats.ft_rating = 0.0
    player_stats.drb_rating = 0.0
    player_stats.orb_rating = 0.0
    player_stats.ast_rating = 0.0
    player_stats.physicality_rating = 0.0
    player_stats.interior_defense_rating = 0.0
    player_stats.perimeter_defense_rating = 0.0
    player_stats.longevity_rating = 0.0
    player_stats.hustle_rating = 0.0
    player_stats.bball_iq_rating = 0.0
    player_stats.leadership_rating = 0.0
    player_stats.coachability_rating = 0.0
    player_stats.top_attribute_1 = ""
    player_stats.top_attribute_2 = ""
    player_stats.top_attribute_3 = ""
    player_stats.position_1 = ""
    player_stats.position_2 = ""
    player_stats.positions = ""
    player_stats.top_attributes = ""
    player_stats.team = ""
    player_stats.first_named_on = datetime.datetime.now()
    player_stats.ts_pct = 0.55

    mocker.patch(
        (
            "game.serializers.simulator.model_views"
            ".CurrentSeasonPlayerStatsViewProxy.objects.by_player_token"
        ),
        return_value=player_stats,
    )

    mocker.patch(
        "game.serializers.simulator.model_views.AllTimePlayerStatsViewProxy",
        return_value=player_stats,
    )


@pytest.fixture(autouse=True)
def mock_team_stats(mocker):
    team_stats = mock.Mock()
    team_stats.wins = 5
    team_stats.losses = 10
    team_stats.played_today = 4
    team_stats.played_this_week = 5
    team_stats.won_this_week = 3
    team_stats.total_sp = 200
    team_stats.rotating_player_points = 0
    team_stats.rotating_team_blocks = 0
    team_stats.rotating_player_rebounds = 0
    team_stats.rotating_team_assists = 0
    team_stats.rotating_player_blocks = 0
    team_stats.rotating_player_assists = 0
    team_stats.rotating_team_steals = 0
    team_stats.rotating_player_three_p = 0
    team_stats.rotating_team_points = 0
    team_stats.mm_games_this_week = 5
    mocker.patch(
        (
            "game.serializers.simulator.model_views"
            ".CurrentSeasonTeamSPViewProxy.objects.by_team_id"
        ),
        return_value=team_stats,
    )


@pytest.fixture(autouse=True)
def mock_team_leaderboard(mocker):
    mocker.patch(
        "game.views.load_data_from_sql",
        return_value=[
            {
                "team_id": 4,
                "name": "Swoopster 5 is Alive",
                "wins": 5,
                "losses": 1,
                "win_percentage": 75.4,
                "ppg": 3.4,
                "opp_ppg": 2.2,
                "diff": 4.2,
                "streak": "W2",
                "l10_wins": 2,
                "l10_losses": 0,
                "player_count": 3,
                "total_sp": 200,
                "played_this_week": 10,
                "mm_games_this_week": 5,
            }
        ],
    )


@pytest.fixture(autouse=True)
def use_dummy_cache_backend(settings):
    settings.CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.dummy.DummyCache",
        }
    }

    # IMPORTANT - because this cache doesn't actually do anything,
    # throttling (which keeps track using a cache) is effectively disabled
    # for ALL tests.
    # TODO - make more explicit and adjust REST_FRAMEWORK
    # entry in settings.py to remove throttling settings.


@pytest.fixture
def client_user():
    """A test user that can be used with an API client"""
    user = ddf.G(
        settings.AUTH_USER_MODEL,
        email="email@email.com",
        wallet_address="0xD2623826CAFEC0bbba1876d61Fed19438df25610",
        is_verified=True,
    )
    user.set_password("password")
    user.save()
    return user


@pytest.fixture
def authed_client(client, client_user):
    """An API client where session authentication is valid"""
    client.force_login(client_user)
    return client


@pytest.fixture
def otp_auth_client(client):
    u = ddf.G("accounts.User", is_staff=True, is_superuser=True)
    client.force_login(u)

    dev = u.staticdevice_set.create()
    dev.token_set.create(token="verified")
    session = client.session
    session[DEVICE_ID_SESSION_KEY] = dev.persistent_id
    session.save()

    return client


class NetworkException(Exception):
    pass


class block_network(socket.socket):
    def __init__(self, *args, **kwargs):
        raise NetworkException("Network call blocked.")


@pytest.fixture(scope="module", autouse=True)
def mock_call_to_simulator_to_create_games():
    simulator.client.Client.create_game = MagicMock(return_value={"uuid": uuid.uuid4()})


@pytest.fixture(scope="module", autouse=True)
def turn_off_network_access():
    """Turn off network access in tests by default"""
    orig_value = socket.socket
    socket.socket = block_network
    yield
    socket.socket = orig_value


def expected_uuid():
    return uuid.UUID("urn:uuid:fc0c2354-5f33-4fe9-8f6f-cff393a517cc")


def unexpected_uuid():
    return uuid.UUID("urn:uuid:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")


def block_number_generator():
    for i in range(2000, 5000):
        yield i


def log_index_generator():
    for i in range(1, 50000):
        yield i


def token_id_generator():
    for i in range(1000):
        yield str(i)


def freeagent_token_id_generator():
    for i in range(-1, -1000, -1):
        yield str(i)


def free_agent_token_id_generator():
    for i in range(-1, -1000, -1):
        yield str(i)


def nonce_generator():
    for i in range(1000):
        yield i


log_index_generator = log_index_generator()
block_generator = block_number_generator()
token_id_generator = token_id_generator()
nonce_generator = nonce_generator()
free_agent_token_id_generator = free_agent_token_id_generator()


def generate_wallet_address():
    return Account.from_key("0x" + secrets.token_hex(32)).address


def build_player_with_owner_who_doesnt_have_an_account(
    token_id,
    to_address=None,
    from_address="0x0000000000000000000000000000000000000000",
):
    player = build_player(token_id)

    transfer_that_acquires_the_player = build_transfer(
        to_address=to_address if to_address else generate_wallet_address(),
        token_id=token_id,
        from_address=from_address,
    )
    return (player, transfer_that_acquires_the_player)


def build_game(
    status=game.models.Contest.Status.OPEN,
    kind=game.models.Contest.Kind.HEAD_TO_HEAD,
    lineup1=None,
    lineup2=None,
    tokens_required=None,
):
    return game.models.Game.objects.create(
        contest=game.models.Contest.objects.create(
            kind=kind,
            status=status,
            tokens_required=tokens_required,
        ),
        lineup_1=lineup1,
        lineup_2=lineup2,
    )


def create_box_score():
    return ddf.G("simulator.BoxScore")


def build_results(game_obj):
    game_obj.contest.status = game.models.Contest.Status.COMPLETE
    game_obj.contest.save()

    game_obj.simulation.result = simulator.models.Result.objects.create(
        lineup_1_score=100,
        lineup_2_score=77,
        lineup_1_box_score=create_box_score(),
        lineup_1_player_1_box_score=create_box_score(),
        lineup_1_player_2_box_score=create_box_score(),
        lineup_1_player_3_box_score=create_box_score(),
        lineup_1_player_4_box_score=create_box_score(),
        lineup_1_player_5_box_score=create_box_score(),
        lineup_2_box_score=create_box_score(),
        lineup_2_player_1_box_score=create_box_score(),
        lineup_2_player_2_box_score=create_box_score(),
        lineup_2_player_3_box_score=create_box_score(),
        lineup_2_player_4_box_score=create_box_score(),
        lineup_2_player_5_box_score=create_box_score(),
    )

    game_obj.simulation.save()
    return game_obj.simulation.result


def build_game_reservation(game_obj, team, is_deleted=False, expired=False):
    return game.models.Reservation.objects.create(
        game=game_obj,
        team=team,
        expires_at=timezone.now() - timezone.timedelta(minutes=5)
        if expired
        else timezone.now() + timezone.timedelta(minutes=5),
        deleted=is_deleted,
    )


def build_tournament_reservation(tournament_obj, team, is_deleted=False, expired=False):
    return game.models.TournamentReservation.objects.create(
        tournament=tournament_obj,
        team=team,
        expires_at=timezone.now() - timezone.timedelta(minutes=5)
        if expired
        else timezone.now() + timezone.timedelta(minutes=5),
        deleted=is_deleted,
    )


def build_lineup(team, players=[]):
    players_to_use = players[:5] + [
        build_player_with_ownership(next(token_id_generator), team)
        for i in range(5 - len(players[:5]))
    ]

    return game.models.Lineup.objects.create(
        team=team,
        player_1=players_to_use[0],
        player_2=players_to_use[1],
        player_3=players_to_use[2],
        player_4=players_to_use[3],
        player_5=players_to_use[4],
    )


def build_player_and_owner(wallet_address=None, token_id=None):
    user, team = build_user_and_team(wallet_address)
    player = build_player_with_ownership(
        token_id if token_id else next(token_id_generator), team
    )
    return user, team, player


def build_player_with_ownership(
    token_id,
    team,
    position1=None,
    position2=None,
    kind=simulator.models.Player.Kind.ON_CHAIN,
):
    player = build_player(token_id, position1, position2, kind=kind)
    player.team = team
    player.save()
    build_transfer(team.owner.wallet_address, token_id)
    return player


def build_transfer(
    to_address,
    token_id,
    from_address="0x0000000000000000000000000000000000000000",
    block_number=None,
    log_index=None,
):
    return ddf.G(
        "eth.Transfer",
        to_address=to_address,
        from_address=from_address,
        token=token_id,
        block=block_number if block_number else next(block_generator),
        log_index=log_index if log_index else next(log_index_generator),
    )


def build_player(
    token_id,
    position1=None,
    position2=None,
    kind=simulator.models.Player.Kind.ON_CHAIN,
):
    simulated_player = ddf.G(
        "simulator.Player",
        token=token_id,
        age=2,
        position_1=position1,
        position_2=position2,
        kind=kind,
    )

    ddf.G(
        "simulator.PlayerProgression",
        player=simulated_player,
        interior_defense_delta=1.5,
        perimeter_defense_delta=1.5,
        longevity_delta=1.5,
        hustle_delta=1.5,
        bball_iq_delta=1.5,
        leadership_delta=1.5,
        coachability_delta=1.5,
        newly_revealed_ratings=["drb", "ft"],
    )

    simulated_player.save()
    game_player = ddf.G("game.Player", simulated=simulated_player)
    game_player.save()
    return game_player


def build_user_and_team(wallet_address=None):
    user = build_user(wallet_address if wallet_address else generate_wallet_address())
    team = build_team(user)
    return user, team


def build_user(wallet_address=None):
    user = ddf.G(
        settings.AUTH_USER_MODEL,
        email="email.{}@email.com".format(get_random_string(length=5)),
        wallet_address=wallet_address if wallet_address else generate_wallet_address(),
    )
    user.set_password("password")
    user.is_verified = True
    user.save()

    return user


def build_team(owner):
    team = ddf.G("game.Team", owner=owner)
    team.save()
    return team


def build_tournament(
    name,
    payout=100,
    meta=None,
    kind=None,
    size=4,
    lineup_submission_start=timezone.now() - timezone.timedelta(days=2),
    lineup_submission_cutoff=timezone.now() + timezone.timedelta(days=7),
    lineup_reveal_date=timezone.now() + timezone.timedelta(days=7),
    start_date=timezone.now() + timezone.timedelta(days=7),
    public_publish_datetime=timezone.now() + timezone.timedelta(days=7),
    end_date=timezone.now() + timezone.timedelta(days=14),
    tokens_required=1,
    status=None,
    visibility_at=timezone.now() - timezone.timedelta(days=1),
):
    if status is None:
        status = game.models.Contest.Status.OPEN
    contest = ddf.G(
        "game.Contest",
        kind=game.models.Contest.Kind.TOURNAMENT,
        tokens_required=tokens_required,
        status=status,
    )

    validated_meta = meta
    if validated_meta is None:
        validated_meta = {
            "payout_breakdown_usd": [100],
            "max_games_per_round": [2],
        }

    tournament = ddf.G(
        "game.Tournament",
        name=name,
        size=size,
        kind=kind or game.models.Tournament.Kind.END_OF_SEASON,
        lineup_submission_start=lineup_submission_start,
        lineup_submission_cutoff=lineup_submission_cutoff,
        public_publish_datetime=public_publish_datetime,
        start_date=start_date,
        end_date=end_date,
        payout=payout,
        contest=contest,
        meta=json.dumps(validated_meta),
        visibility_at=visibility_at,
    )
    return contest, tournament


def build_full_tournament_bracket(
    name,
    payout=100,
    tournament_size=4,
    max_rounds_completed=2,
    games_in_series=1,
    kind=None,
    lineup_submission_start=timezone.now() - timezone.timedelta(days=2),
    lineup_submission_cutoff=timezone.now() + timezone.timedelta(days=7),
    lineup_reveal_date=timezone.now() + timezone.timedelta(days=7),
    start_date=timezone.now() + timezone.timedelta(days=7),
    end_date=timezone.now() + timezone.timedelta(days=14),
    visibility=None,
    public_publish_datetime=timezone.now() + timezone.timedelta(days=21),
    status=None,
    meta=None,
):
    # tournaments must be size 2^n
    assert tournament_size % 2 == 0

    round_count = game.utils.calculate_round_count(tournament_size)
    incomplete_round_count = 0

    if round_count > max_rounds_completed:
        completed_round_count = max_rounds_completed
        incomplete_round_count = round_count - completed_round_count
    else:
        completed_round_count = round_count

    contest, tournament = build_tournament(
        name,
        payout=payout,
        size=tournament_size,
        kind=kind,
        public_publish_datetime=public_publish_datetime,
        lineup_submission_start=lineup_submission_start,
        lineup_submission_cutoff=lineup_submission_cutoff,
        start_date=start_date,
        end_date=end_date,
        status=status,
        meta=meta
        or {
            "payout_breakdown_usd": [payout],
            "max_games_per_round": [games_in_series for i in range(0, games_in_series)],
        },
    )

    teams = []
    entries = []
    for n in range(0, tournament_size):
        _, team = build_user_and_team()
        teams.append(team)

        entries.append(
            ddf.G("game.TournamentEntry", team=team, tournament=tournament, seed=n + 1)
        )

    for i in range(0, completed_round_count):
        round = ddf.G(
            "game.Round",
            tournament=tournament,
            stage=i,
            status=game.models.Round.Status.FINISHED,
        )

        series_count = game.utils.calculate_series_count(tournament_size, i)

        team_offset = int(2**i) - 1

        # always the second team in the game wins for the next round
        for j in range(0, series_count):
            team_1 = teams[team_offset]
            team_2 = teams[team_offset + int(2**i)]

            entry_1 = entries[team_offset]
            entry_2 = entries[team_offset + int(2**i)]

            team_offset += 2 * int(2**i)

            games = []
            for k in range(0, games_in_series):
                team_score_1 = random.randint(80, 125)
                team_score_2 = random.randint(team_score_1 + 1, team_score_1 + 10)
                games.append(
                    ddf.G(
                        "game.Game",
                        contest=contest,
                        lineup_1=ddf.F(team=team_1),
                        lineup_2=ddf.F(team=team_2),
                        visibility=visibility or game.models.Game.Visibility.HIDDEN,
                        simulation=ddf.G(
                            "simulator.Simulation",
                            status=simulator.models.Simulation.Status.FINISHED,
                            result=ddf.G(
                                "simulator.Result",
                                lineup_1_score=team_score_1,
                                lineup_2_score=team_score_2,
                                lineup_1_box_score=create_box_score(),
                                lineup_1_player_1_box_score=create_box_score(),
                                lineup_1_player_2_box_score=create_box_score(),
                                lineup_1_player_3_box_score=create_box_score(),
                                lineup_1_player_4_box_score=create_box_score(),
                                lineup_1_player_5_box_score=create_box_score(),
                                lineup_2_box_score=create_box_score(),
                                lineup_2_player_1_box_score=create_box_score(),
                                lineup_2_player_2_box_score=create_box_score(),
                                lineup_2_player_3_box_score=create_box_score(),
                                lineup_2_player_4_box_score=create_box_score(),
                                lineup_2_player_5_box_score=create_box_score(),
                            ),
                        ),
                    )
                )

            series = ddf.G(
                "game.Series",
                round=round,
                entry_1=entry_1,
                entry_2=entry_2,
                status=game.models.Series.Status.FINISHED,
            )

            for game_instance in games:
                series.games.add(game_instance)

    # insert incomplete rounds
    for i in range(
        completed_round_count, completed_round_count + incomplete_round_count
    ):
        round = ddf.G("game.Round", tournament=tournament, stage=i)
        round_size = int(tournament_size / int(2**i))
        for j in range(0, round_size):
            series = ddf.G(
                "game.Series",
                round=round,
            )

    return tournament


def build_tournament_payouts(tournament, payout_statuses=None):
    winners = game.models.TournamentEntry.objects.for_tournament_in_placement_order(
        tournament.id
    )

    payouts_to_create = sorted(
        json.loads(tournament.meta)["payout_breakdown_usd"], reverse=True
    )

    if payout_statuses is None:
        payout_statuses_to_use = [
            game.models.PayoutStatus.CONFIRMED for i in range(0, len(payouts_to_create))
        ]
    else:
        payout_statuses_to_use = payout_statuses

    payouts_to_create = payouts_to_create[: len(payout_statuses_to_use)]

    for index, payout in enumerate(payouts_to_create):
        nonce = next(nonce_generator)
        conversion_rate = Decimal("0.0000000025")
        payout = game.models.Payout.objects.create(
            amount_wei=payout * conversion_rate,
            amount_usd=payout,
            usd_to_eth_conversion_rate=conversion_rate,
            team=winners[index].team,
            to_address=winners[index].team.owner.wallet_address,
            status=payout_statuses_to_use[index],
            transaction_hash="0x" + f"{nonce}".rjust(64, "0"),
            nonce=nonce,
        )
        game.models.TournamentPayout.objects.create(
            tournament=tournament, payout=payout
        )


def build_completed_tournament_with_payout_statuses(
    name,
    payout=100,
    meta=None,
    kind=None,
    size=4,
    lineup_submission_start=timezone.now() - timezone.timedelta(days=2),
    lineup_submission_cutoff=timezone.now() + timezone.timedelta(days=7),
    lineup_reveal_date=timezone.now() + timezone.timedelta(days=7),
    start_date=timezone.now() + timezone.timedelta(days=7),
    public_publish_datetime=timezone.now() + timezone.timedelta(days=7),
    end_date=timezone.now() + timezone.timedelta(days=14),
    payout_statuses=[],
):
    tournament = build_full_tournament_bracket(
        name,
        payout=payout,
        tournament_size=size,
        kind=kind,
        meta=meta or {"payout_breakdown_usd": [70, 20, 10], "max_games_per_round": [3]},
        lineup_submission_start=lineup_submission_start,
        lineup_submission_cutoff=lineup_submission_cutoff,
        lineup_reveal_date=lineup_reveal_date,
        start_date=start_date,
        end_date=end_date,
        visibility=game.models.Game.Visibility.PUBLIC,
        public_publish_datetime=public_publish_datetime,
        status=game.models.Contest.Status.COMPLETE,
    )
    tournament.finalized_on = timezone.now() - timezone.timedelta(days=1)
    tournament.save()

    build_tournament_payouts(tournament, payout_statuses)

    return tournament


def build_fully_completed_and_paid_out_tournament(
    name,
    payout=100,
    meta=None,
    kind=None,
    size=4,
    lineup_submission_start=timezone.now() - timezone.timedelta(days=2),
    lineup_submission_cutoff=timezone.now() + timezone.timedelta(days=7),
    lineup_reveal_date=timezone.now() + timezone.timedelta(days=7),
    start_date=timezone.now() + timezone.timedelta(days=7),
    public_publish_datetime=timezone.now() + timezone.timedelta(days=7),
    end_date=timezone.now() + timezone.timedelta(days=14),
    visibility_at=timezone.now() - timezone.timedelta(days=1),
):
    tournament = build_full_tournament_bracket(
        name,
        payout=payout,
        tournament_size=size,
        kind=kind,
        lineup_submission_start=lineup_submission_start,
        lineup_submission_cutoff=lineup_submission_cutoff,
        lineup_reveal_date=lineup_reveal_date,
        start_date=start_date,
        end_date=end_date,
        visibility=game.models.Game.Visibility.PUBLIC,
        public_publish_datetime=public_publish_datetime,
        status=game.models.Contest.Status.COMPLETE,
    )
    tournament.finalized_on = timezone.now() - timezone.timedelta(hours=1)
    tournament.paid_out = True
    tournament.save()

    build_tournament_payouts(tournament)


@pytest.fixture
def s3_client():
    with mock_s3():
        conn = boto3.client("s3")
        conn.create_bucket(Bucket=settings.AWS_IMAGES_BUCKET_NAME)
        conn.create_bucket(Bucket=settings.AWS_UGC_BUCKET_NAME)
        yield conn

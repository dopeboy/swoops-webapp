# Verifies that management commands can run
import ddf
import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from conftest import (
    build_player,
    build_player_with_ownership,
    build_team,
    build_tournament,
    build_user_and_team,
    token_id_generator,
)


def test_sync_game_players(mocker):
    patched_sync = mocker.patch("game.players.sync", autospec=True)
    call_command("sync_game_players")
    patched_sync.assert_called_once_with()


@pytest.mark.django_db
def test_generate_test_data():
    call_command(
        "generate_test_data",
        "--wallet",
        "0xf407dF7897ADa7B18Be503f6E45b992a682c3906",
        "--generate-players",
    )


@pytest.mark.django_db
def test_deactivate_users():
    _, team_1 = build_user_and_team()
    _, team_2 = build_user_and_team()

    call_command("deactivate_users", team_ids=[team_1.id, team_2.id])

    assert get_user_model().objects.filter(email__contains="__DELETED").count() == 2


@pytest.mark.django_db
def test_tournament_entry_player_ownership(client_user, mocker):
    mock_notify_not_owned_player = mocker.patch(
        "game.management.commands.check_tournament_entry_player_ownership.Command.notify_not_owned_player"  # noqa: E501
    )

    _, tournament = build_tournament(
        "Swoops Bowl",
        payout=100,
        meta={"rounds": 2, "series": [5, 7], "payout_breakdown_usd": [100]},
    )

    client_team = build_team(client_user)

    # create 4 players user owns
    players = [
        build_player_with_ownership(next(token_id_generator), client_team)
        for i in range(3)
    ]

    # create 5 player user doesnt own
    players.append(build_player(next(token_id_generator)))
    players.append(build_player(-1))

    lineup = ddf.G(
        "game.Lineup",
        team=client_team,
        player_1=players[0],
        player_2=players[1],
        player_3=players[2],
        player_4=players[3],
        player_5=players[4],
    )

    ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=client_team,
        seed=1,
        lineup=lineup,
    )

    call_command(
        "check_tournament_entry_player_ownership",
        "--tournament_id",
        tournament.id,
    )

    mock_notify_not_owned_player.assert_called_once()

# Verifies that management commands can run


import ddf
import pytest
from django.core.management import call_command

from simulator.client import Client


@pytest.fixture(autouse=True)
def use_real_client(settings):
    settings.SIMULATOR_CLIENT = "simulator.client.Client"


def test_update_simulated_games(mocker):
    patched_update = mocker.patch("simulator.processing.update_games", autospec=True)
    call_command("update_simulated_games")
    patched_update.assert_called_once_with()


@pytest.mark.django_db
def test_check_all_players_exist_within_sim(mocker, settings):

    mock_capture_message = mocker.patch(
        "simulator.management.commands.check_all_players_exist_within_sim.capture_message",  # noqa: E501
    )

    ddf.G(
        "game.Player",
        simulated=ddf.F(
            token=12345,
        ),
    )

    ddf.G(
        "game.Player",
        simulated=ddf.F(token=5),
    )

    mocker.patch.object(
        Client,
        "players",
        return_value=[
            {
                "uuid": "090bf6c9-f7b7-448f-8753-c484387e83c7",
                "full_name": "Will Slaprock",
                "canonical": "swoopster-99",
                "token": 12345,
                "positions": ["C", "F"],
                "age": 7.0,
                "star_rating": 1.0,
                "free_agent": False,
            }
        ],
    )

    call_command("check_all_players_exist_within_sim")
    assert mock_capture_message.call_count == 1


@pytest.mark.django_db
def test_validate_player_agg_stats(mocker, settings):

    call_command("validate_player_agg_stats")

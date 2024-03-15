from decimal import Decimal
from unittest.mock import MagicMock

import ddf
import pytest

import game.models
import simulator.tasks


@pytest.mark.django_db
def test_update_simulated_games():
    simulator.tasks.update_simulated_games()


@pytest.mark.django_db
def test_calc_players_stats(mocker):
    simulator.client.get = MagicMock(return_value=simulator.client.MockClient())

    # this uuid value was taken from the player_uuids param of MockClient
    # from the retrieve_player_stats method
    player_uuid = "090bf6c9-f7b7-448f-8753-c484387e83c7"
    ddf.G(
        "game.Player",
        simulated=ddf.F(
            uuid=str(player_uuid),
            age=3,
        ),
    )

    simulator.tasks.calc_players_stats()

    p = game.models.Player.objects.get(simulated__uuid=player_uuid)

    assert p.wins == 16
    assert p.losses == 11

    simulated_player = p.simulated
    assert simulated_player.g == Decimal(27)
    assert simulated_player.fg == Decimal(str(5.92))
    assert simulated_player.ft == Decimal(str(4.85))
    assert simulated_player.apg == Decimal(str(4.92))

    assert simulated_player.bpg == Decimal(str(1.25))
    assert simulated_player.fga == Decimal(str(12.92))
    assert simulated_player.fpg == Decimal(str(3.37))
    assert simulated_player.fta == Decimal(str(5.85))
    assert simulated_player.ppg == Decimal(str(19.40))
    assert simulated_player.rpg == Decimal(str(9.0))
    assert simulated_player.spg == Decimal(str(0.66))
    assert simulated_player.tpg == Decimal(str(2.25))
    assert simulated_player.drpg == Decimal(str(5.62))
    assert simulated_player.orpg == Decimal(str(3.37))

    assert simulated_player.two_p == Decimal(str(3.22))
    assert simulated_player.ft_pct == Decimal(str(0.76))

    assert simulated_player.two_pa == Decimal(str(6.59))
    assert simulated_player.three_p == Decimal(str(2.70))
    assert simulated_player.three_pa == Decimal(str(6.33))
    assert simulated_player.two_p_pct == Decimal(str(0.49))
    assert simulated_player.three_p_pct == Decimal(str(0.409))

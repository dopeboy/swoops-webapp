import uuid

import pytest

import simulator.models


@pytest.mark.django_db(transaction=True)
def test_incorrect_player_position():
    player = simulator.models.Player()
    player.uuid = uuid.uuid4()
    player.token = 1

    player.position_1 = simulator.models.PlayerPosition.FORWARD
    player.position_2 = simulator.models.PlayerPosition.FORWARD
    with pytest.raises(Exception):
        player.save()

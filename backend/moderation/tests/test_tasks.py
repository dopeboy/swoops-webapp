from unittest.mock import Mock

import ddf
import pytest

import game.models
import moderation.models
import moderation.tasks
from moderation.processing import update_current_player_card_and_name


@pytest.mark.django_db
def test_overwrite_current_cards(s3_client, client_user, mocker, settings):
    settings.S3_HELPER = "services.s3_helper.S3Helper"
    settings.SWOOPS_FACTORY_CLIENT = (
        "services.swoops_factory_client.SwoopsFactoryClient"
    )

    simulator_client = Mock()
    mocker.patch("simulator.client.get", return_value=simulator_client)

    team = ddf.G("game.Team")
    team.owner = client_user
    team.save()

    token_id = 1

    player = ddf.G(
        "game.Player",
        simulated=ddf.F(token=token_id, position_1="C"),
        team=team,
    )

    ddf.G(
        "moderation.PlayerNameChangeRequest",
        player=player,
        name="HARRY NOLMES",
        status=moderation.models.Status.PENDING,
        proposed_front_naked_key="proposed_front_naked_key",
        proposed_back_key="proposed_back_key",
    )

    update_current_player_card_and_name(player.simulated.token)

    assert simulator_client.update_player_name.called is True

    player = game.models.Player.objects.all().first()
    assert player.simulated.full_name == "HARRY NOLMES"

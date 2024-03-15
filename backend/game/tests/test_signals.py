import ddf
import pytest

import game.models
import game.signals


@pytest.mark.django_db
def test_handle_team_name_change_accepted():
    team = ddf.G("game.Team", name="")

    new_name = "COOLNAME"
    game.signals.handle_team_name_change_accepted(
        sender="TeamNameChangeRequest", team_id=team.id, name=new_name
    )

    freshly_updated_team = game.models.Team.objects.get(pk=team.id)
    assert freshly_updated_team.name == new_name

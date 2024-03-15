import ddf
import pytest
from django import urls


@pytest.mark.skip(reason="temporarily removed django admin")
@pytest.mark.django_db
def test_simulated_game_list_update(otp_auth_client):
    """Verifies the admin simulated game list/update can be rendered with fake data"""

    ddf.G("simulator.Simulation")
    ddf.G("simulator.Simulation")

    resp = otp_auth_client.get(urls.reverse("admin:simulator_simulation_changelist"))
    assert resp.status_code == 200

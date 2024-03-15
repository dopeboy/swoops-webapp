# Create your tests here.
import pytest
from django import urls

from conftest import build_player


@pytest.mark.django_db
def test_health(client):
    resp = client.get(urls.reverse("api:health"))
    assert resp.status_code == 200
    assert resp.json() == {}


@pytest.mark.django_db
def test_player_token_gating(client, settings):
    settings.PLAYER_MIN_TOKEN_ID_ACCESSIBLE = 3
    settings.PLAYER_MAX_TOKEN_ID_ACCESSIBLE = 10
    build_player(1)
    build_player(5)
    build_player(11)

    token = 5
    resp = client.get(urls.reverse("api:baller-detail", kwargs={"id": token}))
    assert resp.status_code == 200
    response = resp.json()
    assert (
        settings.SWOOPS_APP_BASEURL + "player-detail/" + str(token)
        == response["external_url"]
    )

    # test beyond minimum bounds
    token = 1
    resp = client.get(urls.reverse("api:baller-detail", kwargs={"id": token}))
    assert resp.status_code == 200
    response = resp.json()
    assert resp.json() == {
        "name": "Swoops player #{}".format(token),
        "description": "A cool baller.",
        "image": "https://playswoops.com/img/{}".format(token),
    }

    # test beyond maximum bounds
    token = 11
    resp = client.get(urls.reverse("api:baller-detail", kwargs={"id": token}))
    assert resp.status_code == 200
    response = resp.json()
    assert resp.json() == {
        "name": "Swoops player #{}".format(token),
        "description": "A cool baller.",
        "image": "https://playswoops.com/img/{}".format(token),
    }

import ddf
import pytest
from django import urls

import moderation.models


@pytest.mark.django_db
def test_team_name_get(client_user, authed_client):

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamNameChangeRequest",
        team=team,
        requesting_user=client_user,
        name="COOLNAME",
    )

    resp = authed_client.get(
        urls.reverse(
            "api:moderation:team-name-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 200
    assert resp.json()["name"] == "COOLNAME"
    assert resp.json()["status"] == moderation.models.Status.PENDING


@pytest.mark.django_db
def test_team_name_get_team_doesnt_exist(client_user, authed_client):

    resp = authed_client.get(
        urls.reverse(
            "api:moderation:team-name-moderation", kwargs={"team_id": 666909087}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 404


@pytest.mark.django_db
def test_team_name_no_change_requested(client_user, authed_client):

    team = ddf.G("game.Team")

    resp = authed_client.get(
        urls.reverse(
            "api:moderation:team-name-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 404


@pytest.mark.django_db
def test_team_name_get_permissions(client_user, authed_client):
    another_user = ddf.G("accounts.User")

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamNameChangeRequest",
        team=team,
        requesting_user=another_user,
        name="COOLNAME",
    )

    resp = authed_client.get(
        urls.reverse(
            "api:moderation:team-name-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 403


@pytest.mark.django_db
def test_team_name_name_change_cancel_permissions(client_user, authed_client):
    another_user = ddf.G("accounts.User")

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamNameChangeRequest",
        team=team,
        requesting_user=another_user,
        name="COOLNAME",
    )

    resp = authed_client.delete(
        urls.reverse(
            "api:moderation:team-name-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 403


@pytest.mark.django_db
def test_team_name_change_cancel(client_user, authed_client):

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamNameChangeRequest",
        team=team,
        requesting_user=client_user,
        name="COOLNAME",
    )

    resp = authed_client.delete(
        urls.reverse(
            "api:moderation:team-name-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 200
    assert resp.json()["name"] == "COOLNAME"
    assert resp.json()["status"] == moderation.models.Status.CANCELED


@pytest.mark.django_db
def test_team_name_change_cancel_when_already_terminal(client_user, authed_client):

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamNameChangeRequest",
        team=team,
        requesting_user=client_user,
        name="COOLNAME",
    )

    resp = authed_client.delete(
        urls.reverse(
            "api:moderation:team-name-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    resp = authed_client.delete(
        urls.reverse(
            "api:moderation:team-name-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 400
    assert (
        resp.json()["detail"]
        == "Moderation request is in terminal state. Cannot be modified."
    )


@pytest.mark.django_db
def test_team_logo_get(client_user, authed_client):

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamLogoChangeRequest",
        team=team,
        requesting_user=client_user,
        path="http://google.com",
    )

    resp = authed_client.get(
        urls.reverse(
            "api:moderation:team-logo-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 200
    assert resp.json()["path"] == "http://google.com"
    assert resp.json()["status"] == moderation.models.Status.PENDING


@pytest.mark.django_db
def test_team_logo_get_permissions(client_user, authed_client):
    another_user = ddf.G("accounts.User")

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamLogoChangeRequest",
        team=team,
        requesting_user=another_user,
        path="http://google.com",
    )

    resp = authed_client.get(
        urls.reverse(
            "api:moderation:team-logo-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 403


@pytest.mark.django_db
def test_team_logo_check_cancel_permissions(client_user, authed_client):
    another_user = ddf.G("accounts.User")

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamLogoChangeRequest",
        team=team,
        requesting_user=another_user,
        path="http://google.com",
    )

    resp = authed_client.delete(
        urls.reverse(
            "api:moderation:team-logo-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 403


@pytest.mark.django_db
def test_team_logo_change_cancel_pending_request(client_user, authed_client):

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamLogoChangeRequest",
        team=team,
        requesting_user=client_user,
        path="http://google.com",
    )

    resp = authed_client.delete(
        urls.reverse(
            "api:moderation:team-logo-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 200
    assert resp.json()["path"] == "http://google.com"
    assert resp.json()["status"] == moderation.models.Status.CANCELED


@pytest.mark.django_db
def test_team_logo_change_cancel_when_already_terminal(client_user, authed_client):

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamLogoChangeRequest",
        team=team,
        requesting_user=client_user,
        path="http://google.com",
    )

    resp = authed_client.delete(
        urls.reverse(
            "api:moderation:team-logo-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    resp = authed_client.delete(
        urls.reverse(
            "api:moderation:team-logo-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 400
    assert (
        resp.json()["detail"]
        == "Moderation request is in terminal state. Cannot be modified."
    )


@pytest.mark.django_db
def test_team_logo_get_team_doesnt_exist(client_user, authed_client):

    resp = authed_client.get(
        urls.reverse(
            "api:moderation:team-logo-moderation", kwargs={"team_id": 666909087}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 404


@pytest.mark.django_db
def test_team_logo_no_change_requested(client_user, authed_client):

    team = ddf.G("game.Team")

    resp = authed_client.get(
        urls.reverse(
            "api:moderation:team-logo-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.status_code == 404

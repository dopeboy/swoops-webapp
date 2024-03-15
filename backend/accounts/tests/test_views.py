import json

import ddf
import pytest
from django import urls


@pytest.mark.django_db
def test_get_user_details(client_user, authed_client):
    team = ddf.G("game.Team")
    team.owner = client_user
    team.name = "Gators"
    team.save()

    resp = authed_client.get(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id})
    )
    assert resp.status_code == 200
    assert resp.json()["id"] == client_user.id
    assert resp.json()["is_active"] == client_user.is_active
    assert resp.json()["is_verified"] == client_user.is_verified
    assert resp.json()["team"]["id"] == team.id
    assert resp.json()["team"]["name"] == team.name


@pytest.mark.django_db
def test_submit_user_email(mocker, client_user, authed_client, settings):
    """A user who has no email yet can add an email for verification."""
    client_user.email = None
    client_user.save()

    settings.API_EXTERNAL_HOSTNAME = "my.interal.hostname.com"
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")

    payload = {"email": "user.fake@email.com"}
    resp = authed_client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        data=payload,
        content_type="application/json",
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == payload["email"]
    assert not resp.json()["is_verified"]

    mock_send_mail.assert_called_once()


@pytest.mark.django_db
def test_update_user_lobby_size(client_user, authed_client):
    resp = authed_client.get(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        content_type="application/json",
    )
    assert resp.status_code == 200
    assert resp.json()["preferred_lobby_size"] == 1

    lobby_size = 2
    payload = {"preferred_lobby_size": lobby_size}
    resp = authed_client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        data=payload,
        content_type="application/json",
    )
    assert resp.status_code == 400
    assert resp.json()[0] == f"{lobby_size} Invalid entry. Lobby size must be 1,3,5"

    lobby_size = 3
    payload = {"preferred_lobby_size": lobby_size}
    resp = authed_client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        data=payload,
        content_type="application/json",
    )
    assert resp.status_code == 200
    assert resp.json()["preferred_lobby_size"] == 3


@pytest.mark.django_db
def test_resend_verification_email_endpoint(mocker, authed_client, settings):
    """A user can hit the resend verification email endpoint to resend the
    email without submitting a new one."""
    settings.API_EXTERNAL_HOSTNAME = "my.interal.hostname.com"
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")
    resp = authed_client.post(
        urls.reverse("accounts:send-verification-email"),
    )
    assert resp.status_code == 200
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
def test_submit_new_email(mocker, client_user, authed_client, settings):
    """A user who has an email on file can add a different email address
    and verify it."""
    settings.API_EXTERNAL_HOSTNAME = "my.interal.hostname.com"
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")

    payload = {"email": "user.fake@email.com"}
    resp = authed_client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        data=payload,
        content_type="application/json",
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == payload["email"]
    assert not resp.json()["is_verified"]

    mock_send_mail.assert_called_once()


@pytest.mark.django_db
def test_resubmit_old_email(mocker, client_user, authed_client, settings):
    """A user who has an email on file can resubmit the same email address
    to get the verification email resent to them."""
    settings.API_EXTERNAL_HOSTNAME = "my.interal.hostname.com"
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")

    payload = {"email": client_user.email.lower()}
    resp = authed_client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        data=payload,
        content_type="application/json",
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == payload["email"]
    assert not resp.json()["is_verified"]

    mock_send_mail.assert_called_once()


@pytest.mark.django_db
def test_email_case_sensitivity_and_uniqueness(
    mocker, client_user, authed_client, settings
):
    """A user cant submit an email that is already used by someone else. This
    includes case sensitivity; using capital letters should not make an email
    unique."""
    settings.API_EXTERNAL_HOSTNAME = "my.interal.hostname.com"
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")

    user = ddf.G("accounts.User", email="coolemail@fake.com")

    payload = {"email": user.email}
    resp = authed_client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        data=payload,
        content_type="application/json",
    )
    assert resp.status_code == 400

    payload = {"email": user.email.upper()}
    resp = authed_client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        data=payload,
        content_type="application/json",
    )
    assert resp.status_code == 400

    mock_send_mail.assert_not_called()


@pytest.mark.django_db
def test_update_reveal_all_game_score(client_user, authed_client):
    assert client_user.reveal_games_by_default is False

    resp = authed_client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        data=json.dumps({"reveal_games_by_default": True}),
        content_type="application/json",
    )
    assert resp.json()["reveal_games_by_default"] is True

    resp = authed_client.get(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id})
    )

    assert resp.json()["reveal_games_by_default"] is True

    resp = authed_client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        data=json.dumps({"reveal_games_by_default": False}),
        content_type="application/json",
    )
    assert resp.json()["reveal_games_by_default"] is False

    resp = authed_client.get(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id})
    )

    assert resp.json()["reveal_games_by_default"] is False


@pytest.mark.django_db
def test_accessing_user_that_is_not_me(client_user, authed_client):
    """A user shouldn't be able to CRUD someone else.
    Let's test the 'R' of that, by attempting to read someone
    our own account and then someone else's account"""
    resp = authed_client.get(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id})
    )
    assert resp.status_code == 200

    another_user = ddf.G("accounts.User")
    resp = authed_client.get(
        urls.reverse("accounts:user-detail", kwargs={"id": another_user.id})
    )
    assert resp.status_code == 403


"""
@pytest.mark.django_db
def test_retrieving_offchain_players(mocker, client):
    # create 3 offchain player
    build_player(token_id=555, kind=simulator.models.Player.Kind.OFF_CHAIN)
    build_player(token_id=556, kind=simulator.models.Player.Kind.OFF_CHAIN)

    _, team = build_user_and_team()
    build_player_with_ownership(
        token_id=557, team=team, kind=simulator.models.Player.Kind.OFF_CHAIN
    )

    # creaate a new user account
    mocker.patch.object(
        NonceCreationView, "generate_nonce", autospec=True, return_value=expected_uuid()
    )

    wallet_address = "0xc155deF5Dc1d36363Efd610dB6576387a1c6fe3d"

    # test with auth disabled
    response = client.post(
        urls.reverse("accounts:login-nonce-generation"),
        {"wallet_address": wallet_address},
    )

    # check if that user is assigned to one offchain player

    assert (
        game.models.Player.objects.filter(
            team__owner__nonce=response.json().get("nonce")
        ).count()
        == 1
    )

    # check if user is assigned to only random offchain that is available
    assert game.models.Player.objects.get(
        team__owner__nonce=response.json().get("nonce")
    ).simulated.token in [555, 556]
"""

import pytest
from django import urls
from django.contrib.auth import get_user_model

from accounts.views import NonceCreationView
from conftest import expected_uuid, unexpected_uuid


@pytest.mark.django_db
def test_sign_happy_path(mocker, settings, client):
    mocker.patch.object(
        NonceCreationView, "generate_nonce", autospec=True, return_value=expected_uuid()
    )

    wallet_address = "0xE06887889565a243FdF2EB2b08859FbBa913BE4e"

    # test with auth disabled
    settings.AUTH_ENABLED = False
    generate_nonce_response = client.post(
        urls.reverse("accounts:login-nonce-generation"),
        {"wallet_address": wallet_address},
    )

    assert generate_nonce_response.status_code == 400

    # test with auth enabled
    settings.AUTH_ENABLED = True
    generate_nonce_response = client.post(
        urls.reverse("accounts:login-nonce-generation"),
        {"wallet_address": "0xE06887889565a243FdF2EB2b08859FbBa913BE4e"},
    )

    assert generate_nonce_response.status_code == 200

    # test with auth disabled
    settings.AUTH_ENABLED = False

    nonce_verify_response = client.post(
        urls.reverse("accounts:login-nonce-verify"),
        {
            "wallet_address": "0xE06887889565a243FdF2EB2b08859FbBa913BE4e",
            "signed_message": "0x584899313bcb109bee0e34d2328a626b2c7fc9a2"
            + "19b43d2b711fc073fc8714191beb5cf149a3f0a5d371"
            + "5d9465618c77a82e702a2fe9ef479843f8dda4533bc21c",
        },
    )

    assert nonce_verify_response.status_code == 400

    # test with auth enabled
    settings.AUTH_ENABLED = True
    nonce_verify_response = client.post(
        urls.reverse("accounts:login-nonce-verify"),
        {
            "wallet_address": "0xE06887889565a243FdF2EB2b08859FbBa913BE4e",
            "signed_message": "0x584899313bcb109bee0e34d2328a626b2c7fc9a2"
            + "19b43d2b711fc073fc8714191beb5cf149a3f0a5d371"
            + "5d9465618c77a82e702a2fe9ef479843f8dda4533bc21c",
        },
    )

    assert nonce_verify_response.status_code == 200

    assert nonce_verify_response.data["access"] is not None

    # assert team name is set to TEAM - last four digits of wallet address
    settings.AUTH_ENABLED = True
    generate_nonce_response = client.post(
        urls.reverse("accounts:login-nonce-generation"),
        {"wallet_address": wallet_address},
    )
    user = get_user_model().objects.get(wallet_address=wallet_address)
    assert user.team.name == "TEAM-" + wallet_address[-4:]


@pytest.mark.django_db
def test_only_most_current_nonce_is_verifyable(mocker, settings, client):
    settings.AUTH_ENABLED = True

    mocker.patch.object(
        NonceCreationView,
        "generate_nonce",
        autospec=True,
        side_effect=[expected_uuid(), unexpected_uuid()],
    )

    client.post(
        urls.reverse("accounts:login-nonce-generation"),
        {"wallet_address": "0xE06887889565a243FdF2EB2b08859FbBa913BE4e"},
    )

    client.post(
        urls.reverse("accounts:login-nonce-generation"),
        {"wallet_address": "0xE06887889565a243FdF2EB2b08859FbBa913BE4e"},
    )

    # this message was signed using the nonce from the first generation response
    nonce_verify_response = client.post(
        urls.reverse("accounts:login-nonce-verify"),
        {
            "wallet_address": "0xE06887889565a243FdF2EB2b08859FbBa913BE4e",
            "signed_message": "0x584899313bcb109bee0e34d2328a626b2c7fc9a2"
            + "19b43d2b711fc073fc8714191beb5cf149a3f0a5d371"
            + "5d9465618c77a82e702a2fe9ef479843f8dda4533bc21c",
        },
    )

    assert nonce_verify_response.status_code == 403

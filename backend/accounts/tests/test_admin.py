import ddf
import pytest
from django import urls
from django.utils.crypto import get_random_string


@pytest.mark.skip(reason="temporarily removed django admin")
@pytest.mark.django_db
def test_auth_lockout(client, settings):
    settings.AXES_ENABLED = True

    u = ddf.G(
        "accounts.User",
        is_staff=True,
        is_superuser=True,
        wallet_address="0xD2623826CAFEC0bbba1876d61Fed19438df25612",
    )

    login_attempts_to_make = settings.AXES_FAILURE_LIMIT + 1

    for _ in range(login_attempts_to_make):
        response = client.post(
            urls.reverse("admin:login"),
            {"username": u.wallet_address, "password": get_random_string(10)},
            REMOTE_ADDR="127.0.0.1",
            HTTP_USER_AGENT="test-browser",
        )

    assert response.status_code == 403
    assert (
        response.content
        == b"Account locked: too many login attempts. Please try again later."
    )

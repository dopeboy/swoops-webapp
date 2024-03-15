import ddf
import pytest
from django import urls


@pytest.mark.django_db
def test_playernamechangerequest_list_update(otp_auth_client):
    """Verifies the admin player name change reqeust list/update
    can be rendered with fake data"""

    ddf.G("moderation.PlayerNameChangeRequest")
    ddf.G("moderation.PlayerNameChangeRequest")

    resp = otp_auth_client.get(
        urls.reverse("admin:moderation_playernamechangerequest_changelist")
    )
    assert resp.status_code == 200

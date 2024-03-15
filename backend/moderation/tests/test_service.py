import ddf
import pytest

import moderation.models
import moderation.service
from conftest import NetworkException


@pytest.mark.django_db
def test_name_change_when_this_is_first_request(client_user):
    team = ddf.G("game.Team")
    assert (
        moderation.service.ModerationService().submit_team_name_change(
            team.id, "COOL", client_user
        )
        is None
    )


@pytest.mark.django_db
def test_name_change_already_has_open_request(client_user):
    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamNameChangeRequest",
        status=moderation.models.Status.PENDING,
        team=team,
    )

    with pytest.raises(
        Exception,
        match="You cannot have more than one open name change request at a time, "
        + "and once a name is set, it can't be changed.",
    ):
        moderation.service.ModerationService().submit_team_name_change(
            team.id, "COOL", client_user
        )


@pytest.mark.django_db
def test_name_change_when_has_prior_accepted_requests(client_user, mocker):
    mocker.patch("comm.email.send")

    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamNameChangeRequest",
        status=moderation.models.Status.ACCEPTED,
        team=team,
    )

    with pytest.raises(
        Exception,
        match="You cannot have more than one open name change request at a time, "
        + "and once a name is set, it can't be changed.",
    ):
        moderation.service.ModerationService().submit_team_name_change(
            team.id, "COOL", client_user
        )


@pytest.mark.django_db
def test_name_change_when_has_prior_canceled_requests(client_user):
    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamNameChangeRequest",
        status=moderation.models.Status.CANCELED,
        team_id=team.id,
    )

    assert (
        moderation.service.ModerationService().submit_team_name_change(
            team.id, "COOL", client_user
        )
        is None
    )


@pytest.mark.django_db
def test_name_change_when_someone_else_has_requested_this_name(client_user):
    team1 = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamNameChangeRequest",
        status=moderation.models.Status.PENDING,
        name="GIRAFFEES",
        team_id=team1.id,
    )

    team2 = ddf.G("game.Team")

    with pytest.raises(Exception, match="name has already been reserved"):
        moderation.service.ModerationService().submit_team_name_change(
            team2.id, "GIRAFFEES", client_user
        )


@pytest.mark.django_db
def test_name_change_approved(client_user, mocker):
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")

    team = ddf.G("game.Team")
    moderation.service.ModerationService().submit_team_name_change(
        team.id, "COOL", client_user
    )

    mod = moderation.models.TeamNameChangeRequest.objects.get(team_id=team.id)
    mod.status = moderation.models.Status.ACCEPTED
    mod.save(update_fields=["status"])

    assert mock_send_mail.called


@pytest.mark.django_db
def test_logo_change_when_this_is_first_request(client_user):
    team = ddf.G("game.Team")
    assert (
        moderation.service.ModerationService().submit_team_logo_change(
            team.id, "www.google.com", client_user
        )
        is None
    )


@pytest.mark.django_db
def test_logo_change_already_has_open_request(client_user):
    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamLogoChangeRequest",
        status=moderation.models.Status.PENDING,
        team=team,
    )

    with pytest.raises(
        Exception,
        match="You cannot have more than one open logo change request at a time, "
        + "and once a logo is set, it can't be changed.",
    ):
        moderation.service.ModerationService().submit_team_logo_change(
            team.id, "www.google.com", client_user
        )


# NOTE - TEMPORARILY DISABLED
# This ends up making a call to download an image, resize, and upload it.
# It will error out without a sample image. Maybe someway to feed in a local image?
"""
@pytest.mark.django_db
def test_logo_change_when_has_prior_accepted_requests(client_user):
    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamLogoChangeRequest",
        status=moderation.models.Status.ACCEPTED,
        team=team,
        path="www.google.com",
    )

    with pytest.raises(
        Exception,
        match="You cannot have more than one open logo change request at a time, "
        + "and once a logo is set, it can't be changed.",
    ):
        moderation.service.ModerationService().submit_team_logo_change(
            team.id, "www.google.com", client_user
    )
"""


@pytest.mark.django_db
def test_logo_change_when_has_prior_canceled_requests(client_user):
    team = ddf.G("game.Team")
    ddf.G(
        "moderation.TeamLogoChangeRequest",
        status=moderation.models.Status.CANCELED,
        team_id=team.id,
    )

    assert (
        moderation.service.ModerationService().submit_team_logo_change(
            team.id, "www.google.com", client_user
        )
        is None
    )


@pytest.mark.django_db
def test_logo_change_approved(client_user, mocker):
    with pytest.raises(NetworkException):
        signal_mock = mocker.patch("signals.signals.team_logo_change_accepted.send")

        team = ddf.G("game.Team")

        moderation.service.ModerationService().submit_team_logo_change(
            team.id, "www.google.com", client_user
        )

        mod = moderation.models.TeamLogoChangeRequest.objects.get(team_id=team.id)
        mod.status = moderation.models.Status.ACCEPTED
        mod.save(update_fields=["status"])

        assert signal_mock.called

# Create your tests here.
import pytest

import comm.handlers


@pytest.mark.django_db
def test_verification_email_handler(authed_client, client_user, mocker):
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")
    comm.handlers.verification_email_handler(client_user)
    mock_send_mail.assert_called_once()


"""
NOTE - DISABLED 6/8/23 because emails are inactive
@pytest.mark.django_db
def test_game_complete_handler(authed_client, client_user, mocker):
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")
    game = build_game()

    _, team1 = build_user_and_team()
    game.lineup_1 = build_lineup(team1)

    _, team2 = build_user_and_team()
    game.lineup_2 = build_lineup(team2)
    game.save()

    comm.handlers.game_complete_handler(game)
    mock_send_mail.assert_called_once()
"""


@pytest.mark.django_db
def test_team_name_approved_handler(authed_client, client_user, mocker):
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")
    comm.handlers.team_name_approved_handler(client_user)
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
def test_team_name_rejected_handler(authed_client, client_user, mocker):
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")
    comm.handlers.team_name_rejected_handler(
        client_user, rejection_reason="Because we say so"
    )
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
def test_team_logo_approved_handler(authed_client, client_user, mocker):
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")
    comm.handlers.team_logo_approved_handler(client_user)
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
def test_player_name_approved_handler(authed_client, client_user, mocker):
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")
    comm.handlers.player_name_approved_handler(client_user, 1, "Best Player")
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
def test_player_name_rejected_handler(authed_client, client_user, mocker):
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")
    comm.handlers.player_name_rejected_handler(
        client_user, rejection_reason="Because we say so"
    )
    mock_send_mail.assert_called_once()

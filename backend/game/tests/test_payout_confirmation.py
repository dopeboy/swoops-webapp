import binascii
import os
from collections import namedtuple
from unittest.mock import MagicMock, Mock

import django.utils.timezone as timezone
import pytest
from django.conf import settings
from web3.exceptions import TransactionNotFound

import game.models
from conftest import (
    build_completed_tournament_with_payout_statuses,
    build_fully_completed_and_paid_out_tournament,
    build_tournament,
)
from eth.gas import InsufficentFundsException
from game.payout_confirmation import PayoutConfirmationStatus, confirm_payouts

block = namedtuple("block", ["blockNumber"])
blockchainTransaction = namedtuple("blockchainTransaction", ["hash", "rawTransaction"])


def mock_web3_client(mocker):
    mock_client = mocker.MagicMock()
    mock_client.eth = mocker.MagicMock()
    mock_client.eth.account = mocker.MagicMock()
    mocker.patch("game.payout_confirmation._init_web3_client", return_value=mock_client)
    return mock_client


def set_behavior_transaction_has_been_validated(web3_client_mock):
    web3_client_mock.eth.get_transaction.return_value = block(blockNumber=1)


def set_behavior_transaction_waiting_to_be_validated(web3_client_mock):
    web3_client_mock.eth.get_transaction.return_value = block(blockNumber=None)


def set_behavior_transaction_not_found(web3_client_mock):
    web3_client_mock.eth.get_transaction = Mock(
        side_effect=TransactionNotFound("Tx not found")
    )


def set_behavior_transaction_submission_is_successful(web3_client_mock):
    web3_client_mock.eth.account.sign_transaction.return_value = blockchainTransaction(
        hash=binascii.b2a_hex(os.urandom(16)), rawTransaction=None
    )
    web3_client_mock.eth.send_raw_transaction = Mock(return_value=None)


@pytest.mark.django_db
def test_nothing_to_confirm():
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")

    assert confirm_payouts() == PayoutConfirmationStatus.NOTHING_TO_DO


@pytest.mark.django_db
def test_confirms_initiated_payout(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    mocker.patch("game.payout_confirmation._notify_user", return_value=None)

    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")

    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.INITIATED],
    )

    web3_client_mock = mock_web3_client(mocker)
    set_behavior_transaction_has_been_validated(web3_client_mock)

    assert confirm_payouts() == PayoutConfirmationStatus.CONFIRMED
    assert tournament.tournamentpayout_set.count() == 1
    assert (
        tournament.tournamentpayout_set.all()[0].payout.status
        == game.models.PayoutStatus.CONFIRMED
    )
    tournament.refresh_from_db()
    assert tournament.paid_out is False


@pytest.mark.django_db
def test_confirms_initiated_payout_which_pays_out_whole_tournament(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    mocker.patch("game.payout_confirmation._notify_user", return_value=None)

    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")

    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.INITIATED],
        meta={"payout_breakdown_usd": [100], "max_games_per_round": [3]},
    )

    web3_client_mock = mock_web3_client(mocker)
    set_behavior_transaction_has_been_validated(web3_client_mock)

    assert confirm_payouts() == PayoutConfirmationStatus.CONFIRMED
    assert tournament.tournamentpayout_set.count() == 1
    assert (
        tournament.tournamentpayout_set.all()[0].payout.status
        == game.models.PayoutStatus.CONFIRMED
    )
    tournament.refresh_from_db()
    assert tournament.paid_out is True


@pytest.mark.django_db
def test_payout_transaction_is_still_pending_validation(mocker):
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.INITIATED],
    )

    web3_client_mock = mock_web3_client(mocker)
    set_behavior_transaction_waiting_to_be_validated(web3_client_mock)

    assert confirm_payouts() == PayoutConfirmationStatus.PAYOUT_PENDING
    assert tournament.tournamentpayout_set.count() == 1
    assert (
        tournament.tournamentpayout_set.all()[0].payout.status
        == game.models.PayoutStatus.INITIATED
    )
    tournament.refresh_from_db()
    assert tournament.paid_out is False


@pytest.mark.django_db
def test_payout_transaction_is_pending_for_too_long(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.INITIATED],
    )
    payout = tournament.tournamentpayout_set.all()[0].payout
    payout.created_at = timezone.now() - timezone.timedelta(days=1)
    payout.save()

    web3_client_mock = mock_web3_client(mocker)
    set_behavior_transaction_waiting_to_be_validated(web3_client_mock)
    set_behavior_transaction_submission_is_successful(web3_client_mock)

    mocker.patch("eth.gas.get_balance", return_value=55_000_000_000_000_000)
    mocker.patch("game.payout.send_transaction", return_value=None)
    mocker.patch("game.payout.get_chain_id", return_value=1337)
    mocker.patch("game.payout.get_gas_prices_in_wei", return_value=(1, 1))

    assert confirm_payouts() == PayoutConfirmationStatus.SPEED_UP_ISSUED
    assert tournament.tournamentpayout_set.count() == 2
    assert (
        tournament.tournamentpayout_set.all()[0].payout.status
        == game.models.PayoutStatus.INITIATED
    )
    assert (
        tournament.tournamentpayout_set.all()[1].payout.status
        == game.models.PayoutStatus.INITIATED
    )
    tournament.refresh_from_db()
    assert tournament.paid_out is False


@pytest.mark.django_db
def test_payout_transaction_is_pending_for_too_long_but_insufficent_funds_to_replace_it(
    mocker,
):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.INITIATED],
    )
    payout = tournament.tournamentpayout_set.all()[0].payout
    payout.created_at = timezone.now() - timezone.timedelta(days=1)
    payout.save()

    web3_client_mock = mock_web3_client(mocker)
    set_behavior_transaction_waiting_to_be_validated(web3_client_mock)
    set_behavior_transaction_submission_is_successful(web3_client_mock)

    mocker.patch("eth.gas.get_balance", return_value=0)
    mocker.patch("game.payout.send_transaction", return_value=None)
    mocker.patch("game.payout.get_chain_id", return_value=1337)
    mocker.patch("game.payout.get_gas_prices_in_wei", return_value=(1, 1))

    with pytest.raises(InsufficentFundsException):
        confirm_payouts()


@pytest.mark.django_db
def test_initiated_transactions_off_the_replaced_transactions_get_confirmed(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    mocker.patch("game.payout_confirmation._notify_user", return_value=None)

    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")

    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.INITIATED],
    )
    payout = tournament.tournamentpayout_set.all()[0].payout
    payout.created_at = timezone.now() - timezone.timedelta(days=1)
    payout.save()

    web3_client_mock = mock_web3_client(mocker)
    set_behavior_transaction_waiting_to_be_validated(web3_client_mock)
    set_behavior_transaction_submission_is_successful(web3_client_mock)

    mocker.patch("eth.gas.get_balance", return_value=55_000_000_000_000_000)
    mocker.patch("game.payout.send_transaction", return_value=None)
    mocker.patch("game.payout.get_chain_id", return_value=1337)
    mocker.patch("game.payout.get_gas_prices_in_wei", return_value=(1, 1))

    assert confirm_payouts() == PayoutConfirmationStatus.SPEED_UP_ISSUED

    set_behavior_transaction_has_been_validated(web3_client_mock)

    assert confirm_payouts() == PayoutConfirmationStatus.CONFIRMED

    assert tournament.tournamentpayout_set.count() == 2
    assert (
        tournament.tournamentpayout_set.all()[0].payout.status
        == game.models.PayoutStatus.SUPERSEDED
    )
    assert (
        tournament.tournamentpayout_set.all()[1].payout.status
        == game.models.PayoutStatus.CONFIRMED
    )
    tournament.refresh_from_db()
    assert tournament.paid_out is False


@pytest.mark.django_db
def test_the_sped_up_transactions_are_superseded_when_the_original_payout_processes_first(  # noqa: E501
    mocker,
):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    mocker.patch("game.payout_confirmation._notify_user", return_value=None)

    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")

    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.INITIATED],
    )
    payout = tournament.tournamentpayout_set.all()[0].payout
    payout.created_at = timezone.now() - timezone.timedelta(days=1)
    payout.save()

    web3_client_mock = mock_web3_client(mocker)
    set_behavior_transaction_waiting_to_be_validated(web3_client_mock)
    set_behavior_transaction_submission_is_successful(web3_client_mock)

    mocker.patch("eth.gas.get_balance", return_value=55_000_000_000_000_000)
    mocker.patch("game.payout.send_transaction", return_value=None)
    mocker.patch("game.payout.get_chain_id", return_value=1337)
    mocker.patch("game.payout.get_gas_prices_in_wei", return_value=(1, 1))

    assert confirm_payouts() == PayoutConfirmationStatus.SPEED_UP_ISSUED
    hash_to_watch_for = None
    for tournamentpayout in tournament.tournamentpayout_set.all():
        if tournamentpayout.payout.id == payout.id:
            hash_to_watch_for = tournamentpayout.payout.transaction_hash
        else:
            tournamentpayout.payout.created_at = timezone.now() - timezone.timedelta(
                hours=5
            )
            tournamentpayout.payout.save()

    # we confirm that the first payout was confirmed before the speedup
    web3_client_mock.eth.get_transaction = MagicMock(
        side_effect=lambda x: block(hash_to_watch_for)
        if x == hash_to_watch_for
        else block(None)
    )

    assert confirm_payouts() == PayoutConfirmationStatus.CONFIRMED

    assert (
        tournament.tournamentpayout_set.all()[0].payout.status
        == game.models.PayoutStatus.CONFIRMED
    )
    assert (
        tournament.tournamentpayout_set.all()[1].payout.status
        == game.models.PayoutStatus.SUPERSEDED
    )
    tournament.refresh_from_db()
    assert tournament.paid_out is False


@pytest.mark.django_db
def test_once_a_payout_has_been_sped_up_payouts_for_that_entrant_cant_be_sped_up_again(
    mocker,
):  # noqa: E501
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.INITIATED],
    )
    payout_to_be_sped_up = tournament.tournamentpayout_set.all()[0].payout
    payout_to_be_sped_up.created_at = timezone.now() - timezone.timedelta(days=1)
    payout_to_be_sped_up.save()

    web3_client_mock = mock_web3_client(mocker)
    set_behavior_transaction_waiting_to_be_validated(web3_client_mock)
    set_behavior_transaction_submission_is_successful(web3_client_mock)

    mocker.patch("eth.gas.get_balance", return_value=55_000_000_000_000_000)
    mocker.patch("game.payout.send_transaction", return_value=None)
    mocker.patch("game.payout.get_chain_id", return_value=1337)
    mocker.patch("game.payout.get_gas_prices_in_wei", return_value=(1, 1))

    assert confirm_payouts() == PayoutConfirmationStatus.SPEED_UP_ISSUED
    assert tournament.tournamentpayout_set.count() == 2

    # advance time so that the sped up payout is now considered stuck too
    for tournamentpayout in tournament.tournamentpayout_set.all():
        if tournamentpayout.payout.id == payout_to_be_sped_up.id:
            continue
        else:
            tournamentpayout.payout.created_at = timezone.now() - timezone.timedelta(
                hours=5
            )
            tournamentpayout.payout.save()
            break

    assert confirm_payouts() == PayoutConfirmationStatus.ALREADY_SPED_UP
    tournament.refresh_from_db()
    assert tournament.tournamentpayout_set.count() == 2
    assert tournament.paid_out is False


@pytest.mark.django_db
def test_transaction_never_made_it_to_the_chain(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.INITIATED],
    )

    web3_client_mock = mock_web3_client(mocker)
    set_behavior_transaction_not_found(web3_client_mock)

    assert confirm_payouts() == PayoutConfirmationStatus.ERROR_DETECTED
    assert (
        tournament.tournamentpayout_set.all()[0].payout.status
        == game.models.PayoutStatus.ERRORED
    )
    tournament.refresh_from_db()
    assert tournament.paid_out is False

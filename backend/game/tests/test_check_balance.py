from decimal import Decimal
from unittest.mock import Mock

import pytest
from django.conf import settings
from web3 import Web3
from web3.exceptions import TransactionNotFound

from conftest import (
    build_completed_tournament_with_payout_statuses,
    build_fully_completed_and_paid_out_tournament,
    build_tournament,
)
from game.check_balance import BalanceCheckerStatus, check_balance


def mock_web3_client(mocker):
    mock_client = mocker.MagicMock()
    mock_client.eth = mocker.MagicMock()
    mock_client.eth.account = mocker.MagicMock()
    mocker.patch("game.check_balance._build_web3_client", return_value=mock_client)
    return mock_client


def set_balance(mocker, balance):
    mocker.patch("game.check_balance._get_balance", return_value=balance)


def set_behavior_transaction_not_found(web3_client_mock):
    web3_client_mock.eth.get_transaction = Mock(
        side_effect=TransactionNotFound("Tx not found")
    )


@pytest.mark.django_db
def test_nothing_to_confirm(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")

    set_balance(mocker, 8765)

    assert check_balance() == BalanceCheckerStatus.NOTHING_TO_PAY_OUT


@pytest.mark.django_db
def test_not_enough_balance(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully", payout_statuses=[]
    )

    set_balance(mocker, 1)
    mocker.patch(
        "services.crypto_currency_converter.get_usd_to_eth_conversion_factor",
        return_value=Decimal("0.0000000025"),
    )

    assert check_balance() == BalanceCheckerStatus.NOT_ENOUGH_BALANCE


@pytest.mark.django_db
def test_enough_balance(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully", payout_statuses=[]
    )

    set_balance(mocker, Web3.toWei(100, "ether"))
    mocker.patch(
        "services.crypto_currency_converter.get_usd_to_eth_conversion_factor",
        return_value=Decimal("0.0000000025"),
    )

    assert check_balance() == BalanceCheckerStatus.ENOUGH_BALANCE

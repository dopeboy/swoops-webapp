from decimal import Decimal

import pytest
from django.conf import settings

import game.models
from conftest import (
    build_completed_tournament_with_payout_statuses,
    build_fully_completed_and_paid_out_tournament,
    build_tournament,
    nonce_generator,
)
from eth.gas import InsufficentFundsException
from game.payout import PayoutInitiationStatus, initiate_payouts


def mock_eth_client(mocker):
    mocker.patch("eth.gas.get_balance", return_value=55_000_000_000_000_000)
    mocker.patch("game.payout.send_transaction", return_value=None)
    mocker.patch(
        "game.payout.get_transaction_count", return_value=next(nonce_generator)
    )
    mocker.patch("game.payout.get_chain_id", return_value=1337)
    mocker.patch("game.payout.get_gas_prices_in_wei", return_value=(1, 1))
    mocker.patch(
        "services.crypto_currency_converter.get_usd_to_eth_conversion_factor",
        return_value=Decimal("0.0000000025"),
    )


@pytest.mark.django_db
def test_no_tournaments_to_process():
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")

    resolution = initiate_payouts()
    assert resolution == PayoutInitiationStatus.NOTHING_TO_DO


@pytest.mark.django_db
def test_initated_payout_blocks_initiating_more_payouts():
    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.INITIATED],
    )

    resolution = initiate_payouts()
    assert resolution == PayoutInitiationStatus.WAITING_FOR_RESOLUTION


@pytest.mark.django_db
def test_first_of_three_payouts_of_tournament_is_created(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    mock_eth_client(mocker)

    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[],
        meta={"payout_breakdown_usd": [70, 20, 10], "max_games_per_round": [3]},
    )

    resolution = initiate_payouts()
    assert resolution == PayoutInitiationStatus.INITIATED
    assert tournament.tournamentpayout_set.count() == 1
    tournament.tournamentpayout_set.all()[0].payout.amount_usd == Decimal("70")


@pytest.mark.django_db
def test_second_of_three_payouts_of_tournament_is_created(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    mock_eth_client(mocker)

    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[game.models.PayoutStatus.CONFIRMED],
        meta={"payout_breakdown_usd": [70, 20, 10], "max_games_per_round": [3]},
    )

    resolution = initiate_payouts()
    assert resolution == PayoutInitiationStatus.INITIATED
    assert tournament.tournamentpayout_set.count() == 2
    tournament.tournamentpayout_set.all()[0].payout.amount_usd == Decimal("70")
    tournament.tournamentpayout_set.all()[1].payout.amount_usd == Decimal("20")


@pytest.mark.django_db
def test_third_of_three_payouts_of_tournament_is_created(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    mock_eth_client(mocker)

    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paidout")
    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully",
        payout_statuses=[
            game.models.PayoutStatus.CONFIRMED,
            game.models.PayoutStatus.CONFIRMED,
        ],
        meta={"payout_breakdown_usd": [70, 20, 10], "max_games_per_round": [3]},
    )

    resolution = initiate_payouts()
    assert resolution == PayoutInitiationStatus.INITIATED
    assert tournament.tournamentpayout_set.count() == 3
    tournament.tournamentpayout_set.all()[0].payout.amount_usd == Decimal("70")
    tournament.tournamentpayout_set.all()[1].payout.amount_usd == Decimal("20")
    tournament.tournamentpayout_set.all()[2].payout.amount_usd == Decimal("10")


@pytest.mark.django_db
def test_an_errored_payout_is_recreated(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    mock_eth_client(mocker)

    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paid")
    tournament = build_completed_tournament_with_payout_statuses(
        "Completed + with a payout error",
        size=2,
        payout=100,
        meta={"payout_breakdown_usd": [100], "max_games_per_round": [2]},
        payout_statuses=[game.models.PayoutStatus.ERRORED],
    )

    resolution = initiate_payouts()
    assert resolution == PayoutInitiationStatus.INITIATED
    assert tournament.tournamentpayout_set.count() == 2


@pytest.mark.django_db
def test_payout_wallet_has_insufficent_funds(mocker):
    settings.PAYOUT_NOTIFICATION_WEBHOOK = ""
    mock_eth_client(mocker)
    mocker.patch("eth.gas.get_balance", return_value=10)

    build_tournament("Not Completed")
    build_fully_completed_and_paid_out_tournament("Completed + paid")
    build_completed_tournament_with_payout_statuses(
        "Completed + not paid out fully", payout_statuses=[]
    )

    with pytest.raises(InsufficentFundsException):
        initiate_payouts()

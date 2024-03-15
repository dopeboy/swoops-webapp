import logging
from decimal import Decimal
from enum import Enum

from django.conf import settings
from django.utils import timezone
from web3 import Web3

import game.models
import services.crypto_currency_converter
import utils.db
from comm.notification import notify_slack_payout
from eth.gas import get_balance

LOGGER = logging.getLogger(__name__)


class BalanceCheckerStatus(Enum):
    NOTHING_TO_PAY_OUT = 1
    NOT_ENOUGH_BALANCE = 2
    ENOUGH_BALANCE = 3


def _build_web3_client():
    return Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER))


def _get_balance(client, address):
    return get_balance(client, address)


def _format_ether(value):
    return round(value, 6)


@utils.db.mutex
def check_balance():

    tournaments = game.models.Tournament.payouts.tournaments_needing_a_pay_out(
        timezone.now() - timezone.timedelta(days=30)
    )

    web3_client = _build_web3_client()
    balance_in_ether = Web3.fromWei(
        _get_balance(web3_client, settings.PAYOUT_WALLET_ADDRESS), "ether"
    )

    if not tournaments:
        msg = (
            "No pending tournaments to pay out, no additional funding needed. "
            "Current balance is {} eth.".format(_format_ether(balance_in_ether))
        )
        LOGGER.info(msg)
        notify_slack_payout(msg)
        return BalanceCheckerStatus.NOTHING_TO_PAY_OUT

    total_payout_amount = 0
    total_number_of_payouts = 0
    tournament_ids = []
    for tournament in tournaments:
        total_number_of_payouts += tournament.number_of_payouts
        total_payout_amount += tournament.payout
        tournament_ids.append(tournament.id)

    total_prize_payout_in_ether = (
        services.crypto_currency_converter.get_usd_to_eth_conversion_factor()
        * Decimal(total_payout_amount)
    )

    # to pay a person out, it costs 21000 gas. We estimate that it will cost 17 gwei
    # per gas when the job runs
    total_gas_fees_to_pay_out_in_ether = Web3.fromWei(
        Web3.toWei(total_number_of_payouts * 21000 * 17, "gwei"), "ether"
    )

    msg = (
        f"Current balance is {_format_ether(balance_in_ether)}eth. "
        "Total prize payout including gas is "
        f"{_format_ether(total_prize_payout_in_ether + total_gas_fees_to_pay_out_in_ether)}eth."  # noqa: E501
    )

    if (
        balance_in_ether
        < total_prize_payout_in_ether + total_gas_fees_to_pay_out_in_ether
    ):  # noqa: E501
        msg += (
            " Not enough balance to pay out. Need at least "
            f"{_format_ether(total_prize_payout_in_ether + total_gas_fees_to_pay_out_in_ether - balance_in_ether)}"  # noqa: E501
            " more eth."
        )

        msg += f" Tournament ids: {tournament_ids}"
        LOGGER.info(msg)
        notify_slack_payout(msg)
        return BalanceCheckerStatus.NOT_ENOUGH_BALANCE

    msg += " You have enough to pay out."
    msg += f" Tournament ids: {tournament_ids}"
    LOGGER.info(msg)
    notify_slack_payout(msg)
    return BalanceCheckerStatus.ENOUGH_BALANCE

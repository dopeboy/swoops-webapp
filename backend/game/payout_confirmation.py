import logging
from enum import Enum

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from web3 import Web3
from web3.exceptions import TransactionNotFound

import game.models
import utils.db
from comm.notification import notify_slack_payout, send
from eth.gas import (
    InsufficentFundsException,
    get_gas_prices_in_wei,
    verify_wallet_balance,
)

LOGGER = logging.getLogger(__name__)


class PayoutConfirmationStatus(Enum):
    NOTHING_TO_DO = 1
    CONFIRMED = 2
    ERROR_DETECTED = 3
    PAYOUT_PENDING = 4
    SPEED_UP_ISSUED = 5
    ALREADY_SPED_UP = 6


def replace_and_speed_up(web3_client, original_payout):
    """
    When a transaction is stuck, we can replace it with a new transaction with a higher
    gas spend. This is done by creating a new transaction with the same nonce as the
    one you want to replace, and submitting it with higher gas spend to entice miners to
    pick up and process this new transaction.

    The idea here is that your old transaction is underfunded for the current demand
    and this newer transaction will be funded enough to be accepted by the blockchain
    for the current demand. Because both transactions have the same nonce, once your
    new transaction is added to the chain, the old transaction will be marked as a
    duplicate when it gets picked up for processing (this happens when the price of gas
    eventually becomes low enough for the old transaction to be picked up).
    """
    with transaction.atomic():
        tournament = original_payout.tournamentpayouts.tournament

        max_fee_per_gas, max_priority_fee_per_gas = get_gas_prices_in_wei(
            network=settings.ETHEREUM_NETWORK, spend_more_process_faster=True
        )
        payout_amount_wei = Web3.toWei(
            original_payout.amount_usd * original_payout.usd_to_eth_conversion_rate,
            "ether",
        )

        gas_required_for_transaction = 21000  # sending ETH is a flat amount of gas
        total_cost_of_transaction = (
            gas_required_for_transaction * max_fee_per_gas + payout_amount_wei
        )

        wallet_that_pays_out = Web3.toChecksumAddress(settings.PAYOUT_WALLET_ADDRESS)
        wallet_to_receive_funds = Web3.toChecksumAddress(
            original_payout.team.owner.wallet_address
        )

        try:
            verify_wallet_balance(
                web3_client, wallet_that_pays_out, total_cost_of_transaction
            )
        except InsufficentFundsException as e:
            notify_slack_payout(
                f"While attempting to speed up a pay out for tournament_id={tournament.id}: "  # noqa: E501
                + str(e)
            )
            raise e

        transaction_to_submit = web3_client.eth.account.sign_transaction(
            dict(
                nonce=original_payout.nonce,
                gas=gas_required_for_transaction,
                maxFeePerGas=max_fee_per_gas,
                maxPriorityFeePerGas=max_priority_fee_per_gas,
                to=wallet_to_receive_funds,
                value=payout_amount_wei,
                data=b"",
                chainId=web3_client.eth.chain_id,
            ),
            settings.PAYOUT_WALLET_PRIVATE_KEY,
        )

        new_payout = game.models.Payout.objects.create(
            amount_wei=payout_amount_wei,
            amount_usd=original_payout.amount_usd,
            usd_to_eth_conversion_rate=original_payout.usd_to_eth_conversion_rate,
            team=original_payout.team,
            to_address=wallet_to_receive_funds,
            status=game.models.PayoutStatus.INITIATED,
            transaction_hash=transaction_to_submit.hash.hex(),
            nonce=original_payout.nonce,
        )
        game.models.TournamentPayout.objects.create(
            tournament=tournament, payout=new_payout
        )

    web3_client.eth.send_raw_transaction(transaction_to_submit.rawTransaction)
    message = f"[PAYOUT={original_payout.id}]  Has been pending for too long and is likely stuck. We have created a new payout (payout_id={new_payout.id}) and resubmitted the transaction with higher gas fees to speed it up"  # noqa: E501
    notify_slack_payout(message)
    LOGGER.info(message)


def _init_web3_client():
    return Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER))


def can_speed_up(payout):
    return (
        game.models.TournamentPayout.objects.filter(
            tournament=payout.tournamentpayouts.tournament,
            payout__status__iexact=game.models.PayoutStatus.INITIATED,
            payout__nonce=payout.nonce,
        ).count()
        < 2
    )


def tournament_is_fully_paid_out(tournament):
    return (
        tournament.number_of_payouts
        == game.models.Tournament.payouts.count_payouts_made_for_tournament(
            tournament.id
        )
    )


def _notify_user(title, message, click_url, user_id):
    send(title, message, click_url, user_id)


@utils.db.mutex
def confirm_payouts():
    """
    This job finds payouts that have been initiated and checks to see if they have been
    accepted by the blockchain, marking them as confirmed if so.

    There are edge cases where a payout can be initiated but not accepted by the
    blockchain, and this job will replace that transaction with a new one with higher
    gas fees to "speed it up".
    """

    LOGGER.info("Looking for payouts to confirm...")
    payouts_needing_confirmation = game.models.Payout.objects.filter(
        status=game.models.PayoutStatus.INITIATED
    ).order_by("-created_at")

    if len(payouts_needing_confirmation) == 0:
        LOGGER.info("No payouts awaiting confirmation. Terminating.")
        return PayoutConfirmationStatus.NOTHING_TO_DO

    web3_client = _init_web3_client()
    for index, payout in enumerate(payouts_needing_confirmation):
        LOGGER.info(f"Found payout_id={payout.id} to confirm")
        try:
            blockchain_transaction = web3_client.eth.get_transaction(
                payout.transaction_hash
            )
            if blockchain_transaction.blockNumber is not None:
                with transaction.atomic():
                    message = "[PAYOUT={}] Confirmed in block={}!".format(
                        payout.id, blockchain_transaction.blockNumber
                    )
                    LOGGER.info(message)
                    payout.status = game.models.PayoutStatus.CONFIRMED
                    payout.save()

                    other_initated_payout_for_this_nonce = (
                        game.models.Payout.objects.filter(
                            status=game.models.PayoutStatus.INITIATED,
                            nonce=payout.nonce,
                        )
                    )

                    additional_message = ""
                    if other_initated_payout_for_this_nonce:
                        initiated_payout = other_initated_payout_for_this_nonce[0]

                        additional_message = f"[PAYOUT={payout.id}] Since this payout is confirmed, marking the other payout for this entrant (payout_id={initiated_payout.id}) as superseded."  # noqa: E501
                        LOGGER.info(additional_message)
                        initiated_payout.status = game.models.PayoutStatus.SUPERSEDED
                        initiated_payout.save()

                    notify_slack_payout(" ".join([message, additional_message]))
                    _notify_user(
                        title="You have been paid out!",
                        message=f"For your performance in the tournament {payout.tournamentpayouts.tournament.name} won you ${round(payout.amount_usd)}",  # noqa: E501
                        click_url=f"https://app.playswoops.com/tournament/{payout.tournamentpayouts.tournament_id}",  # noqa: E501
                        user_id=str(payout.team.owner_id),
                    )

                    tournament = payout.tournamentpayouts.tournament
                    if tournament_is_fully_paid_out(tournament):
                        tournament.paid_out = True
                        tournament.save()
                        message = (
                            f"tournament_id={tournament.id} is now fully paid out."
                        )
                        LOGGER.info(message)
                        notify_slack_payout(message)

                    return PayoutConfirmationStatus.CONFIRMED
            else:
                if payout.created_at < timezone.now() - timezone.timedelta(minutes=10):
                    LOGGER.info(
                        "payout_id={} has been pending for more than 5 minutes- performing resubmit and speed-up.".format(  # noqa: E501
                            payout.id
                        )
                    )
                    # there is an edge case here:
                    # it is possible that in the time between when the old transaction
                    # was evaluated as stuck and the new transaction is created and
                    # submitted, that the old transaction gets picked up and processed.
                    #
                    # When the new transaction is created, it has the same
                    # nonce as the old transaction. When it is evaluated for
                    # confirmation, it will fail because the nonce has already been
                    # consumed by the old transaction. This manifests as the new
                    # transaction appearing to not exist. That will end in the newer
                    # transaction being marked as terminal, but the old transaction
                    # should be marked as confirmed.
                    #
                    # To account for this, we leave BOTH transactions in the INITATED
                    # state, giving this job an opportunity to mark one of them as
                    # confirmed, and supersede the other.
                    # Because both transactions have the same nonce, only one of them
                    # will be accepted by the chain so we dont have to worry about
                    # multiple spends. It's a race!
                    #
                    # What we do, is make sure that an initiated payout can't
                    # be sped up more than once. Once one of those transactions is
                    # confirmed, the other payout for that nonce is marked as
                    # superseded.
                    if can_speed_up(payout):
                        replace_and_speed_up(web3_client, payout)
                        return PayoutConfirmationStatus.SPEED_UP_ISSUED
                    LOGGER.info(
                        f"payout_id={payout.id} (nonce={payout.nonce}) can't be sped up again. Waiting for one of the transactions to confirm."  # noqa: E501
                    )

                    # Recall that the query to create this list of payouts to confirm
                    # processes the NEWEST payout attempt first.
                    # The only time that query can return more than one result is when
                    # a transaction has been sped up.
                    #
                    # To account for the edge case where the old transaction is
                    # processed before the sped up one, we want to process all the
                    # payout entries.
                    #
                    # Therefore, only return ALREADY_SPED_UP once we have checked all
                    # the payouts are still stuck.
                    if index == len(payouts_needing_confirmation) - 1:
                        return PayoutConfirmationStatus.ALREADY_SPED_UP
                else:
                    LOGGER.info(
                        "payout_id={} is still pending- waiting for it to be validated to the chain.".format(  # noqa: E501
                            payout.id
                        )
                    )
                    return PayoutConfirmationStatus.PAYOUT_PENDING

        except TransactionNotFound:
            message = f"There was an issue during the submission of payout_id={payout.id} transaction to the blockchain, and the transaction wasn't actually submitted. In response, payout_id={payout.id} is now marked as ERRORED in the database and will be recreated and resubmitted."  # noqa: E501
            LOGGER.info(message)
            payout.status = game.models.PayoutStatus.ERRORED
            payout.save()

            notify_slack_payout(message)
            return PayoutConfirmationStatus.ERROR_DETECTED

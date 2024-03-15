import logging
import logging.config

from django.utils import timezone
from django.utils.log import DEFAULT_LOGGING

from eth.models import MintPhase, TokenPurchaseIntent

logging.config.dictConfig(DEFAULT_LOGGING)
logger = logging.getLogger("django.server")


def get_current_phase():
    return MintPhase.objects.get_current_phase()


def record_purchase_confirmation(address, amount_confirmed):
    current_phase = get_current_phase()
    intents = TokenPurchaseIntent.objects.get_open_intents(address, current_phase)

    confirmations_to_disburse = amount_confirmed

    for intent in intents:
        if confirmations_to_disburse == 0:
            break

        confirmations_to_consume = min(
            intent.requested_amount - intent.confirmed_amount,
            confirmations_to_disburse,
        )

        intent.confirmed_amount += confirmations_to_consume
        confirmations_to_disburse -= confirmations_to_consume
        intent.save()

    if confirmations_to_disburse != 0:
        logger.info(
            "{} Confirmations have been recieved that can't be allocated to an existing intent. Creating intents to hold them.".format(  # noqa: E501
                confirmations_to_disburse
            )
        )

        TokenPurchaseIntent.objects.create(
            phase=current_phase,
            wallet_address=address,
            requested_amount=confirmations_to_disburse,
            confirmed_amount=confirmations_to_disburse,
            expires_at=timezone.now(),
        ).save()

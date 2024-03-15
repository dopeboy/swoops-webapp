import datetime

import ddf
import pytest
from django.utils import timezone

from eth.models import TokenPurchaseIntent
from signals.signals import player_ownership_updated


def build_expired_intent(phase, address, amount):
    return build_intent(
        phase, address, amount, expiry=timezone.now() - datetime.timedelta(weeks=52)
    )


def build_intent(phase, address, amount, expiry=None):
    the_expiry = timezone.now() + datetime.timedelta(weeks=52)
    if expiry:
        the_expiry = expiry

    intent = ddf.G(
        "eth.TokenPurchaseIntent",
        wallet_address=address,
        phase=phase,
        requested_amount=amount,
        expires_at=the_expiry,
    )
    intent.save()
    return intent


# These tests represent the the metamask flow
# User initiates a purchase, the FE tells the BE about it, the records the intent and
# tells the FE that the quota is filling up.


@pytest.mark.django_db
def test_get_intents_when_empty():
    intents = TokenPurchaseIntent.objects.get_intent_summary(
        "0xf407dF7897ADa7B18Be503f6E45b992a682c3906", "PHASE1"
    )
    assert len(intents) == 0


@pytest.mark.django_db
def test_get_intents_with_one_phase():
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    phase = "PHASE1"
    build_intent(phase, address, 3)

    intents = TokenPurchaseIntent.objects.get_intent_summary(address, phase)
    assert len(intents) == 1
    assert intents[0].wallet_address == address
    assert intents[0].phase == phase
    assert intents[0].requested_amount == 3


@pytest.mark.django_db
def test_get_intents_with_more_than_one_phase():
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    phase1 = "PHASE1"
    phase2 = "PHASE2"
    build_intent(phase1, "0xe9e6CAD692c46FDBC61b8cF1665f5597C440aC95", 3)
    intent1 = build_intent(phase1, address, 3)
    intent2 = build_intent(phase2, address, 5)

    intents = TokenPurchaseIntent.objects.get_intent_summary(address, phase1)
    assert len(intents) == 1
    assert intents[0].wallet_address == intent1.wallet_address
    assert intents[0].phase == intent1.phase
    assert intents[0].requested_amount == intent1.requested_amount

    intents = TokenPurchaseIntent.objects.get_intent_summary(address, phase2)
    assert len(intents) == 1
    assert intents[0].wallet_address == intent2.wallet_address
    assert intents[0].phase == intent2.phase
    assert intents[0].requested_amount == intent2.requested_amount


@pytest.mark.django_db
def test_get_intents_when_multiple_intents_per_phase():
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    phase1 = "PHASE1"
    build_intent(phase1, address, 3)
    build_intent(phase1, address, 5)

    intents = TokenPurchaseIntent.objects.get_intent_summary(address, phase1)
    assert len(intents) == 2
    assert intents[0].requested_amount == 3
    assert intents[1].requested_amount == 5


@pytest.mark.django_db
def test_get_intents_when_multiple_intents_per_phase_with_multiple_phases():
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    another_address = "0xe9e6CAD692c46FDBC61b8cF1665f5597C440aC95"
    phase1 = "PHASE1"
    phase2 = "PHASE2"
    build_intent(phase1, address, 3)
    build_intent(phase1, address, 5)
    build_intent(phase1, another_address, 16)
    build_intent(phase2, address, 4)
    build_intent(phase2, address, 6)
    build_intent(phase2, another_address, 11)

    intents = TokenPurchaseIntent.objects.get_intent_summary(address, phase1)
    assert len(intents) == 2
    assert intents[0].requested_amount == 3
    assert intents[1].requested_amount == 5

    intents = TokenPurchaseIntent.objects.get_intent_summary(address, phase2)
    assert len(intents) == 2
    assert intents[0].requested_amount == 4
    assert intents[1].requested_amount == 6


@pytest.mark.django_db
def test_get_intents_for_phase():
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    another_address = "0xe9e6CAD692c46FDBC61b8cF1665f5597C440aC95"
    phase1 = "PHASE1"
    build_intent(phase1, address, 3)
    build_intent(phase1, address, 5)
    build_intent(phase1, another_address, 16)
    build_intent("PHASE2", address, 15)

    intents = TokenPurchaseIntent.objects.get_open_intents(address, phase1)
    assert len(intents) == 2
    assert intents[0].requested_amount == 3
    assert intents[1].requested_amount == 5


# It's possible in a failure case that an intent can be registered, but expires
# because the purchase is not completed. Expired intents should not count against
# the users quota.


@pytest.mark.django_db
def test_get_intents_with_expired_intents():
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    phase1 = "PHASE1"
    build_intent(phase1, address, 3)
    build_expired_intent(phase1, address, 10)
    build_intent(phase1, address, 5)

    intents = TokenPurchaseIntent.objects.get_intent_summary(address, phase1)
    assert len(intents) == 2
    assert intents[0].requested_amount == 3
    assert intents[1].requested_amount == 5


@pytest.mark.django_db
def test_get_intents_for_phase_with_some_expired():
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    another_address = "0xe9e6CAD692c46FDBC61b8cF1665f5597C440aC95"
    phase1 = "PHASE1"
    build_intent(phase1, address, 3)
    build_expired_intent(phase1, address, 5)
    build_intent(phase1, another_address, 16)
    build_intent("PHASE2", address, 25)

    intents = TokenPurchaseIntent.objects.get_open_intents(address, phase1)
    assert len(intents) == 1
    assert intents[0].requested_amount == 3


# An intent is created for (an example) 5 tokens to be bought, but the system receives
# an acknowledgement that only 3 tokens were acquired.

# It's difficult to think of a way this could happen, but I wanted to cover it anyway
# Either the chain notifies us that a mint happened, or a webhook from crossmint
# notifies us.


@pytest.mark.django_db
def test_get_intents_with_intents_that_are_partially_filled():
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    phase1 = "PHASE1"
    build_intent(phase1, address, 3)
    intent = build_expired_intent(phase1, address, 5)
    intent.confirmed_amount = 2
    intent.save()

    intents = TokenPurchaseIntent.objects.get_intent_summary(address, phase1)
    assert len(intents) == 2
    assert intents[0].requested_amount == 3
    assert intents[1].requested_amount == 5
    assert intents[1].confirmed_amount == 2


# The BE doesnt receive notification that the mint was successful from the FE.
# We use the eth_transfer events to tell us that the mint was successful.


@pytest.mark.django_db
def test_intents_get_confirmed_on_mint(mocker):
    mocker.patch("eth.service.get_current_phase", return_value="PHASE1")
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    phase1 = "PHASE1"
    build_intent(phase1, address, 1)

    player_ownership_updated.send(
        sender=None,
        token=999,
        new_owner=address,
        old_owner="0x0000000000000000000000000000000000000000",
    )

    intents = TokenPurchaseIntent.objects.all()
    assert len(intents) == 1
    assert intents[0].requested_amount == 1
    assert intents[0].confirmed_amount == 1


@pytest.mark.django_db
def test_intents_dont_get_confirmed_on_transfer_actions():
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    phase1 = "PHASE1"
    build_intent(phase1, address, 1)

    player_ownership_updated.send(
        sender=None,
        token=999,
        new_owner=address,
        old_owner="0xe9e6CAD692c46FDBC61b8cF1665f5597C440aC95",
    )

    intents = TokenPurchaseIntent.objects.all()
    assert len(intents) == 1
    assert intents[0].requested_amount == 1
    assert intents[0].confirmed_amount == 0

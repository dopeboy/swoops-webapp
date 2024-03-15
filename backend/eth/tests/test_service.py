import datetime

import ddf
import pytest
from django.utils import timezone

import eth.service
from eth.models import MintPhase, TokenPurchaseIntent


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


@pytest.mark.django_db
def test_record_purchase_confirmation_where_confirmation_fills_intent_fully(mocker):
    mocker.patch("eth.service.get_current_phase", return_value="PHASE1")

    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    phase = "PHASE1"
    build_intent(phase, address, 3)

    eth.service.record_purchase_confirmation(address, 3)

    intents = TokenPurchaseIntent.objects.all()
    assert len(intents) == 1
    assert intents[0].confirmed_amount == 3


@pytest.mark.django_db
def test_record_purchase_confirmation_where_confirmation_doenst_fill_intent_fully(
    mocker,
):  # noqa: E501
    mocker.patch("eth.service.get_current_phase", return_value="PHASE1")

    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    phase = "PHASE1"
    build_intent(phase, address, 3)

    eth.service.record_purchase_confirmation(address, 1)

    intents = TokenPurchaseIntent.objects.all()
    assert len(intents) == 1
    assert intents[0].confirmed_amount == 1


@pytest.mark.django_db
def test_record_purchase_confirmation_where_intent_is_needed_but_doenst_exist_so_new_intent_is_created(  # noqa: E501
    mocker,
):  # noqa: E501
    mocker.patch("eth.service.get_current_phase", return_value="PHASE1")

    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"

    eth.service.record_purchase_confirmation(address, 3)

    intents = TokenPurchaseIntent.objects.all()
    assert len(intents) == 1
    assert intents[0].requested_amount == 3
    assert intents[0].confirmed_amount == 3

    eth.service.record_purchase_confirmation(address, 1)
    intents = TokenPurchaseIntent.objects.all()
    assert len(intents) == 2


@pytest.mark.django_db
def test_record_purchase_confirmation_where_intent_exists_but_is_insufficent_so_overflow_is_created(  # noqa: E501
    mocker,
):  # noqa: E501
    mocker.patch("eth.service.get_current_phase", return_value="PHASE1")

    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    phase = "PHASE1"
    build_intent(phase, address, 3)

    eth.service.record_purchase_confirmation(address, 5)

    intents = TokenPurchaseIntent.objects.all()
    assert len(intents) == 2
    assert intents[0].requested_amount == 3
    assert intents[0].confirmed_amount == 3
    assert intents[1].requested_amount == 2
    assert intents[1].confirmed_amount == 2


@pytest.mark.django_db
def test_set_and_get_mint_phase():
    MintPhase.objects.set_current_phase("MY_PHASE")
    assert eth.service.get_current_phase() == "MY_PHASE"

    MintPhase.objects.set_current_phase("COOLEST_PHASE")
    assert eth.service.get_current_phase() == "COOLEST_PHASE"


@pytest.mark.django_db
def test_set_invalid_mint_phase_name():
    with pytest.raises(ValueError):
        MintPhase.objects.set_current_phase("INVALID_PHASE$")

import datetime

import ddf
import pytest
from django import urls
from django.utils import timezone

from signals.signals import player_ownership_updated


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


def build_expired_intent(phase, address, amount):
    return build_intent(
        phase, address, amount, expiry=timezone.now() - datetime.timedelta(weeks=52)
    )


@pytest.mark.django_db
def test_no_intents_registered(authed_client):
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    resp = authed_client.get(
        urls.reverse(
            "api:eth:token-purchase-intent", kwargs={"wallet_address": address}
        )
    )
    assert resp.status_code == 200
    assert resp.json()["count"] == 0


@pytest.mark.django_db
def test_create_intent(authed_client):
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    resp = authed_client.post(
        urls.reverse(
            "api:eth:token-purchase-intent", kwargs={"wallet_address": address}
        ),
        data={"requested_amount": 20},
        content_type="application/json",
    )
    assert resp.status_code == 201
    assert resp.json()["requested_amount"] == 20


@pytest.mark.django_db
def test_intents_across_phases_returned(authed_client):
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"
    another_address = "0xe9e6CAD692c46FDBC61b8cF1665f5597C440aC95"

    build_intent("PHASE0", address, 20)
    build_intent("PHASE0", address, 21)
    build_expired_intent("PHASE0", address, 9)
    build_intent("PHASE0", another_address, 23)

    build_intent("OWNERS_ONLY", address, 3)
    build_intent("OWNERS_ONLY", address, 1)
    build_expired_intent("OWNERS_ONLY", address, 33)
    build_intent("OWNERS_ONLY", another_address, 5)

    resp = authed_client.get(
        urls.reverse(
            "api:eth:token-purchase-intent", kwargs={"wallet_address": address}
        )
    )
    assert resp.status_code == 200
    assert resp.json()["count"] == 2
    assert resp.json()["results"][0]["phase"] == "OWNERS_ONLY"
    assert resp.json()["results"][0]["requested_amount"] == 3
    assert resp.json()["results"][0]["status"] == "IN_PROGRESS"
    assert resp.json()["results"][0]["wallet_address"] == address

    assert resp.json()["results"][1]["requested_amount"] == 1
    assert resp.json()["results"][1]["wallet_address"] == address
    assert resp.json()["results"][1]["status"] == "IN_PROGRESS"


@pytest.mark.django_db
def test_intents_end_to_end(authed_client):
    address = "0xf407dF7897ADa7B18Be503f6E45b992a682c3906"

    # create a few intents to prepare to recieve confirmations
    resp = authed_client.post(
        urls.reverse(
            "api:eth:token-purchase-intent", kwargs={"wallet_address": address}
        ),
        data={"requested_amount": 1},
        content_type="application/json",
    )
    assert resp.status_code == 201

    resp = authed_client.post(
        urls.reverse(
            "api:eth:token-purchase-intent", kwargs={"wallet_address": address}
        ),
        data={"requested_amount": 5},
        content_type="application/json",
    )

    assert resp.status_code == 201

    # issue a confirmation to be allocated to an intent
    player_ownership_updated.send(
        sender=None,
        token=1,
        new_owner=address,
        old_owner="0x0000000000000000000000000000000000000000",
    )

    resp = authed_client.get(
        urls.reverse(
            "api:eth:token-purchase-intent", kwargs={"wallet_address": address}
        )
    )
    assert resp.status_code == 200
    assert resp.json()["count"] == 2
    # first created intent gets the confirmation, marking it as completed
    assert resp.json()["results"][0]["phase"] == "OWNERS_ONLY"
    assert resp.json()["results"][0]["requested_amount"] == 1
    assert resp.json()["results"][0]["status"] == "COMPLETED"
    assert resp.json()["results"][0]["wallet_address"] == address

    # second is still waiting for intents
    assert resp.json()["results"][1]["requested_amount"] == 5
    assert resp.json()["results"][1]["wallet_address"] == address
    assert resp.json()["results"][1]["status"] == "IN_PROGRESS"
    assert resp.json()["results"][1]["phase"] == "OWNERS_ONLY"

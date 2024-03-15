import re

from django.db import models
from django.db.models import Q
from django.utils import timezone


class Transfer(models.Model):
    """Models a transfer event of a token

    to_address, from_address, and token are values that we
    parse from the topics of a record. The other fields are
    metadata from the transaction.
    """

    to_address = models.CharField(max_length=42, db_index=True)
    from_address = models.CharField(max_length=42)
    token = models.IntegerField()
    tx_hash = models.CharField(max_length=66)
    log_index = models.IntegerField()
    block = models.IntegerField(db_index=True)

    class Meta:
        unique_together = ("tx_hash", "log_index")


class TokenPurchaseIntentManager(models.Manager):
    def get_intent_summary(self, wallet_address, phase):
        now = timezone.now()
        qs = TokenPurchaseIntent.objects.filter(
            Q(wallet_address=wallet_address, phase=phase)
            & (Q(expires_at__gt=now) | (Q(expires_at__lt=now) & ~Q(confirmed_amount=0)))
        ).order_by("created_at")
        return qs

    def get_open_intents(self, wallet_address, phase):
        intents = TokenPurchaseIntent.objects.raw(
            """SELECT
                tpi.*
            FROM eth_tokenpurchaseintent tpi
            WHERE tpi.wallet_address = %(WALLET_ADDRESS)s
                AND phase = %(PHASE)s
                AND
                (expires_at > now() AND requested_amount != confirmed_amount)
                OR
                (expires_at < now() AND confirmed_amount != 0)
            ORDER BY tpi.created_at""",
            {"WALLET_ADDRESS": wallet_address, "PHASE": phase},
        )
        return list(intents)


class IntentSummary:
    def __init__(self, wallet_address, phase, requested_amount):
        self.wallet_address = wallet_address
        self.phase = phase
        self.requested_amount = requested_amount


class TokenPurchaseIntent(models.Model):
    """Models a token purchase intent of a user. Sometimes an intent is fulfilled (the
    token is successfully purchased) and sometimes it expires (the user does not
    purchase the token). When an intent expires while going unfulfilled, it no longer
    counts towards the token quota of the user."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    phase = models.CharField(max_length=20, null=False)
    wallet_address = models.CharField(max_length=42, db_index=True, null=False)
    requested_amount = models.IntegerField(default=0, null=False)
    confirmed_amount = models.IntegerField(default=0, null=False)
    expires_at = models.DateTimeField(blank=True, null=False)

    objects = TokenPurchaseIntentManager()


class MintPhaseManager(models.Manager):
    def get_current_phase(self):
        return MintPhase.objects.get().phase

    def set_current_phase(self, new_phase_name):
        valid_pattern = r"^[a-zA-Z0-9_-]+$"

        if not re.match(valid_pattern, new_phase_name):
            raise ValueError(
                "%s is invalid. Must follow regex '%s'", new_phase_name, valid_pattern
            )

        mint_phase = MintPhase.objects.get()
        mint_phase.phase = new_phase_name
        mint_phase.save()


class MintPhase(models.Model):
    """This represents the current phase of the minting process for SSN1."""

    updated_at = models.DateTimeField(auto_now=True)
    phase = models.CharField(max_length=20, null=False)

    objects = MintPhaseManager()

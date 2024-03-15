import datetime

from django.conf import settings
from django.db import models
from django.utils import timezone
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers

import eth.models
from eth.service import get_current_phase


class IntentStatus(models.TextChoices):
    COMPLETED = "COMPLETED"
    IN_PROGRESS = "IN_PROGRESS"


class TokenPurchaseIntentSerializer(serializers.ModelSerializer):
    phase = serializers.CharField(required=False)
    wallet_address = serializers.CharField(required=False)
    requested_amount = serializers.IntegerField()
    status = serializers.SerializerMethodField()

    @swagger_serializer_method(
        serializer_or_field=serializers.ChoiceField(choices=IntentStatus)
    )
    def get_status(self, tokenPurchaseIntent):
        if tokenPurchaseIntent.requested_amount != tokenPurchaseIntent.confirmed_amount:
            return IntentStatus.IN_PROGRESS
        return IntentStatus.COMPLETED

    class Meta:
        model = eth.models.TokenPurchaseIntent
        fields = ("phase", "wallet_address", "requested_amount", "status")

    def create(self, validated_data):
        return eth.models.TokenPurchaseIntent.objects.create(
            phase=get_current_phase(),
            expires_at=timezone.now()
            + datetime.timedelta(seconds=settings.TOKEN_PURCHASE_INTENT_EXPIRY_SECONDS),
            wallet_address=self.context["wallet_address"],
            requested_amount=validated_data["requested_amount"],
        )

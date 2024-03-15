import logging
import logging.config

from django.utils.log import DEFAULT_LOGGING
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, permissions

import eth.models
import eth.serializers
import eth.service
from eth.service import get_current_phase

logging.config.dictConfig(DEFAULT_LOGGING)
logger = logging.getLogger("django.server")


class TokenPurchaseIntentView(generics.ListCreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = eth.serializers.TokenPurchaseIntentSerializer

    def get_serializer_context(self):
        return {"wallet_address": self.kwargs["wallet_address"]}

    def get_queryset(self):
        return eth.models.TokenPurchaseIntent.objects.get_intent_summary(
            self.kwargs["wallet_address"], get_current_phase()
        )

    @swagger_auto_schema(
        responses={200: eth.serializers.TokenPurchaseIntentSerializer},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        request_body=eth.serializers.TokenPurchaseIntentSerializer,
        responses={200: eth.serializers.TokenPurchaseIntentSerializer(many=True)},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

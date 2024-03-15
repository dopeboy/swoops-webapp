import logging
import logging.config
from uuid import uuid4

from django.conf import settings
from django.contrib.auth import get_user_model, logout
from django.db import connection

# from django.db.models import Q
from django.shortcuts import redirect, render
from django.utils.log import DEFAULT_LOGGING
from drf_yasg.utils import swagger_auto_schema
from eth_hash.auto import keccak
from py_ecc.secp256k1 import ecdsa_raw_recover
from rest_framework import (
    authentication,
    exceptions,
    generics,
    permissions,
    response,
    status,
    views,
)
from rest_framework_simplejwt.tokens import RefreshToken
from web3 import Web3

import accounts.models
import accounts.serializers
import comm.handlers
import comm.notification
import utils.helpers

# import simulator.models
from signals.signals import new_account_created

from .permissions import IsSelf

logging.config.dictConfig(DEFAULT_LOGGING)
logger = logging.getLogger("django.server")


class SwoopsRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = RefreshToken.for_user(user)
        token["user_email"] = user.email
        return token


class CsrfExemptSessionAuthentication(authentication.SessionAuthentication):
    def enforce_csrf(self, request):
        return


class NonceCreationView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(
        request_body=accounts.serializers.WalletSerializer,
        responses={200: accounts.serializers.NonceSerializer},
    )
    def post(self, request):
        if not settings.AUTH_ENABLED:
            return response.Response(
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = accounts.serializers.WalletSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        wallet_address = Web3.toChecksumAddress(
            serializer.validated_data["wallet_address"]
        )
        user, new_account = get_user_model().objects.get_or_create(
            wallet_address=wallet_address
        )

        user.nonce = self.generate_nonce()
        user.save(update_fields=["nonce"])

        if new_account:
            new_account_created.send(
                sender=self.__class__, user_id=user.id, wallet=wallet_address
            )

        return response.Response(accounts.serializers.NonceSerializer(user).data)

    def generate_nonce(self):
        return uuid4()


class NonceVerificationView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(
        request_body=accounts.serializers.NonceVerificationSerializer,
        responses={
            200: accounts.serializers.AccessTokenSerializer,
            404: accounts.serializers.LoginErrorSerializer,
        },
    )
    def post(self, request):
        if not settings.AUTH_ENABLED:
            return response.Response(
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = accounts.serializers.NonceVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        wallet_address = Web3.toChecksumAddress(
            serializer.validated_data["wallet_address"]
        )

        user = get_user_model().objects.get(wallet_address=wallet_address)
        new_email = serializer.validated_data.get("email")
        new_signup = False

        if new_email:
            try:
                # Because we have duplicate emails with different cases,
                # if we come across this, pick the one that joined most recently.
                existing_user = (
                    get_user_model()
                    .objects.filter(email__iexact=new_email)
                    .order_by("date_joined")
                    .last()
                )

                # If we didn't find a user, begin new signup flow.
                if not existing_user:
                    raise get_user_model().DoesNotExist

                if (
                    existing_user
                    and existing_user.wallet_address.lower() != wallet_address.lower()
                ):
                    return response.Response(
                        {
                            "detail": (
                                "This email is already "
                                "in use by a different account."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except get_user_model().DoesNotExist:
                # The email is not in use yet, so we can safely assign it to the user.
                new_signup = True

        # THIS IS JUST FOR WHEN A USER SIGNS UP FOR THE
        # FIRST TIME VIA SOCIAL, NOT CRYPTO WALLET
        if new_signup:
            user.email = new_email.lower()
            user.is_social_sign_in_user = True
            user.is_verified = True
            user.save()

            try:
                # send welcome email if new user
                comm.handlers.user_signup_handler(user)
            except Exception as e:
                logger.error(f"Error sending signup email: {str(e)}")

            try:
                slack_msg = (
                    f"{user.email} signed up with "
                    f"{'social' if user.is_social_sign_in_user else 'crypto'}"
                )
                comm.notification.notify_slack_user_signup(slack_msg)
            except Exception as e:
                logger.error(f"Error sending slack notification: {str(e)}")

        nonce = self.consume_nonce(user)
        self.validate_siged_message(
            nonce, serializer.validated_data["signed_message"], wallet_address
        )

        token = SwoopsRefreshToken.for_user(user)

        return response.Response(
            accounts.serializers.AccessTokenSerializer(
                {
                    "access": str(token.access_token),
                    "refresh": str(token),
                    "id": user.id,
                }
            ).data
        )

    def validate_siged_message(self, nonce, signed_message, wallet_address):
        try:
            recovered_address = self.recover_wallet_used_to_sign(
                self.recreate_message_user_signed(nonce), signed_message
            )

            if recovered_address.upper() != wallet_address.upper():
                raise ValueError(
                    "The recovered address from the signed message doesn't match "
                    + "the wallet address on file."
                )

        except ValueError as e:
            logger.info("Signature verification failed! {}".format(str(e)))
            raise exceptions.AuthenticationFailed(
                "Error verifying signature. Try again."
            )
        except Exception as e:
            logger.critical("Error during signature verification! {}".format(str(e)))
            raise exceptions.server_error("Error verifying signature. Try again.")

    def consume_nonce(self, user):
        nonce = user.nonce
        user.nonce = None
        user.save(update_fields=["nonce"])

        return nonce

    def recreate_message_user_signed(self, nonce):
        return (
            "Hey, just one more step! We need you to confirm you wanna sign in "
            f"by clicking the Sign button down below.\n\n Request nonce: {nonce}"
        )

    def sig_to_vrs(self, sig):
        r = int(sig[2:66], 16)
        s = int(sig[66:130], 16)
        v = int(sig[130:], 16)
        return v, r, s

    def hash_personal_message(self, msg):
        padded = "\x19Ethereum Signed Message:\n" + str(len(msg)) + msg
        return keccak(bytes(padded, "utf8"))

    @staticmethod
    def encode_to_int32(v):
        return v.to_bytes(32, byteorder="big")

    def recover_wallet_used_to_sign(self, msg, sig):
        msghash = self.hash_personal_message(msg)
        vrs = self.sig_to_vrs(sig)

        result = ecdsa_raw_recover(msghash, vrs)
        if result:
            x, y = result
            pub = NonceVerificationView.encode_to_int32(
                x
            ) + NonceVerificationView.encode_to_int32(y)
        else:
            raise ValueError("Invalid VRS- can't recreate public key")

        assert len(pub) == 64
        recovery = keccak(pub)

        return "0x" + recovery.hex()[24:]


class TokenRefreshView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        responses={
            200: accounts.serializers.AccessTokenSerializer,
            403: "",
        },
    )
    def get(self, request):
        self.check_permissions(request)
        user = get_user_model().objects.get(pk=request.user.id)
        token = SwoopsRefreshToken.for_user(user)

        return response.Response(
            accounts.serializers.AccessTokenSerializer(
                {
                    "access": str(token.access_token),
                    "refresh": str(token),
                    "id": user.id,
                }
            ).data
        )


class LogoutView(generics.CreateAPIView):
    def post(self, request):
        logout(request)
        return response.Response()


class SendVerificationEmailView(generics.CreateAPIView):
    def post(self, request):
        comm.handlers.verification_email_handler(
            accounts.models.User.objects.filter(pk=request.user.id).get()
        )

        return response.Response()


class VerifyEmailView(views.APIView):
    authentication_classes = []  # disables authentication
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        query_serializer=accounts.serializers.EmailVerificationSerializer,
        responses={400: accounts.serializers.EmailVerificationErrorSerializer},
    )
    def get(self, request):
        serializer = accounts.serializers.EmailVerificationSerializer(
            data=request.query_params
        )
        serializer.is_valid(raise_exception=True)
        serializer.update(serializer.validated_data)
        return redirect("{}email-verified".format(settings.SWOOPS_APP_BASEURL))


def email_verified_view(request):
    context = {}
    return render(request, "email_verified.html", context)


class UserDetail(generics.RetrieveUpdateAPIView):
    permission_classes = (IsSelf,)
    lookup_field = "id"

    def get_queryset(self):
        return get_user_model().objects.filter(pk=self.kwargs["id"])

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return accounts.serializers.UpdateUserSerializer
        return accounts.serializers.UserSerializer

    @swagger_auto_schema(
        request_body=accounts.serializers.UpdateUserSerializer,
        responses={
            200: accounts.serializers.UpdateUserSerializer,
        },
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(
        responses={
            200: accounts.serializers.UserSerializer,
        },
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        request_body=accounts.serializers.UpdateUserSerializer,
        responses={
            200: accounts.serializers.UpdateUserSerializer,
        },
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


# This is an internal view for tracking user progress.
def index(request):
    cursor = connection.cursor()
    cursor.execute(
        """
        select
            u.id as "user_id",
            t.id as "team_id",
            u.email as "email",
            u.is_social_sign_in_user,
            u.is_verified,
            t.name as "team_name",
            u.date_joined AT TIME ZONE 'America/New_York' as "date_joined",
            u.signup_referrer_code,
            ta.completed_at,
            COALESCE(cs.total_sp,0) as "total_sp",
            COALESCE(cs.played,0) as "games_played"
        from accounts_user u
            inner join game_team t on t.owner_id=u.id
            inner join accounts_tutorial ta on u.tutorial_id=ta.id
            left join view_current_season_team_sp cs on t.id=cs.team_id
        order by u.date_joined desc
        limit 1000
        """
    )

    context = {
        "users": utils.helpers.dictfetchall(cursor),
    }

    cursor.close()

    # Render the HTML template index.html with the data in the context variable
    return render(request, "users.html", context=context)

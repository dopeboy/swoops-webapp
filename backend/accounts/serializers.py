import base64
import hashlib
import hmac
import logging
import logging.config

from django.conf import settings
from django.db.models import Q
from django.utils.log import DEFAULT_LOGGING
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueValidator

import comm.handlers
import comm.notification
import game.models
import game.serializers

from .models import Tutorial, User

logging.config.dictConfig(DEFAULT_LOGGING)
logger = logging.getLogger("django.server")


class WalletSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)


class NonceSerializer(serializers.Serializer):
    nonce = serializers.UUIDField()


class NonceVerificationSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
    signed_message = serializers.CharField(max_length=200)
    email = serializers.EmailField(required=False, allow_blank=False)


class LoginErrorSerializer(serializers.Serializer):
    detail = serializers.CharField()


class EmailVerificationErrorSerializer(serializers.Serializer):
    token = serializers.UUIDField(
        source="email_verification_token", format="hex_verbose"
    )


class TutorialSerializer(serializers.ModelSerializer):
    skip_tutorial = serializers.BooleanField(required=False, write_only=True)
    completed_step_number = serializers.IntegerField(required=False, write_only=True)
    next_step_number = serializers.SerializerMethodField()

    class Meta:
        model = Tutorial
        fields = (
            "skip_tutorial",
            "completed_step_number",
            "next_step_number",
            "completed_at",
        )
        read_only_fields = (
            "next_step_number",
            "completed_at",
        )

    def validate_step_number(self, value):
        if not Tutorial.is_step_number_valid(value):
            raise ValidationError("Invalid step number provided.")
        return value

    def update(self, tutorial, validated_data):
        if (
            "skip_tutorial" in validated_data
            and validated_data["skip_tutorial"] is True
        ):
            tutorial.update_step_number(step_number=None, skip_tutorial=True)

        if "completed_step_number" in validated_data:
            tutorial.update_step_number(
                step_number=validated_data["completed_step_number"]
            )

        return tutorial

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_next_step_number(self, tutorial):
        return tutorial.get_next_step_number()


class UserSerializer(serializers.ModelSerializer):
    team = game.serializers.TeamSerializer()
    magic_bell_hmac = serializers.SerializerMethodField()
    tutorial = TutorialSerializer()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "is_active",
            "reveal_games_by_default",
            "is_verified",
            "team",
            "magic_bell_hmac",
            "preferred_lobby_size",
            "tutorial",
        )

        read_only_fields = (
            "id",
            "is_active",
            "is_verified",
            "magic_bell_hmac",
            "tutorial",
        )
        extra_kwargs = {
            "password": {"required": True, "write_only": True},
            "name": {"required": True},
        }

    @staticmethod
    def validate_email(value):
        pass
        # return validate_username(value)

    def create(self, validated_data):
        return User.objects.create_user(
            validated_data.pop("email"),
            validated_data.pop("password"),
            **validated_data,
        )

    # https://www.magicbell.com/docs/hmac-authentication
    @swagger_serializer_method(serializer_or_field=serializers.CharField())
    def get_magic_bell_hmac(self, user):
        byte_key = bytes(settings.MAGIC_BELL_API_SECRET, "UTF-8")
        message = str(user.id).encode()
        h = hmac.new(byte_key, message, hashlib.sha256)
        return base64.b64encode(h.digest())


class EmailVerificationSerializer(serializers.ModelSerializer):
    token = serializers.UUIDField(
        source="email_verification_token", format="hex_verbose"
    )

    class Meta:
        model = User
        fields = ("token",)
        read_only_fields = ("token",)

    def update(self, validated_data):
        try:
            user = User.objects.get(
                email_verification_token=validated_data["email_verification_token"]
            )
            user.is_verified = True
            user.save()

            # THIS IS JUST FOR WHEN A USER SIGNS UP FOR THE
            # FIRST TIME VIA CRYPTO WALLET, NOT SOCIAL
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

            return user
        except User.DoesNotExist:
            pass


class AccessTokenSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    id = serializers.CharField()


class UpdateUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="This email address has been already registered.",
                lookup="iexact",
            )
        ],
        required=False,
    )
    reveal_games_by_default = serializers.BooleanField(required=False)
    tutorial = TutorialSerializer(required=False)

    def reveal_all_user_prior_games(self, user):
        for game_obj in (
            game.models.Game.objects.select_related(
                "lineup_1__team",
                "lineup_2__team",
            )
            .filter(
                Q(Q(lineup_1__team__owner=user) & Q(revealed_to_user_1=False))
                | Q(Q(lineup_2__team__owner=user) & Q(revealed_to_user_2=False))
            )
            .filter(visibility=game.models.Game.Visibility.PUBLIC)
        ):
            if game_obj.lineup_1:
                if game_obj.lineup_1.team.owner == user:
                    game_obj.revealed_to_user_1 = True

            if game_obj.lineup_2:
                if game_obj.lineup_2.team.owner == user:
                    game_obj.revealed_to_user_2 = True

            game_obj.save()

    def update(self, instance, validated_data):
        if "email" in validated_data:
            instance.email = validated_data["email"].lower()
            instance.is_verified = False
            comm.handlers.verification_email_handler(instance)

        if "reveal_games_by_default" in validated_data:
            instance.reveal_games_by_default = validated_data["reveal_games_by_default"]
            self.reveal_all_user_prior_games(instance)

        if "preferred_lobby_size" in validated_data:
            if validated_data["preferred_lobby_size"] not in [1, 3, 5]:
                raise ValidationError(
                    (
                        f'{validated_data["preferred_lobby_size"]} Invalid entry. '
                        "Lobby size must be 1,3,5"
                    )
                )

            instance.preferred_lobby_size = validated_data["preferred_lobby_size"]

        if "signup_referrer_code" in validated_data:
            instance.signup_referrer_code = validated_data["signup_referrer_code"]

        if instance.tutorial and "tutorial" in validated_data:
            ts = TutorialSerializer(data=validated_data["tutorial"])
            ts.update(
                validated_data=validated_data["tutorial"], tutorial=instance.tutorial
            )

        instance.save()

        return instance

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "is_social_sign_in_user",
            "is_active",
            "preferred_lobby_size",
            "reveal_games_by_default",
            "is_verified",
            "team",
            "tutorial",
            "signup_referrer_code",
        )
        read_only_fields = ("id", "is_active", "is_verified", "team")

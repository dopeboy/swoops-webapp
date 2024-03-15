import boto3
from django import forms
from django.conf import settings
from django.contrib import admin
from django.utils import timezone
from django.utils.html import mark_safe

import comm.handlers
import moderation.models
import moderation.tasks
import simulator.client
import simulator.models
from game.models import Player
from moderation.processing import update_current_player_card_and_name
from services.s3_helper import S3Helper

from .models import TeamLogoChangeRequest, TeamNameChangeRequest

s3_helper = S3Helper(
    settings.AWS_IMAGES_BUCKET_NAME,
    settings.AWS_IMAGES_BUCKET_ACCESS_KEY,
    settings.AWS_IMAGES_BUCKET_SECRET,
)


# TODO - consolidate two classes below
class TeamLogoChangeRequestAdmin(admin.ModelAdmin):
    list_display = (
        "requester_email",
        "status",
        "create_date",
    )
    ordering = ("-create_date",)
    readonly_fields = ("proposed_logo_img_tag",)

    def requester_email(self, obj):
        return obj.requesting_user.email

    def proposed_logo_img_tag(self, obj):
        if obj.path:
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_UGC_BUCKET_ACCESS_KEY,
                aws_secret_access_key=settings.AWS_UGC_BUCKET_SECRET,
            )
            url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.AWS_UGC_BUCKET_NAME, "Key": obj.path},
                ExpiresIn=100,
            )
            return mark_safe('<img src="%s" />' % (url))
        else:
            return "N/A"

    proposed_logo_img_tag.short_description = "Proposed logo"


class TeamNameChangeRequestAdmin(admin.ModelAdmin):
    list_display = (
        "requester_email",
        "status",
        "create_date",
    )
    ordering = ("-create_date",)

    def requester_email(self, obj):
        return obj.requesting_user.email


admin.site.register(TeamNameChangeRequest, TeamNameChangeRequestAdmin)
admin.site.register(TeamLogoChangeRequest, TeamLogoChangeRequestAdmin)


@admin.register(moderation.models.PlayerNameChangeRequest)
class PlayerNameChangeRequestAdmin(admin.ModelAdmin):
    list_display = ["owner_email", "name", "status", "create_date"]
    list_filter = ["status", "create_date", "reviewed_on"]
    readonly_fields = (
        "name",
        "player_token",
        "owner",
        "owner_email",
    )
    search_fields = [
        "requesting_user__wallet_address",
        "requesting_user__email",
        "player__simulated__full_name",
    ]
    ordering = ("-create_date",)

    def has_add_permission(self, request, obj=None):
        return False

    def get_form(self, request, instance=None, **kwargs):
        self.exclude = (
            "created_at",
            "player",
            "acknowledged",
            "reviewed_by",
            "reviewed_on",
            "create_date",
            "requesting_user",
            "proposed_front_naked_key",
            "proposed_back_key",
        )
        form = super(PlayerNameChangeRequestAdmin, self).get_form(
            request, instance, **kwargs
        )
        return form

    def save_model(self, request, instance, form, change):
        if instance.status == moderation.models.Status.ACCEPTED.value:
            if Player.objects.filter(
                simulated__full_name__iexact=instance.name
            ).exists():
                raise forms.ValidationError("Player name must be unique.")

            # Call the simulator, update on our side, generate images
            update_current_player_card_and_name(instance.player_token)

            instance.reviewed_on = timezone.now()
            instance.reviewed_by = request.user
            super().save_model(request, instance, form, change)

            player = instance.player
            player.first_named_on = timezone.now()
            player.save()

            # send email player name request accepted
            comm.handlers.player_name_approved_handler(
                instance.requesting_user, instance.player_token, instance.name
            )

        elif instance.status == moderation.models.Status.REJECTED.value:
            instance.reviewed_on = timezone.now()
            instance.reviewed_by = request.user
            super().save_model(request, instance, form, change)
            comm.handlers.player_name_rejected_handler(
                instance.requesting_user, instance.reject_reason
            )


@admin.register(moderation.models.PlayerTokenChangeRequest)
class PlayerTokenChangeRequestAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "proposed_token",
        "prior_tokens",
        "requesting_user",
        "reviewed_on",
        "status",
    )
    search_fields = ("player__simulated__full_name",)
    list_filter = ("reviewed_on", "status")
    autocomplete_fields = ("player",)
    readonly_fields = (
        "status",
        "player_card",
    )

    exclude = (
        "reviewed_by",
        "reviewed_on",
        "create_date",
        "requesting_user",
        "reject_reason",
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super(PlayerTokenChangeRequestAdmin, self).get_form(
            request, obj, **kwargs
        )
        sim_player = simulator.models.Player.objects.all().order_by("token").last()
        form.base_fields["proposed_token"].initial = sim_player.token + 1
        return form

    def save_model(self, request, instance, form, change):
        simulator_client = simulator.client.get()

        sim_player = instance.player.simulated
        simulator_client.update_player_token(
            sim_player.canonical, instance.proposed_token
        )

        prior_token = sim_player.token
        sim_player.prior_tokens.append(sim_player.token)
        sim_player.token = instance.proposed_token
        sim_player.save()

        if not instance.requesting_user_id:
            instance.requesting_user_id = request.user.id

        instance.status = moderation.models.Status.ACCEPTED

        instance.reviewed_on = timezone.now()
        instance.reviewed_by = request.user

        # retrieve S3 object
        for ext in ["", "_no_bg"]:
            prior_key = (
                f"{settings.AWS_IMAGES_BUCKET_CURRENT_SEASON_PATH}"
                f"{prior_token}{ext}.png"
            )
            new_key = (
                f"{settings.AWS_IMAGES_BUCKET_CURRENT_SEASON_PATH}"
                f"{sim_player.token}{ext}.png"
            )
            s3_helper.copy_image(prior_key, new_key)

        super().save_model(request, instance, form, change)

    def player_card(self, instance):
        return mark_safe(
            f"""
                <table>
                    <tr>
                    <th></th>
                    <th>No Background</th>
                    <th>Background</th>
                  </tr>
                  <tr>
                    <td>
                        <img src="{settings.AWS_IMAGES_BUCKET_URL}{settings.AWS_IMAGES_BUCKET_CURRENT_SEASON_PATH}{instance.proposed_token}.png" width="250"/>
                    </td>
                    <td>
                        <img src="{settings.AWS_IMAGES_BUCKET_URL}{settings.AWS_IMAGES_BUCKET_CURRENT_SEASON_PATH}{instance.proposed_token}_no_bg.png" width="250"/>
                    </td>
                    <td>
                        <img src="{settings.AWS_IMAGES_BUCKET_URL}{settings.AWS_IMAGES_BUCKET_CURRENT_SEASON_PATH}{instance.proposed_token}_with_bg.png" width="250"/>
                    </td>
                  </tr>
                </table>
            """  # noqa: E501
        )

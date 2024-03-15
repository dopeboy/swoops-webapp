import uuid
from io import BytesIO

import boto3
import requests
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from PIL import Image

import comm.handlers
import moderation.models
import moderation.service
from signals.signals import (
    team_logo_change_accepted,
    team_logo_change_requested,
    team_name_change_accepted,
    team_name_change_requested,
)

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_UGC_BUCKET_ACCESS_KEY,
    aws_secret_access_key=settings.AWS_UGC_BUCKET_SECRET,
)


@receiver(team_name_change_requested)
def handle_team_name_change_request(sender, **kwargs):
    moderation.service.ModerationService().submit_team_name_change(
        team_id=kwargs["team_id"],
        new_name=kwargs["name"],
        requesting_user=kwargs["requesting_user"],
    )


@receiver(post_save, sender=moderation.models.TeamNameChangeRequest)
def handle_team_name_request_status_change(sender, **kwargs):
    team_name_change_request = kwargs["instance"]
    if team_name_change_request.status == moderation.models.Status.ACCEPTED:

        team_name_change_accepted.send(
            sender=moderation.models.TeamNameChangeRequest.__class__,
            team_id=team_name_change_request.team_id,
            name=team_name_change_request.name,
        )
        # Awkward way to not fire signal. `save()` will fire signal resulting
        # in and infinite loop
        moderation.models.TeamNameChangeRequest.objects.filter(
            pk=team_name_change_request.pk
        ).update(reviewed_on=timezone.now())

        send_team_name_approved_email(team_name_change_request.requesting_user)

    if team_name_change_request.status == moderation.models.Status.REJECTED:
        send_rejected_email(
            team_name_change_request.requesting_user,
            team_name_change_request.reject_reason,
        )


@receiver(team_logo_change_requested)
def handle_team_logo_change_request(sender, **kwargs):
    moderation.service.ModerationService().submit_team_logo_change(
        team_id=kwargs["team_id"],
        path=kwargs["path"],
        requesting_user=kwargs["requesting_user"],
    )


@receiver(post_save, sender=moderation.models.TeamLogoChangeRequest)
def handle_team_logo_request_status_change(sender, **kwargs):
    team_logo_change_request = kwargs["instance"]
    if team_logo_change_request.status == moderation.models.Status.ACCEPTED:
        # Upload logo - NOTE INTEGRATE WITH s3_helper in the future
        # 1. Generate signed URL for logo
        # 2. Fetch image, load in memory, generate uuid for filename
        # 3. Save in user's folder in UGC bucket as X_original.png
        # 4. Save in user's folder in UGC bucket as X_200x200.png
        # 5. Save in user's folder in UGC bucket as X_400x400.png

        # (1)
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.AWS_UGC_BUCKET_NAME,
                "Key": team_logo_change_request.path,
            },
            ExpiresIn=100,  # seconds
        )

        # (2)
        r = requests.get(url)
        randomfilename = str(uuid.uuid4())

        # (3)
        keyoriginal = (
            f"{team_logo_change_request.requesting_user.id}/"
            f"logo_{randomfilename}.png"
        )
        imoriginal = Image.open(BytesIO(r.content))
        pngdata_original = BytesIO()
        imoriginal.save(pngdata_original, format="png")
        imoriginal.close()

        s3_client.put_object(
            Body=pngdata_original.getvalue(),
            Bucket=settings.AWS_UGC_BUCKET_NAME,
            Key=keyoriginal,
        )

        s3_client.put_object_acl(
            ACL="public-read", Bucket=settings.AWS_UGC_BUCKET_NAME, Key=keyoriginal
        )

        # (4)
        key_200 = (
            f"{team_logo_change_request.requesting_user.id}/"
            f"logo_{randomfilename}_200x200.png"
        )
        im200 = Image.open(BytesIO(r.content))
        im200 = im200.resize((200, 200), Image.ANTIALIAS)
        pngdata_200 = BytesIO()
        im200.save(pngdata_200, format="png", quality=95)
        im200.close()

        s3_client.put_object(
            Body=pngdata_200.getvalue(),
            Bucket=settings.AWS_UGC_BUCKET_NAME,
            Key=key_200,
        )

        s3_client.put_object_acl(
            ACL="public-read", Bucket=settings.AWS_UGC_BUCKET_NAME, Key=key_200
        )

        # (5)
        key_400 = (
            f"{team_logo_change_request.requesting_user.id}/"
            f"logo_{randomfilename}_400x400.png"
        )
        im400 = Image.open(BytesIO(r.content))
        im400 = im400.resize((400, 400), Image.ANTIALIAS)
        pngdata_400 = BytesIO()
        im400.save(pngdata_400, format="png", quality=95)
        im400.close()

        s3_client.put_object(
            Body=pngdata_400.getvalue(),
            Bucket=settings.AWS_UGC_BUCKET_NAME,
            Key=key_400,
        )

        s3_client.put_object_acl(
            ACL="public-read", Bucket=settings.AWS_UGC_BUCKET_NAME, Key=key_400
        )

        team_logo_change_accepted.send(
            sender=moderation.models.TeamLogoChangeRequest.__class__,
            team_id=team_logo_change_request.team_id,
            path=keyoriginal,
        )
        send_team_logo_approved_email(team_logo_change_request.requesting_user)
        # Awkward way to not fire signal. `save()` will fire signal resulting
        # in and infinite loop
        moderation.models.TeamLogoChangeRequest.objects.filter(
            pk=team_logo_change_request.pk
        ).update(reviewed_on=timezone.now())

    if team_logo_change_request.status == moderation.models.Status.REJECTED:
        send_team_logo_rejected_email(
            team_logo_change_request.requesting_user,
            team_logo_change_request.reject_reason,
        )


def send_team_name_approved_email(user):
    comm.handlers.team_name_approved_handler(user)


def send_rejected_email(user, rejection_reason):
    comm.handlers.team_name_rejected_handler(user, rejection_reason)


def send_team_logo_approved_email(user):
    comm.handlers.team_logo_approved_handler(user)


def send_team_logo_rejected_email(user, rejection_reason):
    comm.handlers.team_logo_rejected_handler(user, rejection_reason)

from django.conf import settings
from django.db import models

import game.models


class Status(models.TextChoices):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELED = "CANCELED"


class BaseModeration(models.Model):
    create_date = models.DateTimeField(auto_now_add=True)
    reviewed_on = models.DateTimeField(null=True, blank=True, default=None)
    requesting_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="+",
        blank=False,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="+",
    )
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING, blank=False
    )
    reject_reason = models.TextField(blank=True)

    class Meta:
        abstract = True


class TeamNameChangeRequest(BaseModeration):
    name = models.TextField(db_index=True)
    team = models.ForeignKey("game.Team", on_delete=models.PROTECT)


class TeamLogoChangeRequest(BaseModeration):
    path = models.CharField(max_length=256)
    team = models.ForeignKey("game.Team", on_delete=models.PROTECT)


class PlayerNameChangeRequest(BaseModeration):
    player = models.ForeignKey(game.models.Player, on_delete=models.PROTECT)
    name = models.CharField(max_length=30)

    # NOTE 7/18 - these need to be deprecated. We no longer
    # put names on player cards
    proposed_front_naked_key = models.CharField(max_length=100, blank=True, default="")
    proposed_back_key = models.CharField(max_length=100, blank=True, default="")

    @property
    def is_owner(self):
        return game.models.Player.objects.players_owned_by_user(
            self.requesting_user.id
        ).exists()

    @property
    def owner(self):
        if self.is_owner:
            return self.requesting_user.wallet_address

        return "????"

    @property
    def owner_email(self):
        if self.is_owner:
            return self.requesting_user.email

        return "????"

    @property
    def player_token(self):
        return self.player.simulated.token

    def __str__(self):
        return f"{self.name}"


class PlayerTokenChangeRequestManager(models.Manager):
    def get_queryset(self):
        return (
            super(PlayerTokenChangeRequestManager, self)
            .get_queryset()
            .select_related(
                "player",
                "player__simulated",
            )
        )


class PlayerTokenChangeRequest(BaseModeration):
    player = models.ForeignKey(game.models.Player, on_delete=models.PROTECT)
    proposed_token = models.IntegerField(null=True, unique=True)

    @property
    def prior_tokens(self):
        if self.player.simulated.prior_tokens:
            return ",".join(
                [str(token) for token in self.player.simulated.prior_tokens]
            )
        return ""

    @property
    def name(self):
        return self.player.simulated.full_name

    objects = PlayerTokenChangeRequestManager()

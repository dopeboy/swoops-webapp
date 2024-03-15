from uuid import uuid4

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, username_field, username, password, **extra_fields):
        """Create and save a user with the given email, and
        password.
        """
        if not username:
            raise ValueError("The username field must be set")

        user = self.model(
            **{username_field: username},
            tutorial=Tutorial.objects.create(),
            **extra_fields,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, wallet_address, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(
            User.USERNAME_FIELD, wallet_address, password, **extra_fields
        )

    # the createsuperuser task passes the user identifier to createsuperuser with the
    # positional argument name of User.USERNAME_FIELD. Regular users use wallet_address,
    # but superusers use email, so the argument name is wallet_address but it actually
    # holds and email.
    def create_superuser(self, wallet_address, password, **extra_fields):
        email = wallet_address
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        email = super().normalize_email(email)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(
            User.SUPERUSER_USERNAME_FIELD, email, password, **extra_fields
        )


class User(AbstractBaseUser, PermissionsMixin):
    id = models.BigAutoField(primary_key=True)
    wallet_address = models.CharField(
        unique=True, db_index=True, max_length=42, null=True
    )
    email = models.EmailField(max_length=255, null=True, unique=True)
    email_verification_token = models.UUIDField(
        default=uuid4, blank=False, null=False, unique=True
    )
    nonce = models.UUIDField(null=True)
    is_staff = models.BooleanField(
        "staff status",
        default=False,
        help_text="Designates whether the user can log into " "this admin site.",
    )
    is_active = models.BooleanField(
        "active",
        default=True,
        help_text="Designates whether this user should be "
        "treated as active. Unselect this instead "
        "of deleting accounts.",
    )
    is_verified = models.BooleanField(
        "verified",
        default=False,
        help_text="Designates whether this user has verified their email or not.",
    )
    is_social_sign_in_user = models.BooleanField(
        "is_social_sign_in_user",
        default=False,
        help_text="Designates whether the user has used social signin.",
    )
    preferred_lobby_size = models.PositiveIntegerField(
        help_text="user's preferred lobby size",
        default=1,
    )
    reveal_games_by_default = models.BooleanField(
        "reveal_games_by_default",
        default=False,
        help_text="Reveal all game scores by default.",
    )
    signup_referrer_code = models.CharField(max_length=256, blank=True, null=True)

    tutorial = models.OneToOneField(
        "accounts.Tutorial",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text="This tracks the user's progress in the tutorial.",
    )

    date_joined = models.DateTimeField("date joined", default=timezone.now)

    # Add additional fields here if needed
    objects = UserManager()
    USERNAME_FIELD = "wallet_address"
    USER_BACKEND = "django.contrib.auth.backends.ModelBackend"
    SUPERUSER_USERNAME_FIELD = "email"

    def __str__(self):
        return (
            f"userId={self.id} wallet_address={self.wallet_address} email={self.email}"
        )


# Each step maps to a page. The frontend stores the mapping between step ID
# and page.
# NOTE - if a step is added, ensure the helper methods below
# are adjusted too!
class Tutorial(models.Model):
    step_100_completed_at = models.DateTimeField(null=True, blank=True)
    step_200_completed_at = models.DateTimeField(null=True, blank=True)
    step_300_completed_at = models.DateTimeField(null=True, blank=True)
    step_400_completed_at = models.DateTimeField(null=True, blank=True)
    step_500_completed_at = models.DateTimeField(null=True, blank=True)
    step_600_completed_at = models.DateTimeField(null=True, blank=True)
    step_700_completed_at = models.DateTimeField(null=True, blank=True)
    step_800_completed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=(
            "The datetime at which the user has completed " "the entire tutorial."
        ),
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    # A version maps to a particular sequence of steps (eg version 1
    # maps to 100->200->300...->800). Suppose we wanted to adopt a new
    # sequence like 100->300...->801. We would change
    # `CURRENT_TUTORIAL_VERSION` and update the mapping in the frontend
    # This approach opens up the possibility to give different users different
    # tutorial flows.
    version = models.PositiveIntegerField(
        help_text="A version maps to a particular sequence of steps.",
        default=settings.CURRENT_TUTORIAL_VERSION,
    )

    # This list should match all the fields up above
    @staticmethod
    def is_step_number_valid(step_number):
        return step_number in (100, 200, 300, 400, 500, 600, 700, 800)

    def update_step_number(self, step_number, skip_tutorial=False):
        if skip_tutorial:
            if self.version == 1:
                self.step_100_completed_at = timezone.now()
                self.step_200_completed_at = timezone.now()
                self.step_300_completed_at = timezone.now()
                self.step_400_completed_at = timezone.now()
                self.step_500_completed_at = timezone.now()
                self.step_600_completed_at = timezone.now()
                self.step_700_completed_at = timezone.now()
                self.step_800_completed_at = timezone.now()
                self.completed_at = timezone.now()

        else:
            if self.version == 1:
                if step_number == 100:
                    self.step_100_completed_at = timezone.now()
                elif step_number == 200:
                    self.step_200_completed_at = timezone.now()
                elif step_number == 300:
                    self.step_300_completed_at = timezone.now()
                elif step_number == 400:
                    self.step_400_completed_at = timezone.now()
                elif step_number == 500:
                    self.step_500_completed_at = timezone.now()
                elif step_number == 600:
                    self.step_600_completed_at = timezone.now()
                elif step_number == 700:
                    self.step_700_completed_at = timezone.now()
                elif step_number == 800:
                    self.step_800_completed_at = timezone.now()
                    self.completed_at = timezone.now()

        self.save()

    def get_next_step_number(self):
        if self.completed_at:
            return None

        elif self.version == 1:
            if not self.step_100_completed_at:
                return 100
            elif not self.step_200_completed_at:
                return 200
            elif not self.step_300_completed_at:
                return 300
            elif not self.step_400_completed_at:
                return 400
            elif not self.step_500_completed_at:
                return 500
            elif not self.step_600_completed_at:
                return 600
            elif not self.step_700_completed_at:
                return 700
            elif not self.step_800_completed_at:
                return 800

        # Add when new version is introduced, add to
        # below...
        # elif self.version == 2:

        return None

    # This method resets the state. Useful for testing
    # or if we want a user go through a tutorial again.
    def reset(self):
        self.completed_at = None

        self.step_100_completed_at = None
        self.step_200_completed_at = None
        self.step_300_completed_at = None
        self.step_400_completed_at = None
        self.step_500_completed_at = None
        self.step_600_completed_at = None
        self.step_700_completed_at = None
        self.step_800_completed_at = None

        self.save()

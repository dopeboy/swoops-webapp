from textwrap import fill

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.utils.encoding import force_str
from django_otp.plugins.otp_static.models import StaticDevice, StaticToken


class Command(BaseCommand):
    help = fill(
        "Adds a single static OTP token to the given user. "
        "The token will be added to an arbitrary static device "
        "attached to the user, creating one if necessary.",
        width=78,
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "-t",
            "--token",
            dest="token",
            help="The token to add. If omitted, one will be randomly generated.",
        )
        parser.add_argument(
            "email", help="The user to which the token will be assigned."
        )

    def handle(self, *args, **options):
        email = options["email"]
        token = None
        try:
            user = get_user_model().objects.get(email=email)
            if not user.is_superuser:
                raise AssertionError("User {} is not a superuser".format(email))

            device = next(StaticDevice.objects.filter(user=user).iterator(), None)
            if device is None:
                device = StaticDevice.objects.create(user=user, name="Backup Code")

            if token is None:
                token = StaticToken.random_token()

            statictoken = device.token_set.create(token=token)
        except get_user_model().DoesNotExist:
            raise CommandError('User "{}" does not exist.'.format(email))

        self.stdout.write(force_str(statictoken.token))

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Backfills empty team names with a default name"

    def handle(self, *args, **options):
        # iterate through users, get their teams and check if team does not have a name
        # if it does not have a name, set it to the default name
        # works for users with a wallet address
        for user in get_user_model().objects.all():
            if user.wallet_address:
                if not user.team.name:
                    user.team.name = f"TEAM-{user.wallet_address[-4:]}"
                    user.team.save()

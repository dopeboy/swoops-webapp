from django.core.management.base import BaseCommand

import game.check_balance


class Command(BaseCommand):
    help = "Estimate amount needed for daily payouts"

    def handle(self, *args, **options):
        game.check_balance.check_balance()

from django.core.management.base import BaseCommand

import game.payout_confirmation


class Command(BaseCommand):
    help = "Initiate payouts for finalized tournaments"

    def handle(self, *args, **options):
        game.payout_confirmation.confirm_payouts()

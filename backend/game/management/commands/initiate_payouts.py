import argparse

from django.core.management.base import BaseCommand

import game.payout


class Command(BaseCommand):
    help = "Initiate payouts for finalized tournaments"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            dest="dry_run",
            help="Don't actually initiate payouts, just print what would happen",
            action=argparse.BooleanOptionalAction,
            required=False,
        )

    def handle(self, *args, **options):
        game.payout.initiate_payouts(options["dry_run"])

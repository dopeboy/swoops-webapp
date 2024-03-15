import argparse

from django.core.management.base import BaseCommand

import game.games


# Whenever a user signs up, they are given an offchain player - see
# game/signals.py. However, something weird is going on where this
# silently fails 10% of the time. In the interest of time, this is
# a stop gap solution that runs every X minutes and checks all users
# who signed up in the last day. If they are missing a player,
# we give them one.
class Command(BaseCommand):
    help = "Give new users an offchain player"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            dest="dry_run",
            help="Don't actually give player, just print what would happen",
            action=argparse.BooleanOptionalAction,
            required=False,
        )

    def handle(self, *args, **options):
        game.games.grant_offchain_player_to_new_users(options["dry_run"])

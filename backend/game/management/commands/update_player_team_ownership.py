from django.core.management.base import BaseCommand

import game.players


class Command(BaseCommand):
    help = (
        "Update the owning team of each player entry in game_player based on token "
        + "ownership in eth_transfers"
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "-w", "--wallet", dest="wallet", help="The wallet to sync ownership for"
        )

    def handle(self, *args, **options):
        if options["wallet"]:
            game.players.update_team_ownership_for_wallet(options["wallet"])
        else:
            game.players.update_team_ownership()

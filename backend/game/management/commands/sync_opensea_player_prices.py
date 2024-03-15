from django.core.management.base import BaseCommand

import game.players


class Command(BaseCommand):
    help = "Sync all player prices listed on OpenSea"

    def handle(self, *args, **options):

        game.players.sync_opensea_player_prices()

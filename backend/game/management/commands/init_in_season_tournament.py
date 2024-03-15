from django.core.management.base import BaseCommand

import game.processing


class Command(BaseCommand):
    help = "Sync game players to the database."

    def handle(self, *args, **options):
        game.processing.init_in_season_tournament()

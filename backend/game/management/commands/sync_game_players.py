from django.core.management.base import BaseCommand

import game.players


class Command(BaseCommand):
    help = "Sync game players to the database."

    def handle(self, *args, **options):
        game.players.sync()

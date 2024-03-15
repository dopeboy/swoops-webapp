from django.core.management.base import BaseCommand

import game.processing


class Command(BaseCommand):
    help = "Update Tournament Rounds"

    def handle(self, *args, **options):
        game.processing.update_tournament_rounds()

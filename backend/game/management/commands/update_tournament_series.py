from django.core.management.base import BaseCommand

import game.processing


class Command(BaseCommand):
    help = "Update Tournament Series"

    def handle(self, *args, **options):
        game.processing.update_tournament_series()

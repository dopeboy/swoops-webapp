from django.core.management.base import BaseCommand

import simulator.processing


class Command(BaseCommand):
    help = "Build player game stats"

    def handle(self, *args, **options):
        simulator.processing.build_player_game_stats()

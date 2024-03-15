from django.core.management.base import BaseCommand

import simulator.processing


class Command(BaseCommand):
    help = "Build team game stats"

    def handle(self, *args, **options):
        simulator.processing.build_team_game_stats()

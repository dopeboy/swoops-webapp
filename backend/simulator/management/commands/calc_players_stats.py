from django.core.management.base import BaseCommand

import simulator.processing


class Command(BaseCommand):
    help = "calculate player stats"

    def handle(self, *args, **options):
        simulator.processing.calculate_players_stats()

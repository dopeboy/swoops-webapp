from django.core.management.base import BaseCommand

import simulator.processing


class Command(BaseCommand):
    help = "Update game status from the simulator."

    def handle(self, *args, **options):
        simulator.processing.update_games()

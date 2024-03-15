from django.core.management.base import BaseCommand
from sentry_sdk import capture_message

import simulator.client
import simulator.models


class Command(BaseCommand):
    def handle(self, *args, **options):
        simulator_client = simulator.client.get()

        player_data = simulator_client.players()

        sim_player_tokens = [item["token"] for item in player_data]

        for token in (
            simulator.models.Player.objects.select_related("player")
            .all()
            .values_list("token", flat=True)
        ):

            if token not in sim_player_tokens:

                capture_message(f"Player #{token} not found within simulator.")

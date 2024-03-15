from django.conf import settings
from django.core.management.base import BaseCommand

import game.games


class Command(BaseCommand):
    help = "Top up open games to limit."

    def handle(self, *args, **options):
        if settings.GAMES_ENABLED:
            game.games.top_up_open_games_to_limit()

from django.core.management.base import BaseCommand

import game.games
import game.models


class Command(BaseCommand):
    help = "Create a game users can join."

    def add_arguments(self, parser):
        parser.add_argument("number_of_games", type=int)
        parser.add_argument(
            "--kind",
            dest="kind",
            help="The type of contest to generate",
            default=game.models.Contest.Kind.HEAD_TO_HEAD,
            choices=game.models.Contest.Kind,
        )

    def handle(self, *args, **options):
        game.games.create_games(options["number_of_games"], options["kind"])

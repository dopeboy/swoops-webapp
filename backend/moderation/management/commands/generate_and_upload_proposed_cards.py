from django.core.management.base import BaseCommand

import moderation.processing


class Command(BaseCommand):
    help = "Generate upload to S3 proposed front and back player cards."

    def add_arguments(self, parser):
        parser.add_argument("id", type=int)

    def handle(self, *args, **options):
        player_token_id = options["id"]
        moderation.processing.generate_and_upload_proposed_cards(
            player_token_id=player_token_id
        )

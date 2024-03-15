from django.core.management.base import BaseCommand

import game.processing


class Command(BaseCommand):
    help = "Process all the head-to-head games in the match make queue"

    def handle(self, *args, **options):
        game.processing.process_h2h_match_make_queue()

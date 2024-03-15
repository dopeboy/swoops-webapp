from django.core.management.base import BaseCommand

import eth.sync


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("from_block", type=int, nargs="?")

    def handle(self, *args, **options):
        eth.sync.sync(from_block=options["from_block"])

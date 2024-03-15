import csv
import logging
import secrets

from django.core.management.base import BaseCommand
from django.utils.log import DEFAULT_LOGGING

import game.models

logging.config.dictConfig(DEFAULT_LOGGING)
logger = logging.getLogger("django.server")


class Command(BaseCommand):
    help = "Deactivate Users."

    def add_arguments(self, parser):
        parser.add_argument(
            "--team_ids",
            nargs="+",
            type=int,
            required=False,
        )
        parser.add_argument(
            "-f",
            "--fullfilepath",
            type=str,
            required=False,
            help="CSV full file path, the first column should be the user id",
        )

    def handle(self, *args, **options):
        team_ids = []
        if options["fullfilepath"]:
            with open(options["fullfilepath"]) as csvfile:
                csvReader = csv.reader(csvfile, delimiter=",")
                for row in csvReader:
                    team_ids.append(int(row[0]))

        if options["team_ids"]:
            team_ids += options["team_ids"]

        for team_id in team_ids:
            try:
                team = game.models.Team.objects.get(id=team_id)
                user = team.owner
                if "__DELETED" not in user.email:
                    user.email = f"{user.email}__DELETED"
                    user.wallet_address = f"0x{secrets.token_hex(10)}"
                    user.save()

            except game.models.Team.DoesNotExist:
                logger.info(f"Team: {team.id} not found")

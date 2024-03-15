import datetime
import random
import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from web3 import Web3

import eth.models
import game.models


class Command(BaseCommand):
    help = "Generates Mock Team and assign existing players"

    def add_arguments(self, parser):
        parser.add_argument(
            "-n",
            "--number_of_teams",
            dest="number_of_teams",
            type=int,
            help="The number of teams to be created",
            default=1,
        )

    def get_or_create_user_and_team(self, wallet):
        checksummed_wallet = Web3.toChecksumAddress(wallet)
        user, _ = get_user_model().objects.get_or_create(
            wallet_address=checksummed_wallet
        )
        user.is_verified = True
        user.email = "user+{}@playswoops.com".format(wallet)
        user.email_verification_token = uuid.uuid4()
        user.save()
        team, _ = game.models.Team.objects.get_or_create(owner=user)
        return user, team

    def init_user_and_assign_players(self, wallet, number_of_players_needed):
        checksummed_wallet = Web3.toChecksumAddress(wallet)
        user, team = self.get_or_create_user_and_team(checksummed_wallet)

        number_of_players_owned_by_this_user = (
            game.models.Player.objects.players_owned_by_user(user.id).count()
        )

        if number_of_players_owned_by_this_user >= number_of_players_needed:
            return user

        assignable_players = (
            game.models.Player.objects.all()
            .select_related("simulated")
            .filter(simulated__token__gte=0, team_id__isnull=True)
        )

        if number_of_players_owned_by_this_user < number_of_players_needed:
            # check to make sure we have sufficent players to assign
            if len(assignable_players) < (
                number_of_players_needed - number_of_players_owned_by_this_user
            ):
                raise Exception(
                    "There aren't enough assignable players to complete this request."
                )

        for i in range(number_of_players_needed - number_of_players_owned_by_this_user):

            assignable_players[i].team = team
            assignable_players[i].save()

            eth.models.Transfer(
                to_address=checksummed_wallet,
                from_address="0x0000000000000000000000000000000000000000",
                token=assignable_players[i].simulated.token,
                block=int(datetime.datetime.now().strftime("%y%j%H%M")),
                tx_hash=datetime.datetime.now().strftime("%Y%m%d%H%M%S%f"),
                log_index=i,
            ).save()

        # create a lineup object for all assignabl players
        lineup = game.models.Lineup()
        lineup.team = team
        lineup.player_1 = assignable_players[0]
        lineup.player_2 = assignable_players[1]
        lineup.player_3 = assignable_players[2]
        lineup.player_4 = assignable_players[3]
        lineup.player_5 = assignable_players[4]
        lineup.save()

        return user

    def generate_wallet_address(self):
        # min: 0x1000000000000000000000000000000000000000
        # max: 0xffffffffffffffffffffffffffffffffffffffff
        return hex(
            random.randint(
                91343852333181432387730302044767688728495783936,
                1461501637330902918203684832716283019655932542975,
            )
        )

    def handle(self, *args, **options):
        if settings.CONFIGURATION == "swoops.settings.Production":
            raise Exception("This command cannot be used in production!")

        for i in range(options["number_of_teams"]):
            wallet_address = self.generate_wallet_address()
            self.init_user_and_assign_players(wallet_address, 5)
            print(f"Create Team: {wallet_address} with 5 players")

import uuid

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Max
from web3 import Web3

import eth.models
import game.models
import game.players
import simulator.models


class Command(BaseCommand):
    help = "Set the ownership for a given player."

    def add_arguments(self, parser):
        parser.add_argument("comma-delimited-pairs", type=str)

    def handle(self, *args, **options):
        if settings.CONFIGURATION == "swoops.settings.Production":
            raise Exception("This command cannot be used in production!")

        tuples = options["comma-delimited-pairs"].split(",")

        desired_ownership = self.transform_input_to_dict(tuples)

        with transaction.atomic():
            max_block = eth.models.Transfer.objects.aggregate(Max("block"))[
                "block__max"
            ]

            updates_made_for_wallet = False

            for wallet, tokens in desired_ownership.items():
                updates_made_for_wallet = False

                for token in tokens:
                    if not self.player_exists(token):
                        print(f"No player exists with token={token}. Skipping.")
                        continue

                    max_block += 1
                    self.create_ownership_transfer_record(wallet, token, max_block)
                    updates_made_for_wallet = True

                if updates_made_for_wallet:
                    self.propagate_ownership(wallet)

    def transform_input_to_dict(self, tuples):
        if len(tuples) % 2 != 0:
            raise Exception(
                "Malformed input: you have an odd-number of items. "
                + "Should be: wallet1,token1,wallet2,token2,..."
            )

        desired_ownership = dict()
        for i in range(0, len(tuples), 2):
            try:
                wallet = Web3.toChecksumAddress(tuples[i])
            except Exception:
                print(
                    f"Couldn't convert wallet={tuples[i]} to a checksummable wallet "
                    + "address. Is it a well-formed address? Skipping record "
                    + f"'{tuples[i]},{tuples[i+1]}'."
                )
                continue

            try:
                token = int(tuples[i + 1])
            except Exception:
                print(
                    f"Couldn't convert token={tuples[i + 1]} to an int. Skipping record"
                    + f"' {tuples[i]},{tuples[i+1]}'."
                )
                continue

            if wallet not in desired_ownership:
                desired_ownership[wallet] = []

            desired_ownership[wallet].append(token)
        return desired_ownership

    def player_exists(self, token):
        return simulator.models.Player.objects.filter(token=token).exists()

    def create_ownership_transfer_record(self, wallet, token, block):
        most_recent_transfer_block = eth.models.Transfer.objects.filter(
            token=token
        ).aggregate(Max("block"))["block__max"]

        previous_owner_address = "0x0000000000000000000000000000000000000000"

        # no previous transfer block means this token hasn't been minted yet and has
        # never had an owner.
        if most_recent_transfer_block:
            previous_owner_address = eth.models.Transfer.objects.get(
                token=token, block=most_recent_transfer_block
            ).to_address

        if previous_owner_address == wallet:
            print(f"Token={token} already has correct owner={wallet}. Skipping.")
            return

        eth.models.Transfer.objects.create(
            to_address=wallet,
            from_address=previous_owner_address,
            token=token,
            tx_hash=uuid.uuid4(),
            log_index=1,
            block=block,
        )

    def propagate_ownership(self, wallet):
        game.players.update_team_ownership_for_wallet(wallet)

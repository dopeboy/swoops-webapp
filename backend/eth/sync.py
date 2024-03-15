"""Functions for synchronizing the blockchain with our database"""
import pgbulk
from django.db import transaction
from web3 import Web3

import eth.contract
import eth.models
import utils.db
from signals.signals import player_ownership_updated


def get_latest_block():
    """Return the latest block in the ethereum chain"""
    return eth.contract.client().eth.block_number


@utils.db.mutex
def sync(from_block=None):
    """Sync the transfer log"""
    if from_block is None:
        last_transfer = eth.models.Transfer.objects.order_by("block").last()
        from_block = last_transfer.block + 1 if last_transfer else 0

    # When syncing, be sure to never sync blocks that are recent, otherwise
    # a block re-organization can happen if there is no consensus.
    # It is statistically very unlikely that a block will be reorganized
    # after 6 blocks are past it in the chain. We use 7 in our syncing
    # as the minimum, meaning there might be a delay in us seeing a
    # transfer. This delay should be less than a few minutes max
    last_block = get_latest_block()

    transfers = [
        eth.models.Transfer(
            from_address=Web3.toChecksumAddress(f"0x{transfer.topics[1].hex()[-40:]}"),
            to_address=Web3.toChecksumAddress(f"0x{transfer.topics[2].hex()[-40:]}"),
            token=int.from_bytes(transfer.topics[3], byteorder="big"),
            tx_hash=transfer.transactionHash.hex(),
            log_index=transfer.logIndex,
            block=transfer.blockNumber,
        )
        for transfer in eth.contract.transfers(from_block=from_block)
        if transfer.blockNumber < last_block - 7
    ]

    transfers = sorted(
        transfers, key=lambda transfer: (transfer.block, transfer.log_index)
    )

    with transaction.atomic():
        pgbulk.upsert(eth.models.Transfer, transfers, ["tx_hash", "log_index"])

        for transfer in transfers:
            player_ownership_updated.send(
                sender=None,
                token=transfer.token,
                new_owner=transfer.to_address,
                old_owner=transfer.from_address,
            )

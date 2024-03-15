from django.dispatch import receiver

from eth.service import record_purchase_confirmation
from signals.signals import player_ownership_updated


def is_a_mint(address):
    return address == "0x0000000000000000000000000000000000000000"


@receiver(player_ownership_updated)
def handle_player_ownership_updated(sender, **kwargs):
    if is_a_mint(kwargs["old_owner"]):
        record_purchase_confirmation(kwargs["new_owner"], 1)

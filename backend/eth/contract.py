import pathlib

from django.conf import settings
from web3 import Web3

ABI_PATH = pathlib.Path(__file__).parent / "resources" / "swoops-721.json"
with open(ABI_PATH, encoding="utf-8") as f:
    ABI = f.read()


def client():
    return Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER))


def get():
    """Gets the contract"""
    return client().eth.contract(
        address=Web3.toChecksumAddress(settings.SMART_CONTRACT_ADDRESS),
        abi=ABI,
    )


def token_ids(wallet_address):
    """Get all token IDs that belong to a wallet"""
    contract = get()
    wallet_balance = contract.functions.balanceOf(wallet_address).call()

    return [
        contract.functions.tokenOfOwnerByIndex(wallet_address, i).call()
        for i in range(wallet_balance)
    ]


def total_supply():
    """Get the total token supply for the contract"""
    return get().functions.totalSupply().call()


def transfers(from_block="0x0", to_block="latest"):
    """Get all transfers in a range"""
    return (
        client()
        .eth.filter(
            {
                "fromBlock": from_block,
                "toBlock": to_block,
                "address": settings.SMART_CONTRACT_ADDRESS,
                "topics": [
                    Web3.keccak(text="Transfer(address,address,uint256)").hex(),
                ],
            }
        )
        .get_all_entries()
    )

import math
from decimal import Decimal

import requests
from django.conf import settings
from etherscan import Etherscan
from web3 import Web3


class InsufficentFundsException(Exception):
    pass


def _etherscan_gas_oracle_strategy(spend_more_process_faster=False):
    # ProposedGasPrice = middle of the road, FastGasPrice = stronger guarentee the
    # transaction will be picked up sooner
    speed = "ProposeGasPrice"
    if spend_more_process_faster:
        speed = "FastGasPrice"

    gas_oracle = Etherscan(settings.GAS_ORACLE_API_KEY).get_gas_oracle()

    # etherscan quotes gas prices in gwei, but rounds to the nearest gwei.
    max_fee_per_gas = gas_oracle[speed]
    # We can calculate the priority fee, and etherscan also quotes the priority fee in
    # rounded gwei. For unknown reasons, etherscan gives an unrounded decimal for the
    # suggested base fee. We need a nonzero priority fee, so round up to the nearest
    # gwei.
    base_fee = Decimal(gas_oracle["suggestBaseFee"])
    max_priority_fee_per_gas = math.ceil(Decimal(max_fee_per_gas) - base_fee)
    return (
        Web3.toWei(max_fee_per_gas, "gwei"),
        Web3.toWei(max_priority_fee_per_gas, "gwei"),
    )


def _owlacle_gas_oracle_strategy(spend_more_process_faster=False):
    res = requests.get(
        "https://api.owlracle.info/v4/{}/gas?apikey={}&reportwei=true".format(
            "goerli", settings.GAS_ORACLE_API_KEY
        )
    )
    res.raise_for_status()
    gas_fees = res.json()

    gas_price = gas_fees["speeds"][len(gas_fees["speeds"]) - 2]
    if spend_more_process_faster:
        gas_price = gas_fees["speeds"][len(gas_fees["speeds"]) - 1]

    return (
        Web3.toWei(gas_price["maxFeePerGas"], "wei"),
        Web3.toWei(gas_price["maxPriorityFeePerGas"], "wei"),
    )


def _local_strategy(spend_more_process_faster=False):
    if spend_more_process_faster:
        max_fee_per_gas = Web3.toWei(4, "gwei")
        max_priority_fee_per_gas = Web3.toWei(2, "gwei")
    else:
        max_fee_per_gas = Web3.toWei(2, "gwei")
        max_priority_fee_per_gas = Web3.toWei(1, "gwei")

    return (max_fee_per_gas, max_priority_fee_per_gas)


def get_gas_prices_in_wei(network, spend_more_process_faster=False):
    # TODO we need to move to a single provider to manage how we calculate gas prices
    # It's a terrible idea to have different providers in different environments
    if "mainnet" in network.strip().lower():
        return _etherscan_gas_oracle_strategy(spend_more_process_faster)
    elif "goerli" in network.strip().lower():
        return _owlacle_gas_oracle_strategy(spend_more_process_faster)
    elif "local" in network.strip().lower():
        return _local_strategy(spend_more_process_faster)
    else:
        raise Exception("Unsupported network {}".format(network))


def get_balance(client, wallet_address):
    return client.eth.get_balance(Web3.toChecksumAddress(wallet_address))


def verify_wallet_balance(web3_client, wallet, minimumBalance):
    payout_wallet_balance = get_balance(web3_client, wallet)
    if payout_wallet_balance < minimumBalance:
        raise InsufficentFundsException(
            "To pay out, the wallet {} has an insufficent balance of {} eth, and needs {} eth. Fund the wallet and retry.".format(  # noqa: E501
                wallet,
                round(Web3.fromWei(payout_wallet_balance, "ether"), 6),
                round(Web3.fromWei(minimumBalance, "ether"), 6),
            )
        )

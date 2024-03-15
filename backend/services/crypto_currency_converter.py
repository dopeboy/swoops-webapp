from decimal import Decimal

import requests

API_ETHERSCAN_ETH_PRICE_BASE_URL = (
    "https://api.etherscan.io/api?module=stats&action=ethprice"
)


def get_eth_to_usd_conversion_factor():
    resp = requests.get(API_ETHERSCAN_ETH_PRICE_BASE_URL)

    resp.raise_for_status()
    return Decimal(resp.json()["result"]["ethusd"])


def get_usd_to_eth_conversion_factor():
    resp = requests.get(API_ETHERSCAN_ETH_PRICE_BASE_URL)
    resp.raise_for_status()

    return round(Decimal(1) / Decimal(resp.json()["result"]["ethusd"]), 10)


def convert_wei_to_eth(wei):
    return Decimal(wei) / 10**18

import json
from decimal import Decimal

from services.crypto_currency_converter import (
    convert_wei_to_eth,
    get_eth_to_usd_conversion_factor,
    get_usd_to_eth_conversion_factor,
)


def test_get_eth_to_usd_conversion_factor(requests_mock):

    requests_mock.get(
        "https://api.etherscan.io/api?module=stats&action=ethprice",
        text=json.dumps(
            {
                "status": "1",
                "message": "OK-Missing/Invalid API Key, rate limit of 1/5sec applied",
                "result": {
                    "ethbtc": "0.07023",
                    "ethbtc_timestamp": "1677786865",
                    "ethusd": "1647.53",
                    "ethusd_timestamp": "1677786864",
                },
            }
        ),
    )
    assert get_eth_to_usd_conversion_factor() == Decimal("1647.53")


def test_get_usd_to_eth_conversion_factor(requests_mock):

    requests_mock.get(
        "https://api.etherscan.io/api?module=stats&action=ethprice",
        text=json.dumps(
            {
                "status": "1",
                "message": "OK-Missing/Invalid API Key, rate limit of 1/5sec applied",
                "result": {
                    "ethbtc": "0.07023",
                    "ethbtc_timestamp": "1677786865",
                    "ethusd": "1647.53",
                    "ethusd_timestamp": "1677786864",
                },
            }
        ),
    )
    assert get_usd_to_eth_conversion_factor() == Decimal("0.0006069692")


def test_wei_to_eth(mocker, settings):
    wei_price = "349000000000000000"
    assert convert_wei_to_eth(wei_price) == Decimal("0.349")

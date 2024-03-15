import json

from services.opensea import OpenSeaAPI


def test_opensea(requests_mock, settings):

    opensea_sample_listing = {
        "next": "LXBrPTEwNjkzMzk=",
        "previous": None,
        "orders": [
            {
                "created_date": "2023-03-02T20:23:28.061917",
                "closing_date": "2023-04-02T20:22:59",
                "listing_time": 1677788579,
                "expiration_time": 1680466979,
                "order_hash": "0x7e0dcc2394aaee7943ff7b0d35cabb34d24573642eb9cd675069e50ae4638a9e",  # noqa: E501
                "protocol_data": {
                    "parameters": {
                        "offerer": "0x5ca36e9c7e4cf746cee5b383e7fc130f3e1d1ac5",
                        "offer": [
                            {
                                "itemType": 3,
                                "token": "0xf4910C763eD4e47A585E2D34baA9A4b611aE448C",
                                "identifierOrCriteria": "48337647276823028412063008378121296794821791822139165748498582725510366756874",  # noqa: E501
                                "startAmount": "1",
                                "endAmount": "1",
                            }
                        ],
                        "consideration": [
                            {
                                "itemType": 0,
                                "token": "0x0000000000000000000000000000000000000000",
                                "identifierOrCriteria": "0",
                                "startAmount": "15840000000000000000",
                                "endAmount": "15840000000000000000",
                                "recipient": "0x5Ca36E9C7E4cF746cEE5b383E7fC130f3e1D1AC5",  # noqa: E501
                            },
                            {
                                "itemType": 0,
                                "token": "0x0000000000000000000000000000000000000000",
                                "identifierOrCriteria": "0",
                                "startAmount": "80000000000000000",
                                "endAmount": "80000000000000000",
                                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719",  # noqa: E501
                            },
                            {
                                "itemType": 0,
                                "token": "0x0000000000000000000000000000000000000000",
                                "identifierOrCriteria": "0",
                                "startAmount": "80000000000000000",
                                "endAmount": "80000000000000000",
                                "recipient": "0x6aDe2389E3B6F7CaFB426D334707f5a2421208b0",  # noqa: E501
                            },
                        ],
                        "startTime": "1677788579",
                        "endTime": "1680466979",
                        "orderType": 1,
                        "zone": "0x0000000000000000000000000000000000000000",
                        "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",  # noqa: E501
                        "salt": "0x360c6ebe0000000000000000000000000000000000000000213eb62ed0d8926d",  # noqa: E501
                        "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",  # noqa: E501
                        "totalOriginalConsiderationItems": 3,
                        "counter": 0,
                    },
                    "signature": "0xa3e1e38122b75af6d52fc8420f870bd31a5771ee492d832f3c50fad18c4c4914efbac19349a0ff6b4630593b5e9454c1f07e7caf5c4259ff33c3885a55fe80fc",  # noqa: E501
                },
                "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
                "current_price": "16000000000000000000",
                "maker": {
                    "user": 405672,
                    "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/25.png",  # noqa: E501
                    "address": "0x5ca36e9c7e4cf746cee5b383e7fc130f3e1d1ac5",
                    "config": "",
                },
                "taker": None,
                "maker_fees": [
                    {
                        "account": {
                            "user": None,
                            "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",  # noqa: E501
                            "address": "0x0000a26b00c1f0df003000390027140000faa719",
                            "config": "",
                        },
                        "basis_points": "50",
                    },
                    {
                        "account": {
                            "user": 401499,
                            "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/3.png",  # noqa: E501
                            "address": "0x6ade2389e3b6f7cafb426d334707f5a2421208b0",
                            "config": "",
                        },
                        "basis_points": "50",
                    },
                ],
                "taker_fees": [],
                "side": "ask",
                "order_type": "basic",
                "cancelled": False,
                "finalized": False,
                "marked_invalid": False,
                "remaining_quantity": 1,
                "client_signature": "0xa3e1e38122b75af6d52fc8420f870bd31a5771ee492d832f3c50fad18c4c4914efbac19349a0ff6b4630593b5e9454c1f07e7caf5c4259ff33c3885a55fe80fc",  # noqa: E501
                "relay_id": "T3JkZXJWMlR5cGU6MTA2OTMzOQ",
                "criteria_proof": None,
                "maker_asset_bundle": {
                    "assets": [
                        {
                            "id": 179327617,
                            "token_id": "48337647276823028412063008378121296794821791822139165748498582725510366756874",  # noqa: E501
                            "num_sales": 14,
                            "background_color": None,
                            "image_url": "https://i.seadn.io/gcs/files/a0202d280720c7efa58904def5beb9e2.jpg?w=500&auto=format",  # noqa: E501
                            "image_preview_url": "https://i.seadn.io/gcs/files/a0202d280720c7efa58904def5beb9e2.jpg?w=500&auto=format",  # noqa: E501
                            "image_thumbnail_url": "https://i.seadn.io/gcs/files/a0202d280720c7efa58904def5beb9e2.jpg?w=500&auto=format",  # noqa: E501
                            "image_original_url": None,
                            "animation_url": None,
                            "animation_original_url": None,
                            "name": "Mikuzuu",
                            "description": "Take the red bean to join the garden. View the collection at Mikuzuu.com/gallery.Mikuzuu starts with a collection of 1000 avatars that give you membership access to The Garden: a corner of the internet where artists, builders, and web3 enthusiasts meet to create a decentralized future. Mikuzuu holders receive access to exclusive drops, experiences, and more. Visit Mikuzuu.com for more details.We rise together. We build together. We grow together.",  # noqa: E501
                            "external_link": None,
                            "asset_contract": {
                                "address": "0xf4910c763ed4e47a585e2d34baa9a4b611ae448c",
                                "asset_contract_type": "semi-fungible",
                                "created_date": "2022-09-09T19:54:17.825024",
                                "name": "OpenSea Collections",
                                "nft_version": None,
                                "opensea_version": "2.1.0",
                                "owner": 12049079,
                                "schema_name": "ERC1155",
                                "symbol": "OPENSTORE",
                                "total_supply": None,
                                "description": None,
                                "external_link": None,
                                "image_url": None,
                                "default_to_fiat": False,
                                "dev_buyer_fee_basis_points": 0,
                                "dev_seller_fee_basis_points": 0,
                                "only_proxied_transfers": False,
                                "opensea_buyer_fee_basis_points": 0,
                                "opensea_seller_fee_basis_points": 50,
                                "buyer_fee_basis_points": 0,
                                "seller_fee_basis_points": 50,
                                "payout_address": None,
                            },
                            "permalink": "https://testnets.opensea.io/assets/goerli/0xf4910c763ed4e47a585e2d34baa9a4b611ae448c/48337647276823028412063008378121296794821791822139165748498582725510366756874",  # noqa: E501
                            "collection": {
                                "banner_image_url": "https://i.seadn.io/gcs/files/16f41d1a1821d7a0d5ab68872a4672fe.jpg?w=500&auto=format",  # noqa: E501
                                "chat_url": None,
                                "created_date": "2023-03-02T16:58:15.268701+00:00",
                                "default_to_fiat": False,
                                "description": "Take the red bean to join the garden. View the collection at Mikuzuu.com/gallery.Mikuzuu starts with a collection of 1000 avatars that give you membership access to The Garden: a corner of the internet where artists, builders, and web3 enthusiasts meet to create a decentralized future.  Mikuzuu holders receive access to exclusive drops, experiences, and more. VisitMikuzuu.com for more details.We rise together. We build together. We grow # noqa: E501 together.\n\n",
                                "dev_buyer_fee_basis_points": "0",
                                "dev_seller_fee_basis_points": "50",
                                "discord_url": None,
                                "display_data": {
                                    "card_display_style": "contain",
                                    "images": None,
                                },
                                "external_url": None,
                                "featured": False,
                                "featured_image_url": "https://i.seadn.io/gcs/files/16f41d1a1821d7a0d5ab68872a4672fe.jpg?w=500&auto=format",  # noqa: E501
                                "hidden": False,
                                "safelist_request_status": "not_requested",
                                "image_url": "https://i.seadn.io/gcs/files/ddce4f5669f9315cf58914ff8e2d0134.jpg?w=500&auto=format",  # noqa: E501
                                "is_subject_to_whitelist": False,
                                "large_image_url": "https://i.seadn.io/gcs/files/16f41d1a1821d7a0d5ab68872a4672fe.jpg?w=500&auto=format",  # noqa: E501
                                "medium_username": "Mikuzuu",
                                "name": "Mikuzuu",
                                "only_proxied_transfers": False,
                                "opensea_buyer_fee_basis_points": "0",
                                "opensea_seller_fee_basis_points": 50,
                                "payout_address": "0x6ade2389e3b6f7cafb426d334707f5a2421208b0",  # noqa: E501
                                "require_email": False,
                                "short_description": None,
                                "slug": "mikuzuu",
                                "telegram_url": "https://t.me/Mikuzuu",
                                "twitter_username": None,
                                "instagram_username": None,
                                "wiki_url": None,
                                "is_nsfw": True,
                                "fees": {
                                    "seller_fees": {
                                        "0x6ade2389e3b6f7cafb426d334707f5a2421208b0": 50
                                    },
                                    "opensea_fees": {
                                        "0x0000a26b00c1f0df003000390027140000faa719": 50
                                    },
                                },
                                "is_rarity_enabled": False,
                                "is_creator_fees_enforced": False,
                            },
                            "decimals": None,
                            "token_metadata": None,
                            "is_nsfw": False,
                            "owner": None,
                        }
                    ],
                    "maker": None,
                    "slug": None,
                    "name": None,
                    "description": None,
                    "external_link": None,
                    "asset_contract": None,
                    "permalink": None,
                    "seaport_sell_orders": None,
                },
                "taker_asset_bundle": {
                    "assets": [
                        {
                            "id": 1507176,
                            "token_id": "0",
                            "num_sales": 0,
                            "background_color": None,
                            "image_url": "https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg",  # noqa: E501
                            "image_preview_url": "https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg",  # noqa: E501
                            "image_thumbnail_url": "https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg",  # noqa: E501
                            "image_original_url": "https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg",  # noqa: E501
                            "animation_url": None,
                            "animation_original_url": None,
                            "name": "Ether",
                            "description": None,
                            "external_link": None,
                            "asset_contract": {
                                "address": "0x0000000000000000000000000000000000000000",
                                "asset_contract_type": "fungible",
                                "created_date": "2021-03-12T15:05:22.062326",
                                "name": "Ether",
                                "nft_version": None,
                                "opensea_version": None,
                                "owner": None,
                                "schema_name": "ERC20",
                                "symbol": "ETH",
                                "total_supply": None,
                                "description": None,
                                "external_link": None,
                                "image_url": None,
                                "default_to_fiat": False,
                                "dev_buyer_fee_basis_points": 0,
                                "dev_seller_fee_basis_points": 0,
                                "only_proxied_transfers": False,
                                "opensea_buyer_fee_basis_points": 0,
                                "opensea_seller_fee_basis_points": 50,
                                "buyer_fee_basis_points": 0,
                                "seller_fee_basis_points": 50,
                                "payout_address": None,
                            },
                            "permalink": "https://testnets.opensea.io/assets/goerli/0x0000000000000000000000000000000000000000/0",  # noqa: E501
                            "collection": {
                                "banner_image_url": None,
                                "chat_url": None,
                                "created_date": "2022-08-05T17:12:11.501958+00:00",
                                "default_to_fiat": False,
                                "description": None,
                                "dev_buyer_fee_basis_points": "0",
                                "dev_seller_fee_basis_points": "0",
                                "discord_url": None,
                                "display_data": {
                                    "card_display_style": "contain",
                                    "images": [],
                                },
                                "external_url": None,
                                "featured": False,
                                "featured_image_url": None,
                                "hidden": True,
                                "safelist_request_status": "not_requested",
                                "image_url": None,
                                "is_subject_to_whitelist": False,
                                "large_image_url": None,
                                "medium_username": None,
                                "name": "OpenSea PaymentAssets",
                                "only_proxied_transfers": False,
                                "opensea_buyer_fee_basis_points": "0",
                                "opensea_seller_fee_basis_points": 50,
                                "payout_address": None,
                                "require_email": False,
                                "short_description": None,
                                "slug": "opensea-paymentassets",
                                "telegram_url": None,
                                "twitter_username": None,
                                "instagram_username": None,
                                "wiki_url": None,
                                "is_nsfw": False,
                                "fees": {
                                    "seller_fees": {},
                                    "opensea_fees": {
                                        "0x0000a26b00c1f0df003000390027140000faa719": 50
                                    },
                                },
                                "is_rarity_enabled": False,
                                "is_creator_fees_enforced": True,
                            },
                            "decimals": 18,
                            "token_metadata": None,
                            "is_nsfw": False,
                            "owner": None,
                        }
                    ],
                    "maker": None,
                    "slug": None,
                    "name": None,
                    "description": None,
                    "external_link": None,
                    "asset_contract": None,
                    "permalink": None,
                    "seaport_sell_orders": None,
                },
            }
        ],
    }

    settings.SMART_CONTRACT_ADDRESS = "0x6447f7d21f19af6c11824b06e3a6618542cedf33"
    token_id = 12345
    requests_mock.get(
        f"https://testnets-api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address={settings.SMART_CONTRACT_ADDRESS}&limit=50&order_by=created_date&token_ids={token_id}",  # noqa: E501
        text=json.dumps(opensea_sample_listing),
    )

    os = OpenSeaAPI()
    listings = os.retrieve_listings_by_created_date(
        asset_contract_address=settings.SMART_CONTRACT_ADDRESS, token_ids=token_id
    )
    assert opensea_sample_listing == listings

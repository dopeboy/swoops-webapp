# flake8: noqa: E501

import pytest
from django.core.management import call_command
from hexbytes import HexBytes
from web3.datastructures import AttributeDict

import eth.tasks


@pytest.mark.django_db
def test_sync_full(mocker):
    """Tests eth.sync.sync with a full set of results"""
    full_eth_return = [
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0x99d6531123bce485fd2b04c83c510ede1c132f06c31bb7c2abbec28ffeb587c9"
                ),
                "blockNumber": 14812392,
                "data": HexBytes("0x"),
                "logIndex": 184,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000d2623826cafec0bbba1876d61fed19438df25610"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x28538aa7e0d7c4a611c1f8d8f2f48d086619a83d7c90fd89f29f02824344c71b"
                ),
                "transactionIndex": 113,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0xc84ced45ed76369da6026b550f4a186bb57faecc6d4dc385d80ceb401ef51536"
                ),
                "blockNumber": 14844206,
                "data": HexBytes("0x"),
                "logIndex": 361,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000d2623826cafec0bbba1876d61fed19438df25610"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000001"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x092851f35fe5307aeeb3cb693df5ae29b6dcc4f4ee86d9cf0611e87b28dec921"
                ),
                "transactionIndex": 239,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0x20bc4183f8d9356dcf6cac4f4bf3159ff6d68590c18fdb8ee0a76e10a62b436b"
                ),
                "blockNumber": 14851720,
                "data": HexBytes("0x"),
                "logIndex": 879,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000b99426903d812a09b8de7df6708c70f97d3dd0ae"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000002"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x88c250973a22a41238860e54af138d498466f4bf301c714ac106a732e032d362"
                ),
                "transactionIndex": 295,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0x20bc4183f8d9356dcf6cac4f4bf3159ff6d68590c18fdb8ee0a76e10a62b436b"
                ),
                "blockNumber": 14851720,
                "data": HexBytes("0x"),
                "logIndex": 880,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000b99426903d812a09b8de7df6708c70f97d3dd0ae"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000003"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x88c250973a22a41238860e54af138d498466f4bf301c714ac106a732e032d362"
                ),
                "transactionIndex": 295,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0x20bc4183f8d9356dcf6cac4f4bf3159ff6d68590c18fdb8ee0a76e10a62b436b"
                ),
                "blockNumber": 14851720,
                "data": HexBytes("0x"),
                "logIndex": 881,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000b99426903d812a09b8de7df6708c70f97d3dd0ae"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000004"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x88c250973a22a41238860e54af138d498466f4bf301c714ac106a732e032d362"
                ),
                "transactionIndex": 295,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0xc9406c478e30bb799645c7daf43dce309c9fc82479aaf10212723ef4d56c34c8"
                ),
                "blockNumber": 14851722,
                "data": HexBytes("0x"),
                "logIndex": 6,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000a494876207ae80d8669dd347fe11fadae31c48e7"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000005"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0xb83381ef3cf5b4d9e09ee79c4d980af8f90737caa5855138817eecb748a8cb78"
                ),
                "transactionIndex": 14,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0xc9406c478e30bb799645c7daf43dce309c9fc82479aaf10212723ef4d56c34c8"
                ),
                "blockNumber": 14851722,
                "data": HexBytes("0x"),
                "logIndex": 7,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000a494876207ae80d8669dd347fe11fadae31c48e7"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000006"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0xb83381ef3cf5b4d9e09ee79c4d980af8f90737caa5855138817eecb748a8cb78"
                ),
                "transactionIndex": 14,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0xc9406c478e30bb799645c7daf43dce309c9fc82479aaf10212723ef4d56c34c8"
                ),
                "blockNumber": 14851722,
                "data": HexBytes("0x"),
                "logIndex": 8,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000a494876207ae80d8669dd347fe11fadae31c48e7"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000007"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0xb83381ef3cf5b4d9e09ee79c4d980af8f90737caa5855138817eecb748a8cb78"
                ),
                "transactionIndex": 14,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0x1289243b1a574356fa86fdbc7d069d9c9b6ef0464fa82b2cb4ac155db0dba9a4"
                ),
                "blockNumber": 14851943,
                "data": HexBytes("0x"),
                "logIndex": 101,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000fd61f8599431ebff62dc81efc571c1fbcb908dcf"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000008"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x1f96910ac7e80b16c613d67ad47776193cf27917a36c690a30d550282683f085"
                ),
                "transactionIndex": 56,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0x59f379004062a165f93bc81799e0c4ab66be4f71a4077e019112aa12f79a3aca"
                ),
                "blockNumber": 14853849,
                "data": HexBytes("0x"),
                "logIndex": 432,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000a41a4b84d74e085bd463386d55c3b6dde6aa2759"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000009"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0xea40e2ad370a73ff4a7f60807ec4023ce88ef13e7355e803eacb4347404ecc50"
                ),
                "transactionIndex": 317,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0x67f367e126fe9acd15fd3881fd1dc73ebe28892e560a912e7a926698044ed6b4"
                ),
                "blockNumber": 14854171,
                "data": HexBytes("0x"),
                "logIndex": 521,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000c57b2900f3ab9b9bd4ffcdb8174cd7665d0da8bc"
                    ),
                    HexBytes(
                        "0x000000000000000000000000000000000000000000000000000000000000000a"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x5608d8b7c2f08dcd0b020c637b27e3e45c86ad8b4bd54d6b8def08847bf7604e"
                ),
                "transactionIndex": 324,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0x67f367e126fe9acd15fd3881fd1dc73ebe28892e560a912e7a926698044ed6b4"
                ),
                "blockNumber": 14854171,
                "data": HexBytes("0x"),
                "logIndex": 522,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000c57b2900f3ab9b9bd4ffcdb8174cd7665d0da8bc"
                    ),
                    HexBytes(
                        "0x000000000000000000000000000000000000000000000000000000000000000b"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x5608d8b7c2f08dcd0b020c637b27e3e45c86ad8b4bd54d6b8def08847bf7604e"
                ),
                "transactionIndex": 324,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0xfdc85486e9a8cc3d70624987898e5754409ac16ac1dd2618b2e89548419cfa2d"
                ),
                "blockNumber": 14854232,
                "data": HexBytes("0x"),
                "logIndex": 440,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000ba726320a6d963b3a9e7e3685fb12aea71af3f6d"
                    ),
                    HexBytes(
                        "0x000000000000000000000000000000000000000000000000000000000000000c"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x4ef00a0dbb29ae9e3824edf363000375a7a213af68d65a10885c54f1062ec025"
                ),
                "transactionIndex": 277,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0xfdc85486e9a8cc3d70624987898e5754409ac16ac1dd2618b2e89548419cfa2d"
                ),
                "blockNumber": 14854232,
                "data": HexBytes("0x"),
                "logIndex": 441,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000ba726320a6d963b3a9e7e3685fb12aea71af3f6d"
                    ),
                    HexBytes(
                        "0x000000000000000000000000000000000000000000000000000000000000000d"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x4ef00a0dbb29ae9e3824edf363000375a7a213af68d65a10885c54f1062ec025"
                ),
                "transactionIndex": 277,
            }
        ),
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0xfdc85486e9a8cc3d70624987898e5754409ac16ac1dd2618b2e89548419cfa2d"
                ),
                "blockNumber": 14854232,
                "data": HexBytes("0x"),
                "logIndex": 9,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ),
                    HexBytes(
                        "0x000000000000000000000000ba726320a6d963b3a9e7e3685fb12aea71af3f6d"
                    ),
                    HexBytes(
                        "0x000000000000000000000000000000000000000000000000000000000000000e"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x4ef00a0dbb29ae9e3824edf363000375a7a213af68d65a10885c54f1062ec025"
                ),
                "transactionIndex": 277,
            }
        ),
    ]

    # This models an ownership change to a new address
    eth_ownership_change = [
        AttributeDict(
            {
                "address": "0xC211506d58861857c3158Af449e832CC5E1e7E7B",
                "blockHash": HexBytes(
                    "0xfdc85486e9a8cc3d70624987898e5754409ac16ac1dd2618b2e89548419cfa2d"
                ),
                "blockNumber": 19999979,
                "data": HexBytes("0x"),
                "logIndex": 999,
                "removed": False,
                "topics": [
                    HexBytes(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                    ),
                    HexBytes(
                        "0x000000000000000000000000ba726320a6d963b3a9e7e3685fb12aea71af3f6d"
                    ),
                    HexBytes(
                        "0x000000000000000000000000ba726320a6d963b3a9e7e3685fb12aea71af3f6e"
                    ),
                    HexBytes(
                        "0x000000000000000000000000000000000000000000000000000000000000000e"
                    ),
                ],
                "transactionHash": HexBytes(
                    "0x4ef00a0dbb29ae9e3824edf363000375a7a213af68d65a10885c54f1062ec025"
                ),
                "transactionIndex": 277,
            }
        )
    ]

    mocker.patch("eth.sync.get_latest_block", return_value=19999999)
    patched_contract_transfers = mocker.patch(
        "eth.contract.transfers",
        autospec=True,
        side_effect=[full_eth_return, [], full_eth_return, eth_ownership_change],
    )
    signal_mock = mocker.patch("signals.signals.player_ownership_updated.send")

    # Call the task directly to exercise the management command and the eth.sync.sync() code
    eth.tasks.sync_eth_transfers()

    # We should have 15 entries synced and 15 owners
    assert eth.models.Transfer.objects.count() == 15
    patched_contract_transfers.assert_called_once_with(from_block=0)
    assert signal_mock.call_count == 15
    signal_mock.reset_mock()

    # Sync again. There should be no additional results
    eth.tasks.sync_eth_transfers()
    assert eth.models.Transfer.objects.count() == 15
    assert len(patched_contract_transfers.call_args_list) == 2
    # We should have started from the latest block+1
    assert patched_contract_transfers.call_args_list[1] == mocker.call(
        from_block=14854233
    )
    assert signal_mock.call_count == 0
    signal_mock.reset_mock()

    # Sync again, but from the beginning this time. Results should be unchanged
    call_command("sync_eth_transfers", 0)
    assert eth.models.Transfer.objects.count() == 15
    assert len(patched_contract_transfers.call_args_list) == 3
    assert patched_contract_transfers.call_args_list[2] == mocker.call(from_block=0)

    # In this call, the patched eth transfer polling will return an ownership change
    eth.tasks.sync_eth_transfers()
    assert eth.models.Transfer.objects.count() == 16
    assert signal_mock.call_count == 16

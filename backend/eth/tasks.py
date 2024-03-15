import logging

from django.core.management import call_command

import swoops.celery

LOGGER = logging.getLogger(__name__)


@swoops.celery.app.task()
def sync_eth_transfers():
    LOGGER.info("Syncing blockchain...")
    call_command("sync_eth_transfers")

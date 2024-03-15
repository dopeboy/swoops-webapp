import logging

from django.core.management import call_command

import swoops.celery

LOGGER = logging.getLogger(__name__)


@swoops.celery.app.task()
def generate_and_upload_proposed_cards(simulated_player_id):
    LOGGER.info(
        f"Generate upload to S3 proposed front and back player cards for simulated player id { simulated_player_id }."  # noqa: E501
    )
    call_command("generate_and_upload_proposed_cards", simulated_player_id)

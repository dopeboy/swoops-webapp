import logging
import logging.config

from django.core.management.base import BaseCommand
from django.utils.log import DEFAULT_LOGGING

import eth.models

logging.config.dictConfig(DEFAULT_LOGGING)
logger = logging.getLogger("django.server")


class Command(BaseCommand):
    def handle(self, *args, **options):
        phase_name = eth.models.MintPhase.objects.get_current_phase()
        logger.info("Current phase is: '%s'", phase_name)

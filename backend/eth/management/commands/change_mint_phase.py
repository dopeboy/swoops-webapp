import logging
import logging.config

from django.core.management.base import BaseCommand
from django.utils.log import DEFAULT_LOGGING

import eth.models

logging.config.dictConfig(DEFAULT_LOGGING)
logger = logging.getLogger("django.server")


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("phase_name", type=str, help="The name of the phase.")

    def handle(self, *args, **options):
        phase_name = options["phase_name"]
        if not phase_name:
            raise Exception("Please provide a phase name.")

        phase_name = phase_name.upper()
        logger.info("Setting current phase to '%s'", phase_name)
        eth.models.MintPhase.objects.set_current_phase(phase_name)

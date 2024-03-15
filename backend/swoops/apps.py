import logging
import logging.config
import os

import sentry_sdk
from django.apps import AppConfig
from django.conf import settings
from django.utils.log import DEFAULT_LOGGING
from sentry_sdk.integrations.django import DjangoIntegration

logging.config.dictConfig(DEFAULT_LOGGING)
logger = logging.getLogger("django.server")


def traces_sampler(sampling_context):
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    sample_rate = settings.SENTRY_TRACE_SAMPLE_RATE
    wsgi_env = sampling_context.get("wsgi_environ")

    if wsgi_env and wsgi_env.get("PATH_INFO") == "/api/health":
        sample_rate = 0

    return sample_rate


class SwoopsConfig(AppConfig):
    name = "swoops"

    def ready(self):
        if settings.SENTRY_ENABLED:
            sentry_sdk.init(
                dsn=os.environ["SENTRY_URL"],
                integrations=[DjangoIntegration()],
                traces_sampler=traces_sampler,
                environment=os.environ["DJANGO_CONFIGURATION"].upper(),
                # If you wish to associate users to errors (assuming you are using
                # django.contrib.auth) you may enable sending PII data.
                send_default_pii=True,
            )
        else:
            logger.info("SENTRY is currently DISABLED.")

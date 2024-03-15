"""
ASGI config for swoops project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/asgi/
"""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "swoops.settings")

from configurations.asgi import get_asgi_application  # noqa

application = get_asgi_application()

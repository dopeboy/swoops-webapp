import requests
from django.conf import settings
from django.core.cache import cache
from django.core.management.base import BaseCommand
from django.http import HttpRequest
from django.urls import reverse
from django.utils.cache import get_cache_key


class Command(BaseCommand):
    help = "Refreshes cached for leaderboard API player and game API view."

    def expire_page_cache(self, view):
        path = reverse(view)

        request = HttpRequest()
        request.path = path
        request.META = {
            "HTTP_HOST": settings.API_EXTERNAL_HOSTNAME,
        }

        key = get_cache_key(request)
        if key in cache:
            cache.delete(key)

    def handle(self, *args, **options):

        request = HttpRequest()
        request.META = {
            "HTTP_HOST": settings.API_EXTERNAL_HOSTNAME,
        }

        self.expire_page_cache("api:game:team-leaderboard")
        requests.get(
            request.build_absolute_uri(
                reverse("api:game:team-leaderboard")
            )  # noqa: E501
        )

        self.expire_page_cache("api:game:player-leaderboard")
        requests.get(
            request.build_absolute_uri(
                reverse("api:game:player-leaderboard")
            )  # noqa: E501
        )

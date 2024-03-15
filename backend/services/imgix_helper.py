import json

import requests
from django.conf import settings

API_ENDPOINT_BASE_URL = "https://api.imgix.com"


def purge_file(key):
    headers = {
        "Authorization": f"Bearer {settings.IMGIX_IMAGES_API_KEY}",
        "Content-Type": "application/vnd.api+json",
    }

    payload = {
        "data": {
            "type": "purges",
            "attributes": {"url": f"{settings.IMGIX_IMAGES_BASE_URL}/{key}"},
        }
    }

    requests.post(
        url=f"{API_ENDPOINT_BASE_URL}/api/v1/purge",
        headers=headers,
        data=json.dumps(payload),
    )

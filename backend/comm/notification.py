import requests
from django.conf import settings


def send(title: str, body: str, click_url: str, user_id: str) -> None:
    headers = {
        "X-MAGICBELL-API-SECRET": settings.MAGIC_BELL_API_SECRET,
        "X-MAGICBELL-API-KEY": settings.MAGIC_BELL_API_KEY,
    }

    data = {
        "notification": {
            "title": title,
            "content": body,
            "category": "new_message",
            "action_url": click_url,
            "recipients": [{"external_id": user_id}],
        }
    }

    response = requests.post(
        "https://api.magicbell.com/notifications", headers=headers, json=data
    )
    response.raise_for_status()


def notify_slack_payout(msg):
    if settings.PAYOUT_NOTIFICATION_WEBHOOK:
        requests.post(
            url=settings.PAYOUT_NOTIFICATION_WEBHOOK,
            headers={"Content-Type": "application/json"},
            json={"text": msg},
        )


def notify_slack_user_signup(msg):
    if settings.USER_SIGNUP_NOTIFICATION_WEBHOOK:
        r = requests.post(
            url=settings.USER_SIGNUP_NOTIFICATION_WEBHOOK,
            headers={"Content-Type": "application/json"},
            json={"text": msg},
        )
        r.raise_for_status()

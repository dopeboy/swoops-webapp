import time
from datetime import datetime, timedelta

import requests
from pytz import timezone
from requests.exceptions import RequestException


def round_if_not_null(decimal_number):
    return round(decimal_number) if decimal_number else None


def retry_request(
    url,
    max_retries=3,
    backoff_factor=2,
    params=None,
    headers={"accept": "application/json"},
):
    retries = 0
    retry_delay = 1

    while retries < max_retries:
        try:
            response = requests.get(url, headers=headers, params=params)
            # Check if the request was successful
            response.raise_for_status()
            return response
        except RequestException as e:
            print(f"Request failed: {str(e)}")

        retries += 1
        retry_delay *= backoff_factor
        time.sleep(retry_delay)

    # Max retries exceeded
    return None


# This is from 9PM ET yesterday to 9PM ET today.
def get_eastern_time_range_starting_today(days=1):
    tz = timezone("America/New_York")
    start_of_day = (datetime.now(tz) + timedelta(hours=3)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    end_of_day = start_of_day + timedelta(days=days)

    return start_of_day, end_of_day


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

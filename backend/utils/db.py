import inspect
import os
from typing import Any

import django_pglocks
from django.conf import settings
from django.db import connection


def mutex(func):
    """Creates a mutex when running a function.

    By default, the mutex will not wait for other instances of the
    function. It will simply ignore execution.
    """

    def wrapper(*args, **kwargs):
        lock_name = f"{inspect.getmodule(func).__name__}.{func.__name__}"

        with django_pglocks.advisory_lock(lock_name, wait=False) as acquired:
            if acquired:
                return func(*args, **kwargs)
            else:
                raise Exception(f"Could not acquire lock {lock_name}")

    return wrapper


def load_data_from_sql(filename: str, timezone: str = None, **kwargs: Any) -> dict:
    """A function that runs raw SQL given a filename

    Args:
        filename ([str]): is the path of the SQL file inside the django project

    Returns:
        [dict]: results of the query
    """
    file_path = os.path.join(settings.BASE_DIR, filename)
    sql_statement = open(file_path).read()
    with connection.cursor() as c:
        if timezone:
            c.execute(f"SET TIMEZONE TO '{timezone}';")
        c.execute(sql_statement, kwargs)
        data = dictfetchall(c)
        if timezone:
            c.execute("SET TIMEZONE TO 'UTC';")
        return data


def execute_sql_statement(sql_statement: str) -> dict:
    with connection.cursor() as c:
        c.execute(sql_statement)
        data = dictfetchall(c)
        return data


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

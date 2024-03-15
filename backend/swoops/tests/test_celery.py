import importlib

import celery
from django.conf import settings


def test_celery_beat_schedule_correct():
    """Verifies that the tasks in the celery beat schedule have been loaded

    Assumes that our tasks are declared in the schedule
    by their full module path
    """
    for task in settings.CELERY_BEAT_SCHEDULE.values():
        task_module, task_func = task["task"].rsplit(".", 1)

        module = importlib.import_module(task_module)
        assert hasattr(module, task_func)
        task = getattr(module, task_func)

        assert isinstance(task, celery.Task)

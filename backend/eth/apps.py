from django.apps import AppConfig


class EthConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "eth"

    def ready(self):
        from . import signals  # noqa: F401

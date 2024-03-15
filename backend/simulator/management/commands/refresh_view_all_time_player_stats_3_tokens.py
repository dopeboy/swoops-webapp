import time

from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Refresh view all time player stats 3 tokens"

    def handle(self, *args, **options):
        self._refresh_materialized_view()

    def _refresh_materialized_view(self):
        with connection.cursor() as cursor:
            start_time = time.time()
            self.stdout.write("REFRESH MATERIALIZED VIEW :: STARTED %s" % start_time)

            cursor.execute(
                """
                REFRESH MATERIALIZED VIEW CONCURRENTLY
                view_all_time_player_stats_3_tokens;
                """
            )

            end_time = time.time()
            self.stdout.write("REFRESH MATERIALIZED VIEW :: FINISHED %s" % end_time)
            self.stdout.write("TIME ELAPSED %s" % (end_time - start_time))

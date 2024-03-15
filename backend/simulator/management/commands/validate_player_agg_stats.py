import argparse
import os
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone
from sentry_sdk import capture_message

import simulator.models
import utils.db
from utils.db import dictfetchall


class Command(BaseCommand):
    help = "For all players, this command validates the following player aggregated stats. PPG, APG, RPG."  # noqa: E501
    print_error_stats = False

    def add_arguments(self, parser):
        parser.add_argument(
            "--print-error-stats",
            dest="print-error-stats",
            action=argparse.BooleanOptionalAction,
            default=False,
        )

    def report_stat_exception(
        self, player_token, stat_name, current_stat, expected_stat
    ):

        error_message = f"""Player {player_token} {stat_name} doesn't match.  Current: { round(current_stat, 3) }, Expected: {round(expected_stat, 3) }"""  # noqa: E501

        if self.print_error_stats:
            print(error_message)

        capture_message(error_message)

    @utils.db.mutex
    def get_agg_simulator_player_stats(self):
        simulator_player_stats = {}

        for simulated_player in simulator.models.Player.objects.select_related(
            "player"
        ).all():
            game_player = simulated_player.player
            simulator_player_stats[simulated_player.canonical] = {
                "wins": game_player.wins or 0,
                "losses": game_player.losses or 0,
                "ppg": simulated_player.ppg or 0.0,
                "fg_pct": simulated_player.fg_pct or 0.0,
                "three_p_pct": simulated_player.three_p_pct or 0.0,
                "ft_pct": simulated_player.ft_pct or 0.0,
                "orpg": simulated_player.orpg or 0.0,
                "drpg": simulated_player.drpg or 0.0,
                "rpg": simulated_player.rpg or 0.0,
                "apg": simulated_player.apg or 0.0,
                "spg": simulated_player.spg or 0.0,
                "bpg": simulated_player.bpg or 0.0,
                "tpg": simulated_player.tpg or 0.0,
                "fpg": simulated_player.fpg or 0.0,
            }

        return simulator_player_stats, timezone.now()

    def handle(self, *args, **options):
        self.print_error_stats = options["print-error-stats"]
        sim_agg_stats, time_completed = self.get_agg_simulator_player_stats()

        file_path = os.path.join(
            settings.BASE_DIR, "game/sql/leaderboard_player_query.sql"
        )

        # replacing query NOW time range limit
        sql_statement = open(file_path).read()

        sql_statement = sql_statement.replace(
            "NOW()", time_completed.strftime("'%Y-%m-%d %H:%M:%S'")
        )

        with connection.cursor() as c:
            c.execute(sql_statement)
            query_result = dictfetchall(c)

        decimal_places = 3
        for player_stats in query_result:
            player_token = player_stats["token"]
            player_canonical = player_stats["canonical"]

            # check wins
            if sim_agg_stats[player_canonical]["wins"] != player_stats["wins"]:
                self.report_stat_exception(
                    player_token,
                    "WINS",
                    sim_agg_stats[player_canonical]["wins"],
                    player_stats["wins"],
                )

            # check losses
            if sim_agg_stats[player_canonical]["losses"] != player_stats["losses"]:
                self.report_stat_exception(
                    player_token,
                    "LOSSES",
                    sim_agg_stats[player_canonical]["losses"],
                    player_stats["losses"],
                )

            # check pts
            if round(sim_agg_stats[player_canonical]["ppg"], decimal_places) != round(
                Decimal(str(player_stats["ppg"] or "0.0")), decimal_places
            ):
                self.report_stat_exception(
                    player_token,
                    "PPG",
                    sim_agg_stats[player_canonical]["ppg"],
                    player_stats["ppg"],
                )

            # check fg
            if round(
                sim_agg_stats[player_canonical]["fg_pct"] * 100, decimal_places
            ) != round(Decimal(str(player_stats["fg_pct"] or "0.0")), decimal_places):
                self.report_stat_exception(
                    player_token,
                    "FG%",
                    sim_agg_stats[player_canonical]["fg_pct"] * 100,
                    player_stats["fg_pct"],
                )

            if round(
                sim_agg_stats[player_canonical]["three_p_pct"] * 100, decimal_places
            ) != round(
                Decimal(str(player_stats["three_p_pct"] or "0.0")), decimal_places
            ):
                self.report_stat_exception(
                    player_token,
                    "3PT%",
                    sim_agg_stats[player_canonical]["three_p_pct"] * 100,
                    player_stats["three_p_pct"],
                )

            if round(
                sim_agg_stats[player_canonical]["ft_pct"] * 100, decimal_places
            ) != round(Decimal(str(player_stats["ft_pct"] or "0.0")), decimal_places):
                self.report_stat_exception(
                    player_token,
                    "FT%",
                    sim_agg_stats[player_canonical]["ft_pct"] * 100,
                    player_stats["ft_pct"],
                )

            if round(sim_agg_stats[player_canonical]["orpg"], decimal_places) != round(
                Decimal(str(player_stats["orpg"] or "0.0")), decimal_places
            ):
                self.report_stat_exception(
                    player_token,
                    "ORPG",
                    sim_agg_stats[player_canonical]["orpg"],
                    player_stats["orpg"],
                )

            if round(sim_agg_stats[player_canonical]["drpg"], decimal_places) != round(
                Decimal(str(player_stats["drpg"] or "0.0")), decimal_places
            ):
                self.report_stat_exception(
                    player_token,
                    "DRPG",
                    sim_agg_stats[player_canonical]["drpg"],
                    player_stats["drpg"],
                )

            if round(sim_agg_stats[player_canonical]["rpg"], decimal_places) != round(
                Decimal(str(player_stats["rpg"] or "0.0")), decimal_places
            ):
                self.report_stat_exception(
                    player_token,
                    "RPG",
                    sim_agg_stats[player_canonical]["rpg"],
                    player_stats["rpg"],
                )

            if round(sim_agg_stats[player_canonical]["apg"], decimal_places) != round(
                Decimal(str(player_stats["apg"] or "0.0")), decimal_places
            ):
                self.report_stat_exception(
                    player_token,
                    "APG",
                    sim_agg_stats[player_canonical]["apg"],
                    player_stats["apg"],
                )

            if round(sim_agg_stats[player_canonical]["spg"], decimal_places) != round(
                Decimal(str(player_stats["spg"] or "0.0")), decimal_places
            ):
                self.report_stat_exception(
                    player_token,
                    "SPG",
                    sim_agg_stats[player_canonical]["spg"],
                    player_stats["spg"],
                )

            if round(sim_agg_stats[player_canonical]["bpg"], decimal_places) != round(
                Decimal(str(player_stats["bpg"] or "0.0")), decimal_places
            ):
                self.report_stat_exception(
                    player_token,
                    "BPG",
                    sim_agg_stats[player_canonical]["bpg"],
                    player_stats["bpg"],
                )

            if round(sim_agg_stats[player_canonical]["tpg"], decimal_places) != round(
                Decimal(str(player_stats["tpg"] or "0.0")), decimal_places
            ):
                self.report_stat_exception(
                    player_token,
                    "TPG",
                    sim_agg_stats[player_canonical]["tpg"],
                    player_stats["tpg"],
                )

            if round(sim_agg_stats[player_canonical]["fpg"], decimal_places) != round(
                Decimal(str(player_stats["fpg"] or "0.0")), decimal_places
            ):
                self.report_stat_exception(
                    player_token,
                    "FPG",
                    sim_agg_stats[player_canonical]["fpg"],
                    player_stats["fpg"],
                )

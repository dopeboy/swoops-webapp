import logging

from django.core.management import call_command

import swoops.celery

LOGGER = logging.getLogger(__name__)


@swoops.celery.app.task()
def update_simulated_games():
    LOGGER.info("Updating simulated games...")
    call_command("update_simulated_games")


@swoops.celery.app.task()
def check_all_players_exist_within_sim():
    LOGGER.info(
        "Check all players within webapp exist within simulator.",
    )
    call_command("check_all_players_exist_within_sim")


@swoops.celery.app.task()
def validate_player_agg_stats():
    LOGGER.info(
        "For all players, this task validates the following player aggregated stats. PPG, APG, RPG",  # noqa: E501
    )
    call_command("validate_player_agg_stats")


def calc_players_stats():
    LOGGER.info("calculate player stats...")
    call_command("calc_players_stats")


@swoops.celery.app.task()
def refresh_view_current_season_player_stats():
    LOGGER.info("Refreshing view_current_season_player_stats...")
    call_command("refresh_view_current_season_player_stats")


@swoops.celery.app.task()
def refresh_view_all_time_player_stats():
    LOGGER.info("Refreshing view_all_time_player_stats...")
    call_command("refresh_view_all_time_player_stats")


@swoops.celery.app.task()
def refresh_view_all_time_team_stats():
    LOGGER.info("Refreshing view_all_time_team_stats...")
    call_command("refresh_view_all_time_team_stats")


@swoops.celery.app.task()
def refresh_view_current_season_player_stats_1_token():
    LOGGER.info("Refreshing view_current_season_player_stats...")
    call_command("refresh_view_current_season_player_stats_1_token")


@swoops.celery.app.task()
def refresh_view_all_time_player_stats_1_token():
    LOGGER.info("Refreshing view_all_time_player_stats...")
    call_command("refresh_view_all_time_player_stats_1_token")


@swoops.celery.app.task()
def refresh_view_current_season_player_stats_3_tokens():
    LOGGER.info("Refreshing view_current_season_player_stats...")
    call_command("refresh_view_current_season_player_stats_3_tokens")


@swoops.celery.app.task()
def refresh_view_all_time_player_stats_3_tokens():
    LOGGER.info("Refreshing view_all_time_player_stats...")
    call_command("refresh_view_all_time_player_stats_3_tokens")


@swoops.celery.app.task()
def refresh_view_current_season_player_stats_5_tokens():
    LOGGER.info("Refreshing view_current_season_player_stats...")
    call_command("refresh_view_current_season_player_stats_5_tokens")


@swoops.celery.app.task()
def refresh_view_all_time_player_stats_5_tokens():
    LOGGER.info("Refreshing view_all_time_player_stats...")
    call_command("refresh_view_all_time_player_stats_5_tokens")


@swoops.celery.app.task()
def refresh_view_current_season_team_leaderboard():
    LOGGER.info("Refreshing refresh_view_current_season_team_leaderboard...")
    call_command("refresh_view_current_season_team_leaderboard")


@swoops.celery.app.task()
def refresh_view_current_season_team_sp():
    LOGGER.info("Refreshing refresh_view_current_season_team_sp...")
    call_command("refresh_view_current_season_team_sp")

import logging

from django.core.management import call_command

import swoops.celery

LOGGER = logging.getLogger(__name__)


@swoops.celery.app.task()
def sync_game_players():
    LOGGER.info("Syncing game players...")
    call_command("sync_game_players")


@swoops.celery.app.task()
def update_player_team_ownership():
    LOGGER.info("Updating player ownership...")
    call_command("update_player_team_ownership")


# This job runs frequently and checks if there are
# X number of open games in existence. If there isn't,
# then it creates the number of games needed to reach X open games.
@swoops.celery.app.task()
def top_up_open_games_to_limit():
    LOGGER.info(
        "Checking if sufficient number of open games exist...",
    )
    call_command("top_up_open_games_to_limit")


@swoops.celery.app.task()
def update_tournament_series():
    LOGGER.info("Update Tournament Series...")
    call_command("update_tournament_series")


@swoops.celery.app.task()
def update_tournament_rounds():
    LOGGER.info("Update Tournament Rounds...")
    call_command("update_tournament_rounds")


@swoops.celery.app.task()
def sync_opensea_player_prices():
    LOGGER.info(
        "Sync all player prices listed on OpenSea",
    )
    call_command("sync_opensea_player_prices")


@swoops.celery.app.task()
def init_in_season_tournament():
    LOGGER.info(
        "Initialize In-Season Tournament",
    )
    call_command("init_in_season_tournament")


@swoops.celery.app.task()
def finalize_in_season_tournament():
    LOGGER.info(
        "finalize in-season tournament",
    )
    call_command("finalize_in_season_tournament")


@swoops.celery.app.task()
def process_h2h_match_make_queue():
    LOGGER.info(
        "process h2h match make queue",
    )
    call_command("process_h2h_match_make_queue")


@swoops.celery.app.task()
def initiate_payouts():
    LOGGER.info("initiate payouts")
    call_command("initiate_payouts")


@swoops.celery.app.task()
def confirm_payouts():
    LOGGER.info("confirm payouts")
    call_command("confirm_payouts")


@swoops.celery.app.task()
def check_balance():
    LOGGER.info("check balance")
    call_command("check_balance")


@swoops.celery.app.task()
def grant_offchain_player_to_new_users():
    LOGGER.info("grant_offchain_player_to_new_users")
    call_command("grant_offchain_player_to_new_users")

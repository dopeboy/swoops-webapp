import logging
import random

from django.contrib.auth import get_user_model
from django.dispatch import receiver
from django.utils import timezone

import accounts.models
import game.models
import game.players
import simulator.models
from game.mappers import map_simulator_status_to_game_status
from signals.signals import (
    game_simulation_status_updated,
    new_account_created,
    player_ownership_updated,
    team_logo_change_accepted,
    team_name_change_accepted,
)

LOGGER = logging.getLogger(__name__)


@receiver(team_name_change_accepted)
def handle_team_name_change_accepted(sender, **kwargs):
    team = game.models.Team.objects.get(pk=kwargs["team_id"])
    team.name = kwargs["name"]
    team.save(update_fields=["name"])


@receiver(team_logo_change_accepted)
def handle_team_logo_change_accepted(sender, **kwargs):
    team = game.models.Team.objects.get(pk=kwargs["team_id"])
    team.path = kwargs["path"]
    team.save(update_fields=["path"])


@receiver(player_ownership_updated)
def handle_player_ownership_updated(sender, **kwargs):
    game.players.update_team_ownership_for_wallet(kwargs["new_owner"])


@receiver(new_account_created)
def handle_new_account_created(sender, **kwargs):
    # It's possible that someone has purchased a token without having an account. When
    # they create an account we need to assign any players they own to their team.
    #
    # We catch all exceptions because we NEVER want an error to prevent a user from
    # signing up.

    user = get_user_model().objects.get(id=kwargs["user_id"])
    teamname = "TEAM-" + kwargs["wallet"][-4:]
    team, created = game.models.Team.objects.get_or_create(owner=user, name=teamname)

    player = _find_available_off_chain_player()
    if player:
        player.team = team
        player.save()
    else:
        LOGGER.exception(f"Team: {team.id} wasn't assigned an off-chain player")

    user.tutorial = accounts.models.Tutorial.objects.create()
    user.save()

    try:
        game.players.update_team_ownership_for_wallet(wallet=kwargs["wallet"])
    except Exception as e:
        LOGGER.exception("Error while updating team ownership: %s" % e)


def _find_available_off_chain_player():
    query = {
        "team": None,
        "simulated__kind": simulator.models.Player.Kind.OFF_CHAIN,
        "simulated__token__lte": 1001999,
    }
    players = game.models.Player.objects.select_related("simulated").filter(**query)
    return random.choice(players) if players else None


@receiver(game_simulation_status_updated)
def handle_game_simulation_status_updated(sender, **kwargs):
    game_obj = game.models.Game.objects.get(simulation__uuid=kwargs["simulation_uuid"])
    game_obj.contest.status = map_simulator_status_to_game_status(kwargs["status"])
    game_obj.contest.played_at = timezone.now()
    game_obj.contest.save()

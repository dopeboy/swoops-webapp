import logging
import random
from datetime import datetime, timedelta
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import Count, Q, Sum
from django.utils import timezone

import accounts.models
import game.models
import utils.db
from game.signals import _find_available_off_chain_player

LOGGER = logging.getLogger(__name__)


@utils.db.mutex
@transaction.atomic
def create_games(
    number_of_games, kind=game.models.Contest.Kind.HEAD_TO_HEAD, max_tokens_allowed=1
):
    LOGGER.info(f"Creating {number_of_games} new {kind} games")
    for _ in range(number_of_games):
        # Find all the games created from the start of the hour to now
        start_of_hour = datetime.now().replace(minute=0, second=0, microsecond=0)
        games_created_in_current_hour = game.models.Game.objects.filter(
            created_at__gte=start_of_hour,
            prize_pool__isnull=False,
            visibility=game.models.Game.Visibility.PUBLIC,
        )

        # Sum up the total prize pool in those games
        total_prizes_in_current_hour = (
            0
            if not games_created_in_current_hour
            else games_created_in_current_hour.aggregate(Sum("prize_pool"))[
                "prize_pool__sum"
            ]
        )

        # If that total exceeds our hourly cap, new game will be $0 game
        if total_prizes_in_current_hour > settings.PRIZE_POOL_HOURLY_CAP_USD:
            prize_amt = 0

        # Else, use weighted probability
        else:
            choices = [1, 0.50, 0.25, 0]  # USD
            weights = (1, 3, 6, 90)  # adds to 100

            # This means first choice has first weight, second choice has
            # second weight, etc.
            prize_amt = random.choices(choices, cum_weights=weights, k=1)[0]

        g = game.models.Game.objects.create(
            contest=game.models.Contest.objects.create(
                kind=kind, tokens_required=max_tokens_allowed
            ),
            prize_pool=Decimal(0),
        )

        LOGGER.info(
            (
                "Created a new {} game with id={}"
                " and prize = ${} and token_required = {}".format(
                    kind, g.id, prize_amt, max_tokens_allowed
                )
            )
        )


@utils.db.mutex
@transaction.atomic
def top_up_open_games_to_limit(kind=game.models.Contest.Kind.HEAD_TO_HEAD):
    LOGGER.info(
        f"Current limit for open games set to: "
        f"{settings.OPEN_GAMES_LIMIT} per 1/3/5 section"
    )

    for max_tokens_allowed in [1, 3, 5]:
        current_open_game_count = (
            game.models.Game.objects.annotate(num_reservations=Count("reservations"))
            .filter(contest__status=game.models.Contest.Status.OPEN)
            .filter(contest__tokens_required=max_tokens_allowed)
            .filter(visibility=game.models.Game.Visibility.PUBLIC)
            .filter(
                Q(lineup_1__isnull=True, lineup_2__isnull=True, num_reservations__lte=1)
                | Q(lineup_1__isnull=False, lineup_2__isnull=True, num_reservations=0)
            )
            .count()
        )

        delta = settings.OPEN_GAMES_LIMIT - current_open_game_count

        # If we have less games than our limit, create the difference
        if delta > 0:
            LOGGER.info(f"Creating {delta} new {kind} games")
            create_games(delta, kind, max_tokens_allowed)

        # If we have more games than our limit, we're either testing
        # or something is wrong. Either way, log message but take no action
        else:
            LOGGER.info(
                f"Detected {current_open_game_count} open games for "
                f"{max_tokens_allowed} section. Taking no action"
            )


@utils.db.mutex
def grant_offchain_player_to_new_users(dry_run=False):
    LOGGER.info("Running job to grant offchain player to recently signed up users...")

    now = timezone.now() - timedelta(days=2)

    for u in accounts.models.User.objects.filter(date_joined__gte=now):
        if (
            u.team
            and u.team.player_set.filter(simulated__kind="OFF_CHAIN").count() == 0
        ):
            LOGGER.info(f"Attempting to grant offchain player to team {u.team.id}...")
            p = _find_available_off_chain_player()

            if p:
                LOGGER.info(f"Granted offchain player {p.id} to {u.team.id}.")
                if not dry_run:
                    p.team = u.team
                    p.save()
            else:
                LOGGER.error(f"Failed to grant player to {u.team.id}")

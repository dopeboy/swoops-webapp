import json
import logging
import math
from decimal import Decimal

from django.db.models import F
from django.utils import timezone

import game.models
import game.utils
import simulator.models
import utils.db

LOGGER = logging.getLogger(__name__)


@utils.db.mutex
def update_tournament_series():
    my_filter = {"status": game.models.Series.Status.STARTED}
    my_series = game.models.Series.objects.select_related(
        "round", "round__tournament", "entry_1", "entry_2"
    ).filter(**my_filter)
    for series in my_series:
        start_date = series.round.tournament.start_date.astimezone(timezone.utc)
        end_date = series.round.tournament.end_date.astimezone(timezone.utc)
        if series.round.tournament.kind == game.models.Tournament.Kind.IN_SEASON:
            if start_date >= timezone.now() and end_date <= timezone.now():
                continue

        my_meta = json.loads(series.round.tournament.meta)
        max_games = my_meta["max_games_per_round"][series.round.stage]
        min_games = math.floor((max_games / 2) + 1)

        games_started = series.games.count()
        games_finished = series.games.filter(
            simulation__status=simulator.models.Simulation.Status.FINISHED
        ).count()

        if games_started == 0:
            continue

        if games_started != games_finished:
            continue

        if games_started == max_games:
            series.status = game.models.Series.Status.FINISHED
            series.save()
        elif games_started < min_games:
            game.utils.create_game_for_tournament(series)
        else:
            entry_1_wins = series.games.filter(
                simulation__result__lineup_1_score__gt=F(
                    "simulation__result__lineup_2_score"
                )
            ).count()
            entry_2_wins = games_started - entry_1_wins
            if entry_1_wins >= min_games or entry_2_wins >= min_games:
                series.status = game.models.Series.Status.FINISHED
                series.save()
            else:
                game.utils.create_game_for_tournament(series)


def _get_series_winner(series):
    finished_games_count = series.games.filter(
        simulation__status=simulator.models.Simulation.Status.FINISHED  # noqa: E501
    ).count()
    entry_1_wins = series.games.filter(
        simulation__result__lineup_1_score__gt=F("simulation__result__lineup_2_score")
    ).count()

    entry_2_wins = finished_games_count - entry_1_wins

    if entry_1_wins > entry_2_wins:
        return series.entry_1
    else:
        return series.entry_2


@utils.db.mutex
def update_tournament_rounds():
    # process rounds that are running
    my_filter = {"status": game.models.Round.Status.SIMULATING_GAMES}
    my_rounds = game.models.Round.objects.select_related("tournament").filter(
        **my_filter
    )

    for current_round in my_rounds:
        # check all entries within Series are finished
        if (
            game.models.Series.objects.filter(
                round=current_round, status=game.models.Series.Status.FINISHED
            ).count()
            == game.models.Series.objects.filter(round=current_round).count()
        ):
            current_round.status = game.models.Round.Status.FINISHED
            current_round.save()

            my_filter = {
                "status": game.models.Round.Status.NOT_STARTED,
                "tournament": current_round.tournament,
                "stage": current_round.stage + 1,
            }

            if current_round.stage < game.utils.calculate_round_count(
                current_round.tournament.size
            ):
                next_round = game.models.Round.objects.get(**my_filter)

                next_round.status = game.models.Round.Status.STARTED
                next_round.save()

    # process rounds that have been started
    my_filter = {"status": game.models.Round.Status.STARTED, "stage__gt": 0}
    my_rounds = game.models.Round.objects.select_related("tournament").filter(
        **my_filter
    )

    for current_round in my_rounds:
        current_series = game.models.Series.objects.filter(
            round=current_round
        ).order_by("created_at")

        previous_series = game.models.Series.objects.filter(
            round__tournament=current_round.tournament,
            round__stage=current_round.stage - 1,
        ).order_by("order")

        previous_series_count = previous_series.count()
        current_series_index = 0

        for bracket_index in range(0, previous_series_count, 2):
            winner_1 = _get_series_winner(previous_series[bracket_index])
            winner_2 = _get_series_winner(previous_series[bracket_index + 1])

            my_series = current_series[current_series_index]
            my_series.entry_1 = winner_1
            my_series.entry_2 = winner_2
            my_series.order = bracket_index
            my_series.save()

            game.utils.create_game_for_tournament(my_series)
            my_series.status = game.models.Series.Status.STARTED
            my_series.save()

            current_series_index += 1

        current_round.status = game.models.Round.Status.SIMULATING_GAMES
        current_round.save()


@utils.db.mutex
def init_in_season_tournament():
    now = timezone.now()
    for tournament in game.models.Tournament.objects.filter(
        lineup_submission_cutoff__lt=now,
        kind=game.models.Tournament.Kind.IN_SEASON,
        contest__status=game.models.Contest.Status.OPEN,
    ):
        # void unfilled tournaments
        if not game.utils.is_tournament_entries_filled(tournament):
            tournament.contest.status = game.models.Contest.Status.VOIDED
            tournament.contest.save()
            continue

        # assign seeding
        game.utils.random_assign_tournament_seeding(tournament=tournament)

        # load matchups
        game.utils.matchup_tournament_entries(tournament)

        # run round 1 simulations
        game.utils.run_tournament_simulations(tournament)


@utils.db.mutex
def finalize_in_season_tournament():
    now = timezone.now()

    for tournament in game.models.Tournament.objects.filter(
        public_publish_datetime__lte=now,
        kind=game.models.Tournament.Kind.IN_SEASON,
        contest__status=game.models.Contest.Status.COMPLETE,
        finalized_on=None,
    ):
        for series in game.models.Series.objects.filter(round__tournament=tournament):
            game.utils.public_publish_series(series)

        game.utils.finalize_tournament(tournament)


# This job works through the list of folks who are seeking
# to be matchmade with an opponent for a h2h game.
@utils.db.mutex
def process_h2h_match_make_queue():
    # Get the list of opponents who have not been paired with
    # an opponent yet, in the order that they came into the
    # queue.
    seekers = game.models.HeadToHeadMatchMakeQueue.objects.filter(
        sent_to_simulator_at__isnull=True
    ).order_by("created_at")

    LOGGER.info(f"Found {seekers.count()} teams looking to be matched...")

    uniques = {}
    unique_queue_size = 12  # Must be an even number!
    uniques_sorted_by_score = {}

    for entry in seekers:
        # If we haven't seen this team yet, put it in the dict
        if entry.team.id not in uniques:
            uniques[entry.team.id] = entry

        # Once this dict hits a size of unique_queue_size,
        # put it in another dict and sort the entries
        # by score.
        if len(uniques) == unique_queue_size:
            LOGGER.info(f"Minimum size of {unique_queue_size} met. Forming pairs...")
            uniques_sorted_by_score = {
                k: v for k, v in sorted(uniques.items(), key=lambda item: item[1].score)
            }
            break

    # Now, all the teams are sorted by score. That means
    # each team is next to a similar skilled team. So
    # pair a team with its neighbor (1 with 2, 3 with 4, etc)
    # 'left_entry' represents first element of pair, 'right_entry'
    # represents second
    i = 0
    left_entry = None
    right_entry = None

    # On every even team, make pair
    for key, seeker in uniques_sorted_by_score.items():
        i = i + 1

        # Odd, so first of the pair
        if i % 2 == 1:
            left_entry = seeker

        # Even, so second of the pair
        if i % 2 == 0:
            right_entry = seeker

            # Create a game
            match_made_game = game.models.Game.objects.create(
                contest=game.models.Contest.objects.create(
                    kind=game.models.Contest.Kind.HEAD_TO_HEAD_MATCH_MAKE,
                    tokens_required=seeker.max_tokens_allowed,
                ),
                prize_pool=Decimal(0),
                lineup_1=left_entry.lineup,
                lineup_2=right_entry.lineup,
                revealed_to_user_1=left_entry.team.owner.reveal_games_by_default,
                revealed_to_user_2=right_entry.team.owner.reveal_games_by_default,
            )

            # Save audit data
            current_time = timezone.now()

            left_entry.sent_to_simulator_at = current_time
            left_entry.paired_with = right_entry.team
            left_entry.game = match_made_game
            left_entry.save()

            right_entry.sent_to_simulator_at = current_time
            right_entry.paired_with = left_entry.team
            right_entry.game = match_made_game
            right_entry.save()

            LOGGER.info(
                f"{left_entry.team.name} was paired with {right_entry.team.name} for game {match_made_game.id}"  # noqa: E501
            )

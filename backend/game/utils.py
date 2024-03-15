import logging
import math

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone

import game.models
import simulator.models
from utils.db import execute_sql_statement

LOGGER = logging.getLogger(__name__)


def create_game_for_tournament(series):
    my_game = game.models.Game.objects.create(
        **{
            "contest": series.round.tournament.contest,
            "lineup_1": series.entry_1.lineup,
            "lineup_2": series.entry_2.lineup,
            "revealed_to_user_1": series.entry_1.team.owner.reveal_games_by_default,
            "revealed_to_user_2": series.entry_2.team.owner.reveal_games_by_default,
            "visibility": game.models.Game.Visibility.HIDDEN,
        }
    )
    series.games.add(my_game)


def calculate_series_count(tournament_size, stage):
    return int(tournament_size / (int(2**stage) * 2))


def calculate_round_count(tournament_size):
    return int(math.log(tournament_size, 2))


def get_series_games(request_user, series):
    if request_user and request_user.is_staff:
        return series.games.filter(
            Q(visibility=game.models.Game.Visibility.STAFF)
            | Q(visibility=game.models.Game.Visibility.PUBLIC)
        )
    return series.games.filter(**{"visibility": game.models.Game.Visibility.PUBLIC})


def get_request_user(request):
    user_model = get_user_model()
    try:
        return user_model.objects.get(id=request.user.id)
    except user_model.DoesNotExist:
        return None


def count_number_of_players_owned_by_team_lineup(team, lineup):
    players_owned_by_team = 0

    for i in range(5):
        if game.models.Player.objects.filter(
            id=lineup[f"player_{i + 1}"], team=team
        ).exists():
            players_owned_by_team += 1

    return players_owned_by_team


# This check passes:
#  - if max_tokens_allowed is None, meaning that this game has no token gating
#  - or the number of players in lineup matches <= max_tokens_allowed
def is_pass_token_gate_requirement(max_tokens_allowed, team, lineup):
    count_of_players_owned_by_team = count_number_of_players_owned_by_team_lineup(
        team, lineup
    )

    return (
        not max_tokens_allowed or count_of_players_owned_by_team <= max_tokens_allowed
    )


def random_assign_tournament_seeding(tournament):
    seed = 1
    for index, tournament_entry in enumerate(
        game.models.TournamentEntry.objects.filter(tournament=tournament).order_by("?")
    ):
        tournament_entry.rank = index + 1
        tournament_entry.seed = seed
        tournament_entry.save()

        if (not (index + 1) % 4) or (  # regular seeding for all other tournament sizes
            not (index + 1) % 2
            and tournament.size
            == 4  # special seeding condition for tournament size of 4
        ):
            seed += 1


def is_tournament_entries_filled(tournament):
    return (
        tournament.size
        == game.models.TournamentEntry.objects.filter(
            ~Q(lineup=None), tournament=tournament
        ).count()
    )


def _get_series_order(size, bracket_index):
    # This lookup table is used to properly order an unordered series.
    # It matches the bracket index to the series order number.
    # key: tournament size
    # list index: bracket_index
    # value: series order number
    series_order = {
        4: [1, 2],
        8: [1, 3, 4, 2],
        16: [1, 5, 7, 3, 4, 8, 6, 2],
        32: [1, 9, 13, 5, 8, 16, 12, 4, 3, 11, 15, 7, 6, 14, 10, 2],
        64: [
            1,
            17,
            25,
            9,
            16,
            32,
            24,
            8,
            6,
            22,
            30,
            14,
            12,
            28,
            20,
            4,
            3,
            19,
            27,
            11,
            13,
            29,
            21,
            5,
            7,
            23,
            31,
            15,
            10,
            26,
            18,
            2,
        ],
    }

    return series_order[size][bracket_index]


def matchup_tournament_entries(tournament):
    try:
        current_round = game.models.Round.objects.get(
            **{"status": game.models.Round.Status.STARTED, "tournament": tournament}
        )
    except game.models.Round.DoesNotExist:
        tournament.contest.status = game.models.Contest.Status.ERROR
        tournament.contest.save()

        LOGGER.exception(
            f"Error retrieving current round within tournament {tournament.id}",
        )
        return

    tournament_entries = game.models.TournamentEntry.objects.filter(
        tournament=tournament
    ).order_by("rank")
    tournament_entries_count = tournament_entries.count()

    for bracket_index, my_series in enumerate(
        game.models.Series.objects.filter(round=current_round).order_by("created_at")
    ):
        # entry_1 and entry_2 are selected from the first and last entry
        # within the next iteration the second and second to last entry
        # and so on .... until the center is met
        entry_1 = tournament_entries[bracket_index]  # first entry
        entry_2 = tournament_entries[
            tournament_entries_count - 1 - bracket_index
        ]  # last entry
        my_series.entry_1 = entry_1
        my_series.entry_2 = entry_2
        my_series.order = _get_series_order(tournament.size, bracket_index)
        my_series.save()


def run_tournament_simulations(tournament):
    try:
        current_round = game.models.Round.objects.get(
            **{"status": game.models.Round.Status.STARTED, "tournament": tournament}
        )
    except game.models.Round.DoesNotExist:
        tournament.contest.status = game.models.Contest.Status.ERROR
        tournament.contest.save()

        LOGGER.exception(
            f"Error retrieving current round within tournament {tournament.id}",
        )
        return None

    #  run round have series with all the lineups submitted
    for series in game.models.Series.objects.filter(
        Q(round=current_round)
        & ~Q(entry_1__lineup=None)
        & ~Q(entry_2__lineup=None)
        & Q(games=None)
    ):
        # Add the first game to series so the worker
        # can continue with rest of the games
        game.utils.create_game_for_tournament(series)

        series.status = game.models.Series.Status.STARTED
        series.save()

    current_round.status = game.models.Round.Status.SIMULATING_GAMES
    current_round.save()

    return current_round


def public_publish_series(series):
    series.games.update(visibility=game.models.Game.Visibility.PUBLIC)
    simulator_client = simulator.client.get()
    my_games = series.games.select_related("simulation")
    simulator_client.publish_games(
        [str(my_game.simulation.uuid) for my_game in my_games]
    )
    # All games within a series has the same lineups
    # Hence, we are only getting players from the first game
    # in the series
    player_uuids = [str(uuid) for uuid in my_games.first().simulation.lineup_1_uuids]
    player_uuids.extend(
        [str(uuid) for uuid in my_games.first().simulation.lineup_2_uuids]
    )
    simulator.utils.update_simulator_player_stats(
        simulator_client, player_uuids=player_uuids
    )
    for my_game in my_games:
        simulator.utils.update_team_stats(my_game.simulation)


# If they've played less than 10 games, give them a predefined low score.
# Else, calculate their real score.
def calc_team_score_for_matchmaking(team):
    # NOTE for future: use team stats model
    games_played_count = game.models.Game.objects.filter(
        Q(Q(lineup_1__team=team) | Q(lineup_2__team=team)),
        simulation__status=simulator.models.Simulation.Status.FINISHED,
        visibility=game.models.Game.Visibility.PUBLIC,
    ).count()

    if games_played_count < 10:
        return 0.35
    else:
        return get_l50_win_percentage_for_team(team)


# Get the last 50 games for a team. Probably a faster way to do
# this in all SQL.
def get_l50_win_percentage_for_team(team):
    # NOTE for future: use team stats model
    last_50_games = game.models.Game.objects.filter(
        Q(Q(lineup_1__team=team) | Q(lineup_2__team=team)),
        simulation__status=simulator.models.Simulation.Status.FINISHED,
        visibility=game.models.Game.Visibility.PUBLIC,
    ).order_by("-contest__played_at")[:50]

    wins = 0
    losses = 0

    for g in last_50_games:
        if g.lineup_1.team == team:
            if g.simulation.result.lineup_1_score > g.simulation.result.lineup_2_score:
                wins = wins + 1
            else:
                losses = losses + 1
        elif g.lineup_2.team == team:
            if g.simulation.result.lineup_2_score > g.simulation.result.lineup_1_score:
                wins = wins + 1
            else:
                losses = losses + 1

    return wins / (wins + losses)


def build_tournament_structure(tournament):
    round_count = calculate_round_count(tournament.size)

    for stage in range(round_count):
        my_round = game.models.Round()
        my_round.tournament = tournament
        my_round.stage = stage
        if my_round.stage == 0:  # set the first round default as started
            my_round.status = game.models.Round.Status.STARTED

        my_round.save()

        # create all series games for rounds
        series_count = game.utils.calculate_series_count(
            tournament.size, my_round.stage
        )
        for _ in range(series_count):
            series = game.models.Series()
            series.round = my_round
            series.save()


def finalize_tournament(tournament):
    is_all_tournament_series_games_complete = (
        game.models.Series.objects.filter(round__tournament=tournament)
        .exclude(games__visibility=game.models.Game.Visibility.PUBLIC)
        .count()
        == 0
    )
    if is_all_tournament_series_games_complete:
        tournament.finalized_on = timezone.now()
        tournament.save()


def get_tournament_entry_lineup(tournament):
    sql = f"""
        WITH game_lineup_prep
        AS (
        (
        SELECT gl.id
        ,gl.team_id
        ,gl.player_1_id AS player_id
        ,1 AS lineup_spot
        FROM game_lineup gl
        )
        UNION ALL
        (
        SELECT gl.id
            ,gl.team_id
            ,gl.player_2_id AS player_id
            ,2 AS lineup_spot
        FROM game_lineup gl
        )
        UNION ALL

        (
        SELECT gl.id
            ,gl.team_id
            ,gl.player_3_id AS player_id
            ,3 AS lineup_spot
            FROM game_lineup gl
        )
        UNION ALL
        (
        SELECT gl.id
            ,gl.team_id
            ,gl.player_4_id AS player_id
            ,4 AS lineup_spot
        FROM game_lineup gl
        )
        UNION ALL
        (
        SELECT gl.id
            ,gl.team_id
            ,gl.player_5_id AS player_id
            ,5 AS lineup_spot
        FROM game_lineup gl
        )
        )
        SELECT gte.id AS entry_id
            ,gte.lineup_id
            ,gte.tournament_id
            ,gte.seed
            ,gte.rank
            ,gte.team_id
            ,gt.name
            ,gt.wins
            ,gt.losses
            ,gt.path
            ,glp.player_id
            ,glp.lineup_spot
            ,sp.token
            ,sp.full_name
            ,sp.position_1
            ,sp.position_2
        FROM game_tournamententry gte
        INNER JOIN game_lineup_prep glp ON gte.lineup_id = glp.id
        INNER JOIN game_player gp ON glp.player_id = gp.id
        INNER JOIN game_team gt ON glp.team_id = gt.id
        INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
        WHERE gte.tournament_id = {tournament.id}
        ORDER BY gte.rank, gte.team_id, glp.lineup_spot
    """

    results = execute_sql_statement(sql)
    entries = []

    for result_index in range(0, len(results), 5):
        lineup = {}
        linueup_index = 1
        for player_index in range(result_index, result_index + 5):
            lineup[f"player_{linueup_index}"] = {
                "id": results[player_index]["player_id"],
                "token": results[player_index]["token"],
                "full_name": results[player_index]["full_name"],
                "positions": [
                    results[player_index]["position_1"],
                    results[player_index]["position_2"],
                ],
            }
            linueup_index += 1

        lineup["id"] = results[result_index]["lineup_id"]

        entry = {}
        entry["lineup"] = lineup
        entry["team"] = {
            "id": results[result_index]["team_id"],
        }
        entry["team"] = {
            "name": results[result_index]["name"],
            "id": results[result_index]["team_id"],
            "wins": results[result_index]["wins"],
            "losses": results[result_index]["losses"],
            "path": results[result_index]["path"],
        }
        entry["seed"] = results[result_index]["seed"]
        entry["rank"] = results[result_index]["rank"]
        entry["id"] = results[result_index]["entry_id"]
        entries.append(entry)
    return entries

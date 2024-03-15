import datetime as dt
import json
import logging
import traceback

import pgbulk
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone

import comm.handlers
import game.models
import simulator.client
import simulator.models
import simulator.utils
import utils.db
from signals.signals import game_simulation_status_updated

LOGGER = logging.getLogger(__name__)


@utils.db.mutex
def sync_players(download=False):
    """Syncs all players to the database.

    TODO: When the simulator maintains an "updated_at" column, we can
    more intellegently sync only plyers that have changed. For now
    we sync all
    """

    simulator_client = simulator.client.get()
    player_fields = {field.name for field in simulator.models.Player._meta.fields}

    player_data = simulator_client.players()
    players = []
    for player in player_data:
        if (
            player["token"] >= settings.PLAYER_MIN_TOKEN_ID_ACCESSIBLE
            and player["token"] <= settings.PLAYER_MAX_TOKEN_ID_ACCESSIBLE
        ):
            mapped_player = simulator.models.Player(
                **{
                    **player["attributes"],
                    **player["visual_attributes"],
                    **{
                        field: player[field]
                        for field in player_fields
                        if field in player
                    },  # noqa: E501
                    **{
                        "top_attribute_{}".format(index): top_attribute
                        for index, top_attribute in enumerate(
                            player["top_attributes"], start=1
                        )
                    },
                    **{
                        "position_{}".format(index): position
                        for index, position in enumerate(player["positions"], start=1)
                    },
                    "full_name": player["full_name"],
                }
            )
            players.append(mapped_player)

            pgbulk.upsert(simulator.models.Player, players, ["uuid"])


@utils.db.mutex
def create_games(simulation):
    """Create games in the simulator"""

    simulator_client = simulator.client.get()
    is_published = simulation.game.visibility == game.models.Game.Visibility.PUBLIC

    result = simulator_client.create_game(
        lineup_1_players=simulation.lineup_1_uuids,
        lineup_2_players=simulation.lineup_2_uuids,
        is_published=is_published,
    )

    simulation.uuid = result["uuid"]
    simulation.status = simulation.Status.PENDING
    simulation.save(update_fields=["uuid", "status", "updated_at"])


def _box_score_obj(box_score):
    box_score_fields = {field.name for field in simulator.models.BoxScore._meta.fields}
    return simulator.models.BoxScore(
        **{key: box_score[key] for key in box_score if key in box_score_fields}
    )


def _map_play_by_play(play_by_play):
    transformed_play_by_play = play_by_play[:]
    for play in transformed_play_by_play:
        play["possession"] = play.get("Possession")
        play["detail"] = play.get("pbp_string")

    return json.dumps(play_by_play)


@transaction.atomic
def finalize_game(simulator_client, simulation_obj, game_results_payload):
    # insert challengers boxscore results
    lineup_1_box_scores = [
        _box_score_obj(box_score)
        for box_score in game_results_payload["totals"]
        if box_score["Team"] == "Challengers"
    ]
    assert len(lineup_1_box_scores) == 1
    simulator.models.BoxScore.objects.bulk_create(lineup_1_box_scores)

    # insert individual challengers player boxscore results
    lineup_1_player_box_scores = {
        game_results_payload["players"][box_score["canonical"]]["uuid"]: _box_score_obj(
            box_score
        )
        for box_score in game_results_payload["challengers_boxscore"]
    }

    assert len(lineup_1_player_box_scores) == 5
    simulator.models.BoxScore.objects.bulk_create(lineup_1_player_box_scores.values())

    # insert challenged boxscore results
    lineup_2_box_scores = [
        _box_score_obj(box_score)
        for box_score in game_results_payload["totals"]
        if box_score["Team"] == "Challenged"
    ]
    assert len(lineup_2_box_scores) == 1
    simulator.models.BoxScore.objects.bulk_create(lineup_2_box_scores)

    # insert individual challenged player boxscore results
    lineup_2_player_box_scores = {
        game_results_payload["players"][box_score["canonical"]]["uuid"]: _box_score_obj(
            box_score
        )
        for box_score in game_results_payload["challenged_boxscore"]
    }
    assert len(lineup_2_player_box_scores) == 5
    simulator.models.BoxScore.objects.bulk_create(lineup_2_player_box_scores.values())

    # create results object and link to simulation object
    simulation_obj.result = simulator.models.Result.objects.create(
        lineup_1_score=lineup_1_box_scores[0].pts,
        lineup_2_score=lineup_2_box_scores[0].pts,
        lineup_1_box_score=lineup_1_box_scores[0],
        lineup_1_player_1_box_score=lineup_1_player_box_scores[
            str(simulation_obj.lineup_1_uuids[0])
        ],
        lineup_1_player_2_box_score=lineup_1_player_box_scores[
            str(simulation_obj.lineup_1_uuids[1])
        ],
        lineup_1_player_3_box_score=lineup_1_player_box_scores[
            str(simulation_obj.lineup_1_uuids[2])
        ],
        lineup_1_player_4_box_score=lineup_1_player_box_scores[
            str(simulation_obj.lineup_1_uuids[3])
        ],
        lineup_1_player_5_box_score=lineup_1_player_box_scores[
            str(simulation_obj.lineup_1_uuids[4])
        ],
        lineup_2_box_score=lineup_2_box_scores[0],
        lineup_2_player_1_box_score=lineup_2_player_box_scores[
            str(simulation_obj.lineup_2_uuids[0])
        ],
        lineup_2_player_2_box_score=lineup_2_player_box_scores[
            str(simulation_obj.lineup_2_uuids[1])
        ],
        lineup_2_player_3_box_score=lineup_2_player_box_scores[
            str(simulation_obj.lineup_2_uuids[2])
        ],
        lineup_2_player_4_box_score=lineup_2_player_box_scores[
            str(simulation_obj.lineup_2_uuids[3])
        ],
        lineup_2_player_5_box_score=lineup_2_player_box_scores[
            str(simulation_obj.lineup_2_uuids[4])
        ],
    )

    simulation_obj.status = simulator.models.Simulation.Status.FINISHED
    simulation_obj.save(update_fields=["status", "result", "updated_at"])

    simulator.utils.update_simulator_player_stats(
        simulator_client,
        player_uuids=[str(uuid) for uuid in simulation_obj.lineup_1_uuids]
        + [str(uuid) for uuid in simulation_obj.lineup_2_uuids],
    )

    if simulation_obj.game.contest.kind == game.models.Contest.Kind.HEAD_TO_HEAD:
        simulator.utils.update_team_stats(simulation_obj)

    simulator.models.PlayByPlay(
        simulation=simulation_obj,
        feed=_map_play_by_play(game_results_payload.get("pbp")),
    ).save()

    try:
        simulator.utils.insert_player_game_stats_entries(
            simulation_obj, game_results_payload
        )
    except Exception:
        LOGGER.exception(
            "Error updating player game stats %s %s",
            simulation_obj.id,
            simulation_obj.uuid,
        )

    try:
        simulator.utils.insert_team_game_stats_entries(
            simulation_obj, game_results_payload
        )
    except Exception:
        LOGGER.exception(
            "Error updating team game stats %s %s",
            simulation_obj.id,
            simulation_obj.uuid,
        )


@utils.db.mutex
def update_games():
    """Fetch pending game results from the simulator

    Note - this doesn't hit the simulator service yet. We will handle error checking
    once the simulator service is integrated.
    """
    MAX_RETRY = 5
    simulator_client = simulator.client.get()
    unfinished_or_errored = simulator.models.Simulation.objects.filter(
        models.Q(
            status__in=[
                simulator.models.Simulation.Status.PENDING,
                simulator.models.Simulation.Status.STARTED,
            ]
        )
        | models.Q(
            status=simulator.models.Simulation.Status.ERRORED,
            num_retries__lt=MAX_RETRY,
            next_retry_at__lte=timezone.now(),
        )
    ).order_by("-created_at")

    status_map = {
        "PENDING": simulator.models.Simulation.Status.PENDING,
        "STARTED": simulator.models.Simulation.Status.STARTED,
        "FINISHED": simulator.models.Simulation.Status.FINISHED,
    }

    for simulation_obj in unfinished_or_errored:
        try:
            result = simulator_client.retrieve_game(simulation_obj.uuid)
            status = status_map.get(result["status"])

            if status != simulation_obj.status:
                if status in (
                    simulator.models.Simulation.Status.PENDING,
                    simulator.models.Simulation.Status.STARTED,
                ):
                    simulation_obj.status = status
                    simulation_obj.save(update_fields=["updated_at", "status"])
                elif status == simulator.models.Simulation.Status.FINISHED:
                    finalize_game(simulator_client, simulation_obj, result["result"])

                    # Important to only communicate games
                    # that are not visible. Be extra careful about
                    # situations where we pre-simulate (eg tournaments)
                    if (
                        simulation_obj.game.contest.kind
                        == game.models.Contest.Kind.HEAD_TO_HEAD_MATCH_MAKE
                        or simulation_obj.game.contest.kind
                        == game.models.Contest.Kind.HEAD_TO_HEAD
                    ):
                        # Purposely swallowing this exception
                        # else it will get caught below and mess up the
                        # status of the game when it shouldn't
                        try:
                            comm.handlers.game_complete_handler(simulation_obj.game)
                        except Exception:
                            LOGGER.exception(
                                "Error with game_complete_handler",
                            )

                else:
                    raise AssertionError(
                        f"Unsupported status \"{result['status']}\" returned"
                        f" for game {simulation_obj.uuid}"
                    )
            elif timezone.now() - simulation_obj.created_at >= dt.timedelta(hours=8):
                simulation_obj.status = simulator.models.Simulation.Status.TIMED_OUT
                simulation_obj.save(update_fields=["updated_at", "status"])

        except Exception:
            LOGGER.exception(
                "Error updating simulation %s %s",
                simulation_obj.id,
                simulation_obj.uuid,
            )
            simulation_obj.num_retries += 1
            simulation_obj.status = simulator.models.Simulation.Status.ERRORED
            if simulation_obj.num_retries >= MAX_RETRY:
                simulation_obj.status = (
                    simulator.models.Simulation.Status.TERMINAL_ERROR
                )

            simulation_obj.next_retry_at = timezone.now() + dt.timedelta(
                minutes=(5 * simulation_obj.num_retries)
            )
            simulation_obj.error_msg = traceback.format_exc()
            simulation_obj.save(
                update_fields=[
                    "status",
                    "updated_at",
                    "num_retries",
                    "next_retry_at",
                    "error_msg",
                ]
            )
        finally:
            game_simulation_status_updated.send(
                "update_games",
                simulation_uuid=simulation_obj.uuid,
                status=simulation_obj.status,
            )


def sum_aggregate_box_score(aggregates, box_score):
    updated_aggregates = aggregates.copy()
    for key, value in aggregates.items():
        updated_aggregates[key] += getattr(box_score, key)
    return updated_aggregates


def is_winner(team_1, team_2):
    if team_1 > team_2:
        return True
    return False


@utils.db.mutex
def calculate_players_stats():
    simulator_client = simulator.client.get()
    uuids = [
        str(uuid)
        for uuid in simulator.models.Player.objects.all().values_list("uuid", flat=True)
    ]

    # split uuids within chunks
    chunks = [uuids[x : x + 100] for x in range(0, len(uuids), 100)]  # noqa: E203
    for chunk in chunks:
        simulator.utils.update_simulator_player_stats(
            simulator_client, player_uuids=chunk
        )


def build_player_game_stats():
    simulator_client = simulator.client.get()
    subquery = (
        simulator.models.PlayerGameStats.objects.filter(
            simulation_id=models.OuterRef("uuid")
        )
        .values("simulation_id")
        .annotate(simulation_id_count=models.Count("simulation_id"))
        .filter(simulation_id_count=10)
        .values("simulation_id")
    )
    simulations = (
        simulator.models.Simulation.objects.filter(
            status=simulator.models.Simulation.Status.FINISHED
        )
        .exclude(uuid__in=models.Subquery(subquery))
        .order_by("-created_at")
    )
    for simulation in simulations:
        game = simulator_client.retrieve_game(uuid=simulation.uuid)
        simulator.utils.insert_player_game_stats_entries(simulation, game["result"])


def build_team_game_stats():
    simulator_client = simulator.client.get()
    subquery = (
        simulator.models.TeamGameStats.objects.filter(
            simulation_id=models.OuterRef("uuid")
        )
        .values("simulation_id")
        .annotate(simulation_id_count=models.Count("simulation_id"))
        .filter(simulation_id_count=2)
        .values("simulation_id")
    )
    simulations = (
        simulator.models.Simulation.objects.filter(
            status=simulator.models.Simulation.Status.FINISHED
        )
        .exclude(uuid__in=models.Subquery(subquery))
        .select_related("game__lineup_1__team", "game__lineup_2__team")
        .order_by("-created_at")
    )
    for simulation in simulations:
        game = simulator_client.retrieve_game(uuid=simulation.uuid)
        simulator.utils.insert_team_game_stats_entries(simulation, game["result"])

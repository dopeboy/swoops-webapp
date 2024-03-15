from datetime import timedelta
from decimal import Decimal

import ddf
import pytest
from django.utils import timezone

import game.models
import game.tasks
import simulator.models
from conftest import (
    build_full_tournament_bracket,
    build_lineup,
    build_team,
    build_tournament,
    build_user_and_team,
)


@pytest.mark.django_db
def test_sync_game_players(settings):
    settings.SIMULATOR_CLIENT = "simulator.client.MockClient"

    game.tasks.sync_game_players()

    assert (
        simulator.models.Player.objects.filter(
            uuid="090bf6c9-f7b7-448f-8753-c484387e83c7"
        ).exists()
        is True
    )

    player = simulator.models.Player.objects.get(
        uuid="090bf6c9-f7b7-448f-8753-c484387e83c7"
    )

    sig_digits = Decimal("0.0000000001")
    assert player.three_pt_rating == Decimal(52.2837943457).quantize(sig_digits)

    assert player.full_name == "Will Slaprock"
    assert player.token == 500

    assert player.top_attribute_1 == "orb_rating"
    assert player.top_attribute_2 == "midrange_2pt_rating"

    assert player.position_1 == "C"
    assert player.position_2 == "F"

    assert player.hair == "MOHAWK_BLUE"


@pytest.mark.django_db
def test_update_tournament_two_of_three_series(client_user):
    tournament_meta = {"max_games_per_round": [3, 5], "payout_breakdown_usd": [4, 2]}

    contest, tournament = build_tournament(
        "Swoops Bowl",
        **{
            "payout": 100,
            "meta": tournament_meta,
            "kind": game.models.Tournament.Kind.END_OF_SEASON,
        }
    )
    my_round = ddf.G("game.Round", tournament=tournament, stage=0)

    team1 = build_team(client_user)
    _, team2 = build_user_and_team()
    entry_1 = ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=team1,
        seed=1,
        lineup=build_lineup(team1),
    )
    entry_2 = ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=team2,
        seed=2,
        lineup=build_lineup(team2),
    )
    series = ddf.G(
        "game.Series",
        **{
            "round": my_round,
            "entry_1": entry_1,
            "entry_2": entry_2,
            "status": game.models.Series.Status.STARTED,
        }
    )

    # No games have been added yet
    game.tasks.update_tournament_series()
    assert series.games.count() == 0

    my_game = ddf.G(
        "game.Game",
        contest=contest,
        simulation=ddf.G(
            "simulator.Simulation",
            status=simulator.models.Simulation.Status.STARTED,
            result=ddf.G(
                "simulator.Result",
                lineup_1_score=98,
                lineup_2_score=97,
                lineup_1_box_score=ddf.G("simulator.BoxScore", pts=98),
                lineup_2_box_score=ddf.G("simulator.BoxScore", pts=97),
            ),
        ),
    )
    series.games.add(my_game)

    # One game is in progess
    game.tasks.update_tournament_series()
    assert series.games.count() == 1

    my_game.simulation.status = simulator.models.Simulation.Status.FINISHED
    my_game.simulation.save()

    # One game is finished, another is added
    game.tasks.update_tournament_series()
    assert series.games.count() == 2

    # Check if games_started != games_finished; a new game should not be added
    game.tasks.update_tournament_series()
    assert series.games.count() == 2

    # Second game is won by the other team
    second_game = series.games.last()
    second_game.simulation.status = simulator.models.Simulation.Status.FINISHED
    second_game.simulation.result = ddf.G(
        "simulator.Result",
        lineup_1_score=97,
        lineup_2_score=98,
        lineup_1_box_score=ddf.G("simulator.BoxScore", pts=97),
        lineup_2_box_score=ddf.G("simulator.BoxScore", pts=98),
    )
    second_game.simulation.save()

    # Two games are finished with different teams winning, a new game is added
    game.tasks.update_tournament_series()
    assert series.games.count() == 3

    # Update third game results
    third_game = series.games.last()
    third_game.simulation.status = simulator.models.Simulation.Status.FINISHED
    third_game.simulation.result = ddf.G(
        "simulator.Result",
        lineup_1_score=97,
        lineup_2_score=98,
        lineup_1_box_score=ddf.G("simulator.BoxScore", pts=97),
        lineup_2_box_score=ddf.G("simulator.BoxScore", pts=98),
    )
    third_game.simulation.save()

    # Run the task again but no new game should be added as three games are finished
    # Series status should be finished now
    game.tasks.update_tournament_series()
    assert series.games.count() == 3
    assert (
        game.models.Series.objects.get(id=series.id).status
        == game.models.Series.Status.FINISHED
    )


@pytest.mark.django_db
def test_update_tournament_three_of_five_series(client_user):
    tournament_meta = {"max_games_per_round": [3, 5], "payout_breakdown_usd": [4, 2]}

    contest, tournament = build_tournament(
        "Swoops Bowl",
        **{
            "payout": 100,
            "meta": tournament_meta,
            "kind": game.models.Tournament.Kind.END_OF_SEASON,
        }
    )
    my_round = ddf.G("game.Round", tournament=tournament, stage=1)

    team1 = build_team(client_user)
    _, team2 = build_user_and_team()
    entry_1 = ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=team1,
        seed=1,
        lineup=build_lineup(team1),
    )
    entry_2 = ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=team2,
        seed=2,
        lineup=build_lineup(team2),
    )
    series = ddf.G(
        "game.Series",
        **{
            "round": my_round,
            "entry_1": entry_1,
            "entry_2": entry_2,
            "status": game.models.Series.Status.STARTED,
        }
    )

    # No games have been added yet
    game.tasks.update_tournament_series()
    assert series.games.count() == 0

    my_game = ddf.G(
        "game.Game",
        contest=contest,
        simulation=ddf.G(
            "simulator.Simulation",
            status=simulator.models.Simulation.Status.STARTED,
            result=ddf.G(
                "simulator.Result",
                lineup_1_score=98,
                lineup_2_score=97,
                lineup_1_box_score=ddf.G("simulator.BoxScore", pts=98),
                lineup_2_box_score=ddf.G("simulator.BoxScore", pts=97),
            ),
        ),
    )
    series.games.add(my_game)

    # One game is in progess
    game.tasks.update_tournament_series()
    assert series.games.count() == 1

    my_game.simulation.status = simulator.models.Simulation.Status.FINISHED
    my_game.simulation.save()

    # One game is finished, another is added
    game.tasks.update_tournament_series()
    assert series.games.count() == 2

    # Second game is won by the other team
    second_game = series.games.last()
    second_game.simulation.status = simulator.models.Simulation.Status.FINISHED
    second_game.simulation.result = ddf.G(
        "simulator.Result",
        lineup_1_score=97,
        lineup_2_score=98,
        lineup_1_box_score=ddf.G("simulator.BoxScore", pts=97),
        lineup_2_box_score=ddf.G("simulator.BoxScore", pts=98),
    )
    second_game.simulation.save()

    # Two games are finished with different teams winning, a new game is added
    game.tasks.update_tournament_series()
    assert series.games.count() == 3

    # Update third game results
    third_game = series.games.last()
    third_game.simulation.status = simulator.models.Simulation.Status.FINISHED
    third_game.simulation.result = ddf.G(
        "simulator.Result",
        lineup_1_score=97,
        lineup_2_score=98,
        lineup_1_box_score=ddf.G("simulator.BoxScore", pts=97),
        lineup_2_box_score=ddf.G("simulator.BoxScore", pts=98),
    )
    third_game.simulation.save()

    # Run the task again; a new game should be added as one of the teams
    # has not won at least three games (it's 3 of 5 series)
    game.tasks.update_tournament_series()
    assert series.games.count() == 4
    assert (
        game.models.Series.objects.get(id=series.id).status
        == game.models.Series.Status.STARTED
    )

    # Update fourth game results
    fourth_game = series.games.last()
    fourth_game.simulation.status = simulator.models.Simulation.Status.FINISHED
    fourth_game.simulation.result = ddf.G(
        "simulator.Result",
        lineup_1_score=97,
        lineup_2_score=98,
        lineup_1_box_score=ddf.G("simulator.BoxScore", pts=97),
        lineup_2_box_score=ddf.G("simulator.BoxScore", pts=98),
    )
    fourth_game.simulation.save()

    # Run the task again but no new game should be added as four games are finished
    # Series status should be finished now
    game.tasks.update_tournament_series()
    assert series.games.count() == 4
    assert (
        game.models.Series.objects.get(id=series.id).status
        == game.models.Series.Status.FINISHED
    )


@pytest.mark.django_db
def test_update_tournament_round(client_user):
    tournament = build_full_tournament_bracket("Swoops Bowl", max_rounds_completed=1)

    round_1 = game.models.Round.objects.get(tournament=tournament, stage=0)
    round_1.status = game.models.Round.Status.SIMULATING_GAMES
    round_1.save()

    game.tasks.update_tournament_rounds()

    assert (
        game.models.Round.objects.filter(
            status=game.models.Round.Status.FINISHED
        ).count()
        == 1
    )
    assert (
        game.models.Round.objects.filter(
            status=game.models.Round.Status.SIMULATING_GAMES
        ).count()
        == 1
    )

    round_2 = game.models.Round.objects.get(tournament=tournament, stage=1)
    assert (
        game.models.Series.objects.filter(
            round=round_2, status=game.models.Series.Status.STARTED
        ).count()
        == 1
    )

    series = game.models.Series.objects.filter(
        round=round_2, status=game.models.Series.Status.STARTED
    ).first()

    assert series.games.count() == 1

    # testing that an additional round will not activate
    # after the final round has completed
    series = game.models.Series.objects.all().update(
        status=game.models.Series.Status.FINISHED
    )

    game.models.Round.objects.filter(stage=1).update(
        status=game.models.Round.Status.FINISHED
    )

    game.models.Round.objects.filter(stage=2).update(
        status=game.models.Round.Status.SIMULATING_GAMES
    )

    game.tasks.update_tournament_rounds()


@pytest.mark.django_db
def test_init_in_season_tournament():
    # testing voiding a tournament
    now = timezone.now()
    tournament_size = 4
    _, tournament_1 = build_tournament(
        "In-Season Swoops 1",
        kind=game.models.Tournament.Kind.IN_SEASON,
        size=tournament_size,
        lineup_submission_cutoff=now - timedelta(minutes=5),
        meta={"rounds": 2, "series": [5, 7], "payout_breakdown_usd": [100]},
    )

    game.tasks.init_in_season_tournament()
    assert (
        game.models.Tournament.objects.get(id=tournament_1.id).contest.status
        == game.models.Contest.Status.VOIDED
    )

    # testing assigning seed and preparing tournament for simulation
    _, tournament_2 = build_tournament(
        "In-Season Swoops 2",
        kind=game.models.Tournament.Kind.IN_SEASON,
        size=tournament_size,
        lineup_submission_cutoff=now - timedelta(minutes=5),
        meta={"payout_breakdown_usd": [100]},
    )

    round = ddf.G(
        "game.Round",
        tournament=tournament_2,
        stage=1,
        status=game.models.Round.Status.STARTED,
    )

    ddf.G("game.Series", round=round)
    ddf.G("game.Series", round=round)

    for n in range(0, tournament_size):
        _, team = build_user_and_team()
        ddf.G(
            "game.TournamentEntry",
            team=team,
            tournament=tournament_2,
            lineup=build_lineup(team),
        )

    game.tasks.init_in_season_tournament()

    assert game.models.TournamentEntry.objects.filter(seed__gt=0).count() == 4

    assert game.models.Series.objects.filter(entry_1=None, entry_2=None).count() == 0
    assert game.models.Game.objects.all().count() == 2


@pytest.mark.django_db
def test_finalize_in_season_tournament():
    now = timezone.now()
    tournament = build_full_tournament_bracket(
        "In-Season Swoops 1",
        public_publish_datetime=now - timedelta(minutes=30),
        kind=game.models.Tournament.Kind.IN_SEASON,
    )

    tournament.contest.status = game.models.Contest.Status.COMPLETE
    tournament.contest.save()

    game.tasks.finalize_in_season_tournament()

    tournament = game.models.Tournament.objects.all().first()
    assert (
        game.models.Game.objects.filter(
            visibility=game.models.Game.Visibility.HIDDEN
        ).count()
        == 0
    )

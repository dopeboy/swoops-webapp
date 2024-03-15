import json
import urllib.parse
import uuid

import ddf
import pytest
from django import urls
from django.conf import settings
from django.core.exceptions import ValidationError as ValidationError
from django.utils import timezone

import game.models
import game.utils
import game.views
import moderation.models
import moderation.service
import simulator.models
from conftest import (
    NetworkException,
    build_full_tournament_bracket,
    build_game,
    build_game_reservation,
    build_lineup,
    build_player,
    build_player_and_owner,
    build_player_with_owner_who_doesnt_have_an_account,
    build_player_with_ownership,
    build_results,
    build_team,
    build_tournament,
    build_tournament_reservation,
    build_transfer,
    build_user_and_team,
    free_agent_token_id_generator,
    token_id_generator,
)
from simulator.client import Client


@pytest.mark.django_db
def test_player_list(authed_client):
    # insert mocking of serializer to replace functions that use the historical stats

    build_player(1)
    resp = authed_client.get(urls.reverse("api:game:player-list"))
    assert resp.status_code == 200

    assert len(resp.json()["results"]) == 1


@pytest.mark.django_db
def test_team_detail(authed_client, client_user):
    """
    Tests GET for game.views.TeamDetail
    """
    team = ddf.G("game.Team")
    team.owner = client_user
    team.save()

    resp = authed_client.get(
        urls.reverse("api:game:team-detail", kwargs={"id": team.id})
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == team.name


@pytest.mark.django_db
def test_name_team(authed_client, client_user, mocker):
    """
    Tests updates for game.views.TeamName
    """
    team = ddf.G("game.Team", name="")

    # You shouldn't be able to update the name of a team you don't own
    resp = authed_client.put(
        urls.reverse("api:game:team-name", kwargs={"id": team.id}),
        data=json.dumps({"name": "FAILING"}),
        content_type="application/json",
    )
    assert resp.status_code == 403

    # Add ownership and verify you can update it

    # update team name once
    team.owner = client_user
    team.save()
    resp = authed_client.put(
        urls.reverse("api:game:team-name", kwargs={"id": team.id}),
        data=json.dumps({"name": "HELLO"}),
        content_type="application/json",
    )
    assert resp.status_code == 202
    # the name doesn't change yet- it goes to the moderation process
    assert resp.data is None


@pytest.mark.django_db
def test_game_detail_happy_path(authed_client, client_user):
    # insert mocking of serializer to replace functions that use the historical stats

    client_team = build_team(client_user)
    game = build_game(lineup1=build_lineup(client_team))

    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game.id})
    )
    assert resp.status_code == 200

    assert resp.json()["lineup_1"]
    assert resp.json()["lineup_1"]["player_1"]["wins"] == 5
    assert resp.json()["lineup_2"] is None


@pytest.mark.django_db
def test_game_detail_completely_empty_game(authed_client):
    game = build_game()

    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game.id})
    )
    assert resp.status_code == 200
    assert resp.json()["lineup_1"] is None
    assert resp.json()["lineup_2"] is None


@pytest.mark.django_db
def test_game_detail_no_lineup_details_when_caller_not_involed_in_game(authed_client):
    # insert mocking of serializer to replace functions that use the historical stats

    _, team2 = build_user_and_team()
    game = build_game(lineup1=build_lineup(team2))

    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game.id})
    )

    # you dont get lineup results for a game you aren't involved in
    assert resp.status_code == 200
    # assert resp.json()["lineup_1"] is not None TODO FIX
    assert resp.json()["lineup_2"] is None


@pytest.mark.django_db
def test_game_detail_all_details_when_game_is_in_the_right_status(
    authed_client, client_user, mocker
):
    # insert mocking of serializer to replace functions that use the historical stats

    mocker.patch.object(Client, "create_game", return_value={"uuid": uuid.uuid4()})

    client_team = build_team(client_user)
    _, team2 = build_user_and_team()
    game_obj = build_game(
        game.models.Contest.Status.COMPLETE,
        lineup1=build_lineup(client_team),
        lineup2=build_lineup(team2),
    )

    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id})
    )

    # you dont get lineup results for a game you aren't involved in
    assert resp.status_code == 200
    assert resp.json()["lineup_1"] is not None
    assert resp.json()["lineup_2"] is not None


@pytest.mark.django_db
def test_game_detail_for_completed_game(authed_client, client_user, mocker):
    mocker.patch.object(Client, "create_game", return_value={"uuid": uuid.uuid4()})
    """
    Tests GET for game.views.GameDetail
    """
    _, team2 = build_user_and_team()
    _, team3 = build_user_and_team()

    # create a game that has been completed and check results
    game = ddf.G(
        "game.Game",
        lineup_1=ddf.F(team=team2),
        lineup_2=ddf.F(team=team3),
        simulation=ddf.G(
            "simulator.Simulation",
            result=ddf.G(
                "simulator.Result",
                lineup_1_score=98,
                lineup_2_score=97,
                lineup_1_box_score=ddf.G("simulator.BoxScore", pts=98),
                lineup_2_box_score=ddf.G("simulator.BoxScore", pts=97),
            ),
        ),
    )

    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game.id})
    )

    assert resp.status_code == 200

    # testing flattening of simulation results works
    assert resp.json().get("results", None) is not None
    assert len(resp.json()["results"]) > 0


def get_game_and_assert_number_of_records(
    authed_client, params, expected_num_records_returned
):
    resp = authed_client.get(
        urls.reverse("api:game:game") + f"?{ urllib.parse.urlencode(params) }"
    )
    assert resp.status_code == 200
    assert len(resp.json()["results"]) == expected_num_records_returned
    return resp


def games_lineup_and_reservations_testbed(team1, team2, team3):
    game_with_no_reservations = build_game()

    game_with_one_reservation = build_game()
    build_game_reservation(game_with_one_reservation, team1)

    game_with_two_reservations = build_game(game.models.Contest.Status.IN_PROGRESS)
    build_game_reservation(game_with_two_reservations, team1)
    build_game_reservation(game_with_two_reservations, team2)

    game_with_one_lineup_and_residual_reservation = build_game()
    game_with_one_lineup_and_residual_reservation.lineup_1 = build_lineup(team3)
    game_with_one_lineup_and_residual_reservation.save()
    build_game_reservation(game_with_one_lineup_and_residual_reservation, team3)

    game_with_one_lineup_and_one_residual_reservation_and_one_reservation = build_game()
    game_with_one_lineup_and_one_residual_reservation_and_one_reservation.lineup_1 = (
        build_lineup(team1)
    )
    game_with_one_lineup_and_one_residual_reservation_and_one_reservation.save()
    build_game_reservation(
        game_with_one_lineup_and_one_residual_reservation_and_one_reservation, team1
    )
    build_game_reservation(
        game_with_one_lineup_and_one_residual_reservation_and_one_reservation, team2
    )

    game_with_two_lineups_and_two_residual_reservations = build_game(
        game.models.Contest.Status.IN_PROGRESS
    )
    game_with_two_lineups_and_two_residual_reservations.lineup_1 = build_lineup(team1)
    build_game_reservation(game_with_two_lineups_and_two_residual_reservations, team1)
    game_with_two_lineups_and_two_residual_reservations.lineup_2 = build_lineup(team2)
    game_with_two_lineups_and_two_residual_reservations.save()
    build_game_reservation(game_with_two_lineups_and_two_residual_reservations, team2)

    game_with_no_lineups_and_one_deleted_reservation = build_game()
    build_game_reservation(
        game_with_no_lineups_and_one_deleted_reservation, team3, is_deleted=True
    )

    complete_game = build_game(game.models.Contest.Status.COMPLETE)
    complete_game.lineup_1 = build_lineup(team1)
    complete_game.lineup_2 = build_lineup(team2)
    complete_game.save()

    return (
        game_with_no_reservations,
        game_with_one_reservation,
        game_with_two_reservations,
        game_with_one_lineup_and_residual_reservation,
        game_with_one_lineup_and_one_residual_reservation_and_one_reservation,
        game_with_two_lineups_and_two_residual_reservations,
        game_with_no_lineups_and_one_deleted_reservation,
        complete_game,
    )


@pytest.mark.django_db
def test_game_list_all_open_games(authed_client):
    _, team1 = build_user_and_team()
    _, team2 = build_user_and_team()
    _, team3 = build_user_and_team()

    (
        game_with_no_reservations,
        game_with_one_reservation,
        game_with_two_reservations,
        game_with_one_lineup_and_residual_reservation,
        game_with_one_lineup_and_one_residual_reservation_and_one_reservation,
        game_with_two_lineups_and_two_residual_reservations,
        game_with_no_lineups_and_one_deleted_reservation,
        complete_game,
    ) = games_lineup_and_reservations_testbed(team1, team2, team3)

    resp = authed_client.get(urls.reverse("api:game:game"))
    results = resp.json()["results"]

    assert len(results) == 4
    assert sorted([r["id"] for r in results]) == sorted(
        [
            game_with_one_reservation.id,
            game_with_one_lineup_and_residual_reservation.id,
            game_with_no_lineups_and_one_deleted_reservation.id,
            game_with_no_reservations.id,
        ]
    )


@pytest.mark.django_db
def test_games_enabled(authed_client, settings):
    build_game()
    build_game()
    build_game(game.models.Contest.Status.COMPLETE)

    settings.GAMES_ENABLED = True
    resp = authed_client.get(urls.reverse("api:game:game"))
    assert len(resp.json()["results"]) == 2

    settings.GAMES_ENABLED = False
    resp = authed_client.get(urls.reverse("api:game:game"))

    assert len(resp.json()["results"]) == 0

    resp = authed_client.get(urls.reverse("api:game:game") + "?status=COMPLETE")
    assert len(resp.json()["results"]) == 1


@pytest.mark.django_db
def test_games_status(authed_client, settings):
    settings.GAMES_ENABLED = True
    resp = authed_client.get(urls.reverse("api:game:game-status"))
    assert resp.json()["enabled"] is True

    settings.GAMES_ENABLED = False
    resp = authed_client.get(urls.reverse("api:game:game-status"))
    assert resp.json()["enabled"] is False


@pytest.mark.django_db
def test_game_list_my_open_games(client_user, authed_client):
    _, team1 = build_user_and_team()
    _, team2 = build_user_and_team()
    team3 = build_team(client_user)

    (
        game_with_no_reservations,
        game_with_one_reservation,
        game_with_two_reservations,
        game_with_one_lineup_and_residual_reservation,
        game_with_one_lineup_and_one_residual_reservation_and_one_reservation,
        game_with_two_lineups_and_two_residual_reservations,
        game_with_no_lineups_and_one_deleted_reservation,
        complete_game,
    ) = games_lineup_and_reservations_testbed(team1, team2, team3)

    resp = authed_client.get(urls.reverse("api:game:game") + f"?team={team3.id}")
    results = resp.json()["results"]

    assert len(results) == 1
    assert [r["id"] for r in results] == [
        game_with_one_lineup_and_residual_reservation.id,
    ]


@pytest.mark.django_db
def test_game_list_by_complete_games(client_user, authed_client):
    _, team1 = build_user_and_team()
    _, team2 = build_user_and_team()
    _, team3 = build_user_and_team()

    (
        game_with_no_reservations,
        game_with_one_reservation,
        game_with_two_reservations,
        game_with_one_lineup_and_residual_reservation,
        game_with_one_lineup_and_one_residual_reservation_and_one_reservation,
        game_with_two_lineups_and_two_residual_reservations,
        game_with_no_lineups_and_one_deleted_reservation,
        complete_game,
    ) = games_lineup_and_reservations_testbed(team1, team2, team3)

    resp = authed_client.get(urls.reverse("api:game:game") + "?status=COMPLETE")
    results = resp.json()["results"]

    assert len(results) == 1
    assert [r["id"] for r in results] == [
        complete_game.id,
    ]

    assert results[0]["revealed"] is True


@pytest.mark.django_db
def test_game_list_by_my_complete_games(client_user, authed_client):
    _, team1 = build_user_and_team()
    team2 = build_team(client_user)
    _, team3 = build_user_and_team()

    (
        game_with_no_reservations,
        game_with_one_reservation,
        game_with_two_reservations,
        game_with_one_lineup_and_residual_reservation,
        game_with_one_lineup_and_one_residual_reservation_and_one_reservation,
        game_with_two_lineups_and_two_residual_reservations,
        game_with_no_lineups_and_one_deleted_reservation,
        complete_game,
    ) = games_lineup_and_reservations_testbed(team1, team2, team3)

    resp = authed_client.get(
        urls.reverse("api:game:game") + f"?team={team2.id}&status=COMPLETE"
    )

    results = resp.json()["results"]

    assert len(results) == 1
    assert [r["id"] for r in results] == [
        complete_game.id,
    ]


@pytest.mark.django_db
def test_game_list_by_unauthenticated_user_complete_games(client, client_user):
    _, team1 = build_user_and_team()
    team2 = build_team(client_user)
    _, team3 = build_user_and_team()

    (
        game_with_no_reservations,
        game_with_one_reservation,
        game_with_two_reservations,
        game_with_one_lineup_and_residual_reservation,
        game_with_one_lineup_and_one_residual_reservation_and_one_reservation,
        game_with_two_lineups_and_two_residual_reservations,
        game_with_no_lineups_and_one_deleted_reservation,
        complete_game,
    ) = games_lineup_and_reservations_testbed(team1, team2, team3)
    resp = client.get(
        urls.reverse("api:game:game") + f"?team={team2.id}&status=COMPLETE"
    )

    results = resp.json()["results"]

    assert len(results) == 1
    assert [r["id"] for r in results] == [
        complete_game.id,
    ]


@pytest.mark.django_db
def test_game_list_reservations_not_returned_when_corresponding_lineup_is_present(
    authed_client, client_user
):
    team = build_team(client_user)
    player = ddf.G("game.Player", team=team)
    lineup = ddf.G("game.Lineup", player_3=player, team=team)
    game_obj = ddf.G(
        "game.Game",
        contest=ddf.G("game.Contest", status=game.models.Contest.Status.OPEN),
        lineup_1=lineup,
    )
    ddf.G(
        "game.Reservation",
        team=player.team,
        game=game_obj,
        expires_at=timezone.now() + timezone.timedelta(weeks=5),
    )

    resp = authed_client.get(urls.reverse("api:game:game") + "?status=OPEN")
    assert len(resp.json()["results"]) == 1
    assert resp.json()["results"][0]["is_current_user_enrolled_with_lineup"] is True
    assert (
        resp.json()["results"][0]["is_current_user_enrolled_with_reservation"] is True
    )


@pytest.mark.django_db
def test_game_unable_to_search_for_teams_open_games_you_dont_own(
    client_user, authed_client
):
    build_team(client_user)
    _, team1 = build_user_and_team()
    build_game(lineup1=build_lineup(team1))

    resp = authed_client.get(
        urls.reverse("api:game:game") + f"?team={team1.id}&status=OPEN"
    )
    assert resp.status_code == 400


@pytest.mark.django_db
def test_game_available_reservations(authed_client):
    """tests for querying a game that has an available reservation"""

    player = ddf.G("game.Player", team=ddf.F())
    player_2 = ddf.G("game.Player", team=ddf.F())

    # game without any reservations
    ddf.G("game.Game")

    # game with simulation object
    ddf.G(
        "game.Game",
        lineup_1=ddf.F(player_3=player),
        lineup_2=ddf.F(player_3=player_2),
        simulation=ddf.G("simulator.Simulation"),
    )

    # test return reservations that are are available

    game_obj = ddf.G("game.Game")
    reservation_1 = ddf.G("game.Reservation", team=player.team, game=game_obj)
    reservation_1.expires_at = timezone.now() + timezone.timedelta(
        minutes=settings.RESERVATION_WINDOW_TIME_MIN
    )
    reservation_1.save()

    # 3 games,
    # 1 simulation object
    # 2 games should return

    get_game_and_assert_number_of_records(
        authed_client, {"is_reservation_available": True}, 2
    )

    # test return with a game that is fully reserved
    reservation_2 = ddf.G("game.Reservation", team=player_2.team, game=game_obj)
    reservation_2.expires_at = timezone.now() + timezone.timedelta(
        minutes=settings.RESERVATION_WINDOW_TIME_MIN
    )
    reservation_2.save()

    # 3 games
    # 1 game has a simulation object
    # 1 game fully booked with 2 reservations
    # 1 games will return
    get_game_and_assert_number_of_records(
        authed_client, {"is_reservation_available": True}, 1
    )

    # test return game with a reservation that has expired
    reservation_1.expires_at = timezone.now() - timezone.timedelta(
        minutes=settings.RESERVATION_WINDOW_TIME_MIN
    )
    reservation_1.save()

    # 3 games
    # 1 game has a simulation object
    # 1 active reservation, 1 expired reservation
    # 2 games reserved
    get_game_and_assert_number_of_records(
        authed_client, {"is_reservation_available": True}, 2
    )

    # test return game with a reservation that has expired
    reservation_2.expires_at = timezone.now() - timezone.timedelta(
        minutes=settings.RESERVATION_WINDOW_TIME_MIN
    )
    reservation_2.save()

    deleted_reservation = ddf.G(
        "game.Reservation",
        team=player_2.team,
        game=game_obj,
        deleted=True,
        expires_at=timezone.now()
        + timezone.timedelta(minutes=settings.RESERVATION_WINDOW_TIME_MIN + 1),
    )
    deleted_reservation.save()
    # 3 games
    # 1 game has a simulation object
    # 1 deleted reservation
    # 2 expired reservation
    # 2 games reserved
    get_game_and_assert_number_of_records(
        authed_client, {"is_reservation_available": True}, 2
    )


@pytest.mark.django_db
def test_reservation_delete(authed_client, client_user):
    game = ddf.G("game.Game")
    team = ddf.G("game.Team", owner=client_user)
    reservation = ddf.G(
        "game.Reservation",
        team=team,
        game=game,
        expires_at=timezone.now()
        + timezone.timedelta(minutes=settings.RESERVATION_WINDOW_TIME_MIN + 1),
    )

    resp = authed_client.delete(
        urls.reverse(
            "api:game:game-reservation-detail",
            kwargs={"game_id": game.id, "reservation_id": reservation.id},
        )
    )
    assert resp.status_code == 204


@pytest.mark.django_db
def test_reservation_delete_twice(authed_client, client_user):
    game = ddf.G("game.Game")
    team = ddf.G("game.Team", owner=client_user)
    reservation = ddf.G(
        "game.Reservation",
        team=team,
        game=game,
        expires_at=timezone.now()
        + timezone.timedelta(minutes=settings.RESERVATION_WINDOW_TIME_MIN + 1),
    )

    resp = authed_client.delete(
        urls.reverse(
            "api:game:game-reservation-detail",
            kwargs={"game_id": game.id, "reservation_id": reservation.id},
        )
    )
    assert resp.status_code == 204

    resp = authed_client.delete(
        urls.reverse(
            "api:game:game-reservation-detail",
            kwargs={"game_id": game.id, "reservation_id": reservation.id},
        )
    )

    assert resp.status_code == 404


@pytest.mark.django_db
def test_reservation_created_twice(authed_client, client_user):
    team = build_team(client_user)
    build_player_with_ownership(7778, team)

    game_obj = build_game()

    build_game_reservation(game_obj, team, expired=False)

    resp = authed_client.post(
        urls.reverse(
            "api:game:game-reservation",
            kwargs={"id": game_obj.id},
        )
    )
    assert resp.status_code == 400


@pytest.mark.django_db
def test_reservation_created_a_second_time_after_first_expires(
    authed_client, client_user
):
    team = build_team(client_user)
    build_player_with_ownership(7778, team)

    game_obj = build_game()

    build_game_reservation(game_obj, team, expired=True)

    resp = authed_client.post(
        urls.reverse(
            "api:game:game-reservation",
            kwargs={"id": game_obj.id},
        )
    )
    assert resp.status_code == 202


@pytest.mark.django_db
def test_reservation_created_a_second_time_after_first_deleted(
    authed_client, client_user
):
    team = build_team(client_user)
    build_player_with_ownership(7778, team)

    game_obj = build_game()

    build_game_reservation(game_obj, team, is_deleted=True)

    resp = authed_client.post(
        urls.reverse(
            "api:game:game-reservation",
            kwargs={"id": game_obj.id},
        )
    )
    assert resp.status_code == 201


@pytest.mark.django_db
def test_player(client, settings, authed_client, django_assert_num_queries):
    """
    Tests GET for game.views.Player
    """
    team = ddf.G("game.Team")

    players = [
        ddf.G(
            "game.Player",
            simulated=ddf.F(token=1, position_1="C"),
            team=team,
        ),
        ddf.G(
            "game.Player",
            simulated=ddf.F(token=2, position_1="G"),
            team=team,
        ),
        ddf.G(
            "game.Player",
            simulated=ddf.F(token=3, position_1="F", position_2="G"),
            team=team,
        ),
        ddf.G(
            "game.Player",
            simulated=ddf.F(token=-10, position_1="F", position_2="G"),
        ),
        ddf.G(
            "game.Player",
            simulated=ddf.F(token=-11, position_1="C", position_2="G"),
        ),
    ]

    # Verify filtering by free agents works
    resp = authed_client.get(urls.reverse("api:game:freeagents"))

    assert resp.status_code == 200
    assert len(resp.json()["results"]) == 2
    assert [r["token"] for r in resp.json()["results"]] == [
        players[4].simulated.token,
        players[3].simulated.token,
    ]

    # verify filter player by position works
    resp = authed_client.get(urls.reverse("api:game:freeagents") + "?positions=G,F")
    assert resp.status_code == 200
    assert len(resp.json()["results"]) == 2

    resp = authed_client.get(urls.reverse("api:game:freeagents") + "?positions=C")
    assert resp.status_code == 200
    assert len(resp.json()["results"]) == 1

    # check one player positions field
    assert resp.json()["results"][0]["positions"] == ["C", "G"]

    # verify that free agents that are not
    # playable don't output from the Free agent request
    ddf.G(
        "game.Player",
        simulated=ddf.F(token=-22, position_1="C", position_2="G", is_playable=False),
    )
    resp = authed_client.get(urls.reverse("api:game:freeagents"))
    assert len(resp.json()["results"]) == 2


@pytest.mark.django_db
def test_player_detail(authed_client, settings):
    """
    Tests GET for game.views.PlayerDetail
    """
    ddf.G("game.Team")

    player = ddf.G("game.Player", simulated=ddf.F(token=1))

    resp = authed_client.get(
        urls.reverse("api:game:player-detail", kwargs={"id": player.id})
    )

    assert resp.status_code == 200
    assert resp.json()["id"] == player.id
    assert resp.json()["full_name"] == player.simulated.full_name
    assert resp.json()["token"] == 1


@pytest.mark.django_db
def test_reserve_game(client, authed_client, client_user):
    client_user.is_verified = False
    client_user.save()
    team = build_team(client_user)

    game_obj = ddf.G("game.Game")

    # check user that doesn't own a player
    resp = authed_client.post(
        urls.reverse("api:game:game-reservation", kwargs={"id": game_obj.id})
    )

    assert resp.status_code == 403
    assert resp.json()["detail"] == "Must own at least one player."

    build_player_with_ownership(1, team)

    # check user doesn't have email verified
    resp = authed_client.post(
        urls.reverse("api:game:game-reservation", kwargs={"id": game_obj.id})
    )

    assert resp.status_code == 403
    assert resp.json()["detail"] == "Email must be verified."

    client_user.is_verified = True
    client_user.save()

    # test a single user team reserves a game within the first slot

    resp = authed_client.post(
        urls.reverse("api:game:game-reservation", kwargs={"id": game_obj.id})
    )

    assert resp.status_code == 201

    assert resp.json()["team"]["id"] == team.id
    assert resp.json()["game"] == game_obj.id

    # test reservation is full by creating two
    # additional users who want to reserve a game

    user_2, team_2, _ = build_player_and_owner(token_id=2)

    client.force_login(user_2)

    resp = client.post(
        urls.reverse("api:game:game-reservation", kwargs={"id": game_obj.id})
    )
    assert resp.status_code == 201
    assert resp.json()["team"]["id"] == team_2.id

    user_3, team_3, _ = build_player_and_owner(token_id=3)

    client.force_login(user_3)

    resp = client.post(
        urls.reverse("api:game:game-reservation", kwargs={"id": game_obj.id})
    )

    assert resp.status_code == 400
    assert resp.json()[0] == "Game is fully reserved."

    # test team with expiration has passed, and a new team submits a reservation
    reservation = game.models.Reservation.objects.get(game=game_obj, team=team)
    reservation.expires_at -= timezone.timedelta(
        minutes=settings.RESERVATION_WINDOW_TIME_MIN * 2
    )
    reservation.save()

    client.force_login(user_3)

    resp = client.post(
        urls.reverse("api:game:game-reservation", kwargs={"id": game_obj.id})
    )
    assert resp.status_code == 201
    assert resp.json()["team"]["id"] == team_3.id
    assert resp.json()["game"] == game_obj.id


def build_enrollment_payload(players):
    return {
        "player_1": players[0].id,
        "player_2": players[1].id,
        "player_3": players[2].id,
        "player_4": players[3].id,
        "player_5": players[4].id,
    }


guard = simulator.models.PlayerPosition.GUARD
forward = simulator.models.PlayerPosition.FORWARD
center = simulator.models.PlayerPosition.CENTER


def build_free_agents(positions=[]):
    return [
        build_player(next(free_agent_token_id_generator), position1=position)
        for position in positions
    ]


@pytest.mark.django_db
def test_create_lineup_user_authorization(client_user, authed_client):
    client_user.is_verified = False
    client_user.save()

    team = build_team(client_user)
    game_obj = build_game()
    player_token = 333
    players = [build_player(player_token)] + build_free_agents(
        [guard, forward, forward, center]
    )

    resp = authed_client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(players),
        content_type="application/json",
    )

    assert resp.status_code == 403
    assert resp.json()["detail"] == "Must own at least one player."

    for player in players:
        player.team = team
        player.save()

    build_transfer(token_id=player_token, to_address=client_user.wallet_address)

    resp = authed_client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(players),
        content_type="application/json",
    )

    assert resp.status_code == 403
    assert resp.json()["detail"] == "Email must be verified."


@pytest.mark.django_db
def test_user_submits_owned_player_to_both_lineups(
    client,
    client_user,
    authed_client,
):
    # test 1 both team lineups have at least one player that is the same
    client_user.save()

    team = build_team(client_user)
    game_obj = build_game()
    player_token = 444

    player = build_player(player_token, position1=simulator.models.PlayerPosition.GUARD)
    build_transfer(to_address=client_user.wallet_address, token_id=player_token)

    player.team = team
    player.save()

    players_1 = [player] + build_free_agents([guard, forward, forward, center])
    lineup_1 = build_lineup(team, players_1)
    game_obj.lineup_1 = lineup_1
    game_obj.revealed_to_user_1 = False
    game_obj.save()

    build_game_reservation(game_obj, team)

    lineup_2 = [player] + build_free_agents([guard, forward, forward, center])

    resp = authed_client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(lineup_2),
        content_type="application/json",
    )
    assert resp.status_code == 400
    assert resp.json()[0] == f"Team {team.id} cannot submit lineup to itself."

    # test 2 both team lineups have different players
    user_2, team_2 = build_user_and_team()
    player_token = 333
    player_2 = build_player(
        player_token, position1=simulator.models.PlayerPosition.GUARD
    )
    build_transfer(to_address=user_2.wallet_address, token_id=player_token)
    build_game_reservation(game_obj, team_2)

    player_2.team = team_2
    player_2.save()
    lineup_3 = [player_2] + build_free_agents([guard, forward, forward, center])

    client.force_login(user_2)
    resp = client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(lineup_3),
        content_type="application/json",
    )

    assert resp.status_code == 201

    assert resp.json()["reveal"] is False


@pytest.mark.django_db
def test_create_lineup_corresponding_reservation_is_expired(client_user, authed_client):
    client_user.is_verified = True
    client_user.save()

    team = build_team(client_user)
    game_obj = build_game()

    players1 = [build_player_with_ownership(333, team)] + build_free_agents(
        [guard, forward, forward, center]
    )

    # test reservation has expired, user tries to submit lineup
    build_game_reservation(game_obj, team, expired=True)

    resp = authed_client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(players1),
        content_type="application/json",
    )

    assert resp.json()[0] == "Team Reservation has expired."
    assert resp.status_code == 400


@pytest.mark.django_db
def test_create_lineup_two_lineups_submitted_successfully(
    client_user, authed_client, client
):
    client_user.is_verified = True
    client_user.save()

    team = build_team(client_user)
    player1_token = 333
    players1 = [
        build_player_with_ownership(
            player1_token, team, position1=simulator.models.PlayerPosition.GUARD
        )
    ] + build_free_agents([guard, forward, forward, center])

    user_2, team_2 = build_user_and_team()
    player2_token = 335
    players2 = [
        build_player_with_ownership(
            player2_token, team_2, position1=simulator.models.PlayerPosition.GUARD
        )
    ] + build_free_agents([guard, forward, forward, center])

    game_obj = build_game()
    build_game_reservation(game_obj, team)

    build_game_reservation(game_obj, team_2)

    resp = authed_client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(players1),
        content_type="application/json",
    )

    assert resp.status_code == 201
    # test that there is one lineup
    assert resp.json()["lineup_1"]["team"]["id"] == team.id
    assert resp.json()["lineup_2"] is None

    client.force_login(user_2)

    resp = authed_client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(players2),
        content_type="application/json",
    )

    assert resp.status_code == 201
    # when both lineups are filled, we can then see that both lineups are there
    assert resp.json()["contest"]["status"] == game.models.Contest.Status.IN_PROGRESS
    assert resp.json()["lineup_1"]["team"]["id"] == team.id
    assert resp.json()["lineup_2"]["team"]["id"] == team_2.id


@pytest.mark.django_db
def test_token_gating_requirement_for_a_team_that_submits_a_lineup(
    client, authed_client, client_user
):
    client_user.is_verified = True
    client_user.save()

    team = build_team(client_user)
    tokens_required = 2
    game_obj = build_game(tokens_required=tokens_required)
    build_game_reservation(game_obj, team)

    # team lineup failed to meet token gating requirement
    player1_token = 333
    lineup_1 = [
        build_player_with_ownership(
            player1_token, team, position1=simulator.models.PlayerPosition.GUARD
        )
    ] + build_free_agents([guard, forward, forward, center])

    resp = authed_client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(lineup_1),
        content_type="application/json",
    )

    assert resp.status_code == 201

    # team lineup pass to meet token gating requirement
    user_2, team_2 = build_user_and_team()
    build_game_reservation(game_obj, team_2)
    player2_token = 334
    player3_token = 335
    player4_token = 336
    lineup_2 = [
        build_player_with_ownership(
            player2_token, team_2, position1=simulator.models.PlayerPosition.GUARD
        ),
        build_player_with_ownership(
            player3_token, team_2, position1=simulator.models.PlayerPosition.GUARD
        ),
        build_player_with_ownership(
            player4_token, team_2, position1=simulator.models.PlayerPosition.FORWARD
        ),
    ] + build_free_agents([forward, center])

    client.force_login(user_2)
    resp = client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(lineup_2),
        content_type="application/json",
    )

    assert resp.status_code == 400
    assert (
        resp.json()[0]
        == f"Team must submit atleast {tokens_required} swoopsters to enter this game."
    )


@pytest.mark.django_db
def test_create_lineup_user_submits_player_they_dont_own(client_user, authed_client):
    client_user.is_verified = True
    client_user.save()

    team = build_team(client_user)
    game_obj = build_game()

    not_owned_player = build_player(334)
    players1 = [
        build_player_with_ownership(333, team),
        not_owned_player,
    ] + build_free_agents([forward, forward, center])

    build_game_reservation(game_obj, team)

    resp = authed_client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(players1),
        content_type="application/json",
    )

    assert resp.status_code == 400
    assert (
        resp.json()[0]
        == f"Player token={not_owned_player.id} is not owned by team={team.id}"
    )


@pytest.mark.django_db
def test_roster(authed_client):
    """
    Tests GET for game.views.TeamRoster
    """
    # team/user has a single player with correct linkage
    _, team_1, game_player = build_player_and_owner(token_id=9)

    # player for another team
    build_player_and_owner(token_id=10)

    # a random player with no team owner
    build_player_with_owner_who_doesnt_have_an_account(11)

    resp = authed_client.get(
        urls.reverse("api:game:team-roster", kwargs={"team_id": team_1.id})
    )

    assert resp.status_code == 200
    assert len(resp.json()["results"]) == 1
    assert [r["token"] for r in resp.json()["results"]] == [game_player.simulated.token]


@pytest.mark.django_db
def test_get_player_by_tokenid(authed_client):
    player_sought = ddf.G(
        "game.Player",
        simulated=ddf.F(token=777, position_1="C"),
    )

    [
        ddf.G("game.Player", simulated=ddf.F(token=2, position_1="G", position_2="F")),
        ddf.G(
            "game.Player",
            simulated=ddf.F(token=3, position_1="F", position_2="G"),
        ),
    ]

    resp = authed_client.get(
        urls.reverse("api:game:player-detail-by-token", kwargs={"token_id": 777})
    )

    assert resp.status_code == 200
    assert resp.json()["id"] == player_sought.id
    assert resp.json()["token"] == player_sought.simulated.token == 777


@pytest.mark.django_db
def test_create_change_player_name_request(client, authed_client, client_user, mocker):
    team = ddf.G("game.Team")
    team.owner = client_user
    team.save()

    token_id = 1
    player = ddf.G(
        "game.Player",
        simulated=ddf.F(token=token_id, position_1="C"),
        team=team,
    )

    # test a name request cannot be submitted without the user owning the player
    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name", kwargs={"token_id": token_id}
        ),
        data={"name": "Harry Holmes"},
    )

    assert resp.status_code == 400

    build_transfer(to_address=client_user.wallet_address, token_id=token_id)

    # test request without player name
    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name", kwargs={"token_id": token_id}
        )
    )
    assert resp.status_code == 400

    # contains numbers
    name = "Harry 123"
    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": name},
    )
    assert resp.status_code == 400

    assert resp.json()["non_field_errors"][
        0
    ] == "{} must only contain english, uppercase alphabet characters.".format(name)

    # contains special characters and numbers
    name = "Harry ?&#$%"
    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": name},
    )
    assert resp.status_code == 400
    assert resp.json()["non_field_errors"][
        0
    ] == "{} must only contain english, uppercase alphabet characters.".format(name)

    # check input name less less or equal to 2 characters
    name = "H"
    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": name},
    )
    assert resp.status_code == 400
    assert resp.json()["non_field_errors"][
        0
    ] == "{} character length must be greater than 2.".format(name)

    # check input name less greater than 20 characters
    name = "H" * 21
    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": name},
    )
    assert resp.status_code == 400
    assert resp.json()["non_field_errors"][
        0
    ] == "{} character length must be less than or equal to 16.".format(name)

    # contains extra spaces
    name = "HARRY  HOLMES"
    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": name},
    )
    assert resp.status_code == 400
    assert resp.json()["non_field_errors"][
        0
    ] == "{} must not have consecutive spaces.".format(name)

    # test with submitting a request for a player name that already exist
    ddf.G(
        "game.Player",
        simulated=ddf.F(token=2, position_1="C", full_name="SICKESTIN THEGAME"),
        team=team,
    )

    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": "SICKESTIN THEGAME"},
    )

    assert resp.status_code == 400
    assert resp.json()["name"][0] == "Player name must be unique."

    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": "HARRY HOLMES"},
    )

    assert resp.status_code == 201
    assert resp.json()["name"] == "HARRY HOLMES"
    assert resp.json()["status"] == moderation.models.Status.PENDING.value

    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": "HARRY NOLMES"},
    )
    assert resp.status_code == 400
    resp.json()["name"][
        0
    ] == "Player name cannot be changed, name is pending to be approved."

    moderation.models.PlayerNameChangeRequest.objects.filter(
        name="HARRY HOLMES",
        player=player,
    ).update(status=moderation.models.Status.ACCEPTED)

    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": "HARRY BRO"},
    )

    assert resp.status_code == 400
    assert (
        resp.json()["name"][0]
        == "Player name cannot be created, name has already been approved."
    )

    # test case when the status has changed to cancelled, retrieving player status
    moderation.models.PlayerNameChangeRequest.objects.all().update(
        status=moderation.models.Status.CANCELED
    )

    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": "HARRY BRO"},
    )
    assert resp.status_code == 201
    assert resp.json()["name"] == "HARRY BRO"

    # test case when the status has changed to rejected, retrieving player status
    moderation.models.PlayerNameChangeRequest.objects.filter(
        status=moderation.models.Status.PENDING
    ).update(status=moderation.models.Status.REJECTED)

    resp = authed_client.post(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
        data={"name": "ADAM AVOCADO"},
    )
    assert resp.status_code == 201
    assert resp.json()["name"] == "ADAM AVOCADO"


@pytest.mark.django_db
def test_retrieve_change_player_name_status(authed_client, client_user):
    team = ddf.G("game.Team")
    team.owner = client_user
    team.save()

    token_id = 1

    player = ddf.G(
        "game.Player",
        simulated=ddf.F(token=token_id, position_1="C"),
        team=team,
    )

    # test case when retrieving a player name, but request haven't been submitted
    resp = authed_client.get(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
    )

    assert resp.status_code == 400

    # create player name change request in pending state
    ddf.G(
        "moderation.PlayerNameChangeRequest",
        player=player,
        requesting_user=client_user,
        status=moderation.models.Status.PENDING,
    )

    resp = authed_client.get(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
    )

    assert resp.status_code == 200
    assert resp.json()["status"] == moderation.models.Status.PENDING.value


@pytest.mark.django_db
def test_cancel_change_player_name_request(authed_client, client_user):
    team = build_team(client_user)

    token_id = 1
    player = build_player(token_id)

    ddf.G(
        "moderation.PlayerNameChangeRequest",
        player=player,
        name="HARRY NOLMES",
    )

    # test when the user doesn't own the player
    resp = authed_client.delete(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
    )
    assert resp.status_code == 400

    build_transfer(to_address=client_user.wallet_address, token_id=token_id)
    player.team = team
    player.save()

    resp = authed_client.delete(
        urls.reverse(
            "api:game:player-detail-by-token-name",
            kwargs={"token_id": token_id},
        ),
    )
    assert resp.status_code == 200

    assert resp.json()["status"] == moderation.models.Status.CANCELED
    assert resp.json()["name"] == "HARRY NOLMES"


@pytest.mark.django_db
def test_end_to_end_team_name_change_approval(client_user, authed_client, mocker):
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")

    team = ddf.G("game.Team")

    team.owner = client_user
    team.save()

    resp = authed_client.put(
        urls.reverse("api:game:team-name", kwargs={"id": team.id}),
        data=json.dumps({"name": "HELLO"}),
        content_type="application/json",
    )
    assert resp.status_code == 202

    # TODO this feels like a bad way to do this. game does not depend on moderation
    # and it never should. But, to force the process forward, we need to
    # change the status on the name change request.
    resp = authed_client.get(
        urls.reverse(
            "api:moderation:team-name-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.json()["name"] == "HELLO"
    assert resp.json()["status"] == moderation.models.Status.PENDING

    request = moderation.models.TeamNameChangeRequest.objects.filter(
        status__exact=moderation.models.Status.PENDING, team_id=team.id
    ).get()

    # this is equivilent to setting the request to accepted via the admin panel
    request.status = moderation.models.Status.ACCEPTED
    request.save(update_fields=["status"])

    updated_team = game.models.Team.objects.get(pk=team.id)
    assert updated_team.name == "HELLO"

    resp = authed_client.get(
        urls.reverse(
            "api:moderation:team-name-moderation", kwargs={"team_id": team.id}
        ),
        content_type="application/json",
    )

    assert resp.json()["name"] == "HELLO"
    assert resp.json()["status"] == moderation.models.Status.ACCEPTED
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
def test_team_logo_change(authed_client, client_user, mocker):
    """
    Tests updates for game.views.TeamLogo
    """
    team = ddf.G("game.Team", name="")

    # You shouldn't be able to update the logo of a team you don't own
    resp = authed_client.put(
        urls.reverse("api:game:team-logo", kwargs={"id": team.id}),
        data=json.dumps({"path": "/images/96.png"}),
        content_type="application/json",
    )
    assert resp.status_code == 403

    # Add ownership and verify you can update it

    team.owner = client_user
    team.save()
    resp = authed_client.put(
        urls.reverse("api:game:team-logo", kwargs={"id": team.id}),
        data=json.dumps({"path": "/images/96.png"}),
        content_type="application/json",
    )
    assert resp.status_code == 202
    assert resp.data is None


@pytest.mark.django_db
def test_end_to_end_team_logo_change_approval(client_user, authed_client):
    with pytest.raises(NetworkException):
        team = ddf.G("game.Team")

        team.owner = client_user
        team.save()

        resp = authed_client.put(
            urls.reverse("api:game:team-logo", kwargs={"id": team.id}),
            data=json.dumps({"path": "http://google.com"}),
            content_type="application/json",
        )
        assert resp.status_code == 202

        # TODO this feels like a bad way to do this. game does not depend on moderation
        # and it never should. But, to force the process forward, we need to
        # change the status on the name change request.
        resp = authed_client.get(
            urls.reverse(
                "api:moderation:team-logo-moderation", kwargs={"team_id": team.id}
            ),
            content_type="application/json",
        )

        assert resp.json()["path"] == "http://google.com"
        assert resp.json()["status"] == moderation.models.Status.PENDING

        request = moderation.models.TeamLogoChangeRequest.objects.filter(
            status__exact=moderation.models.Status.PENDING, team_id=team.id
        ).get()

        # this is equivilent to setting the request to accepted via the admin panel
        request.status = moderation.models.Status.ACCEPTED
        request.save(update_fields=["status"])

        updated_team = game.models.Team.objects.get(pk=team.id)
        assert updated_team.path == "http://google.com"

        resp = authed_client.get(
            urls.reverse(
                "api:moderation:team-logo-moderation", kwargs={"team_id": team.id}
            ),
            content_type="application/json",
        )

        assert resp.json()["path"] == "http://google.com"
        assert resp.json()["status"] == moderation.models.Status.ACCEPTED


def test_logo_upload_no_logo_yet(mocker, s3_client, settings):
    settings.S3_HELPER = "services.s3_helper.S3Helper"

    mocker.patch.object(
        moderation.service.ModerationService,
        "validate_no_open_or_accepted_team_logo_change_requests",
        return_value=None,
    )
    user_id = 787
    x = game.views.TeamLogoUpload().post(request=None, id=user_id)
    assert x.data["fields"]["key"].replace("__tmp__/", "").startswith(str(user_id))


@pytest.mark.django_db
def test_game_player_list(authed_client, client_user):
    team1 = build_team(client_user)
    players1 = [
        build_player_with_ownership(next(token_id_generator), team1) for _ in range(5)
    ]

    (
        _,
        team2,
    ) = build_user_and_team()
    players2 = [
        build_player_with_ownership(next(token_id_generator), team2) for _ in range(5)
    ]

    (
        _,
        team3,
    ) = build_user_and_team()
    players3 = [
        build_player_with_ownership(next(token_id_generator), team3) for _ in range(5)
    ]

    one_vs_two = build_game(
        lineup1=build_lineup(team1, players1), lineup2=build_lineup(team2, players2)
    )
    build_results(one_vs_two)

    one_vs_three = build_game(
        lineup1=build_lineup(team1, players1), lineup2=build_lineup(team3, players3)
    )
    build_results(one_vs_three)

    two_vs_three = build_game(
        lineup1=build_lineup(team3, players3), lineup2=build_lineup(team2, players2)
    )
    build_results(two_vs_three)

    other_player = build_player(next(token_id_generator))

    resp = authed_client.get(
        urls.reverse(
            "api:game:player-games", kwargs={"token_id": players1[0].simulated.token}
        ),
        content_type="application/json",
    )

    # a player on player1's roster only shows up in the 2 games they played in
    assert len(resp.json()) == 2
    assert resp.json()[0]["id"] == one_vs_two.id
    assert resp.json()[1]["id"] == one_vs_three.id

    resp = authed_client.get(
        urls.reverse(
            "api:game:player-games", kwargs={"token_id": other_player.simulated.token}
        ),
        content_type="application/json",
    )
    # a player with no games, has no results
    assert len(resp.json()) == 0


@pytest.mark.django_db
def test_game_player_list_player_appears_in_lineup_and_slot(authed_client, client_user):
    team1 = build_team(client_user)
    players1 = [
        build_player_with_ownership(next(token_id_generator), team1) for _ in range(5)
    ]

    (
        _,
        team2,
    ) = build_user_and_team()
    players2 = [
        build_player_with_ownership(next(token_id_generator), team2) for _ in range(5)
    ]

    g = build_game(
        lineup1=build_lineup(team1, players1), lineup2=build_lineup(team2, players2)
    )
    build_results(g)

    resp = authed_client.get(
        urls.reverse(
            "api:game:player-games", kwargs={"token_id": players2[4].simulated.token}
        ),
        content_type="application/json",
    )

    resp.json()[0]["player_lineup_number"] == 2
    resp.json()[0]["player_slot_number"] == 5


@pytest.mark.django_db
def test_team_leaderboard(authed_client):
    resp = authed_client.get(urls.reverse("api:game:team-leaderboard"))

    assert resp.status_code == 200

    # 4 teams, 4 results
    assert len(resp.json()) == 1

    # team 1
    assert resp.json()[0]["name"] == "Swoopster 5 is Alive"
    assert resp.json()[0]["l10_wins"] == 2
    assert resp.json()[0]["l10_losses"] == 0
    assert resp.json()[0]["streak"] == "W2"
    assert resp.json()[0]["ppg"] == "{:.{prec}f}".format(3.4, prec=3)
    assert resp.json()[0]["opp_ppg"] == "{:.{prec}f}".format(2.2, prec=3)
    assert resp.json()[0]["wins"] == 5
    assert resp.json()[0]["losses"] == 1


@pytest.mark.django_db
def test_player_leaderboard(authed_client):
    ddf.G(
        "game.Player",
        wins=4,
        losses=2,
        opensea_price_usd=0.6,
        simulated=ddf.F(token=1, position_1="F", position_2="G", g=6),
    )

    ddf.G(
        "game.Player",
        wins=4,
        losses=2,
        opensea_price_usd=0.8,
        simulated=ddf.F(token=-1, position_1="F", position_2="G", g=6),
    )

    resp = authed_client.get(urls.reverse("api:game:player-leaderboard"))
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    assert resp.json()[0]["wins"] == 4
    assert resp.json()[0]["losses"] == 2
    assert round(resp.json()[0]["percentage_wins"], 2) == 66.67
    assert round(resp.json()[0]["percentage_losses"], 2) == 33.33


@pytest.mark.django_db
def test_reveal_game_score(client, client_user, authed_client):
    # build team one
    client_team = build_team(client_user)

    # build user team 2
    user_2, team_2 = build_user_and_team()

    # game 1
    game_obj = build_game(
        lineup1=build_lineup(client_team), lineup2=build_lineup(team_2)
    )

    game_obj.revealed_to_user_1 = False
    game_obj.revealed_to_user_2 = False
    game_obj.save()

    # check user 1 reveal as false
    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id}),
    )
    assert resp.json()["reveal"] is False

    # check user 2 reveal as false
    client.force_login(user_2)
    resp = client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id}),
    )
    assert resp.json()["reveal"] is False

    # update game endpoint for user 1
    client.force_login(client_user)
    resp = client.patch(
        urls.reverse("api:game:game"),
        data=json.dumps([{"id": game_obj.id}]),
        content_type="application/json",
    )

    # check updated reveal value
    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id}),
    )
    assert resp.json()["reveal"] is True

    # check user 2 reveal flag
    client.force_login(user_2)
    resp = client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id}),
    )
    assert resp.json()["reveal"] is False

    # update reveal value for user 2
    client.force_login(user_2)
    resp = client.patch(
        urls.reverse("api:game:game"),
        data=json.dumps([{"id": game_obj.id}]),
        content_type="application/json",
    )

    # check to that reveal remains true for user 1
    client.force_login(client_user)
    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id}),
    )
    assert resp.json()["reveal"] is True

    # check user 2 reveal is true
    client.force_login(user_2)
    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id}),
    )
    assert resp.json()["reveal"] is True


@pytest.mark.django_db
def test_reveal_games_by_default(client, client_user, authed_client):
    # build team one
    client_team = build_team(client_user)

    # create new game
    game_obj = build_game(lineup1=build_lineup(client_team))

    # set user 1 and 2 to reveal all as true
    client.force_login(client_user)
    resp = authed_client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": client_user.id}),
        data=json.dumps({"reveal_games_by_default": True}),
        content_type="application/json",
    )

    # build user 2, team 2, and a single player that the user 2 owns
    user_2, team_2 = build_user_and_team()

    player_token = 333
    player = build_player_with_ownership(
        player_token, team_2, position1=simulator.models.PlayerPosition.GUARD
    )

    # create reservation for team 2
    build_game_reservation(game_obj, team_2)

    # enroll team 2 into game
    lineup_2 = [player] + build_free_agents([guard, forward, forward, center])

    client.force_login(user_2)
    resp = client.post(
        urls.reverse("api:game:game-enrollment", kwargs={"id": game_obj.id}),
        data=build_enrollment_payload(lineup_2),
        content_type="application/json",
    )

    assert resp.status_code == 201

    # check user 1 reveal value
    client.force_login(client_user)
    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id}),
    )
    assert resp.json()["reveal"] is True

    # check user 2 reveal flag
    client.force_login(user_2)
    resp = client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id}),
    )
    assert resp.json()["reveal"] is False

    # set user 2 reveal all to true
    client.force_login(user_2)
    resp = client.patch(
        urls.reverse("accounts:user-detail", kwargs={"id": user_2.id}),
        data=json.dumps({"reveal_games_by_default": True}),
        content_type="application/json",
    )

    # check user 1 reveal value
    client.force_login(client_user)
    resp = authed_client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id}),
    )
    assert resp.json()["reveal"] is True

    # check user 2 reveal flag
    client.force_login(user_2)
    resp = client.get(
        urls.reverse("api:game:game-detail", kwargs={"id": game_obj.id}),
    )
    assert resp.json()["reveal"] is True


@pytest.mark.django_db
def test_headetohead_game_list_by_complete_games(authed_client):
    _, team1 = build_user_and_team()
    _, team2 = build_user_and_team()
    _, team3 = build_user_and_team()

    (
        game_with_no_reservations,
        game_with_one_reservation,
        game_with_two_reservations,
        game_with_one_lineup_and_residual_reservation,
        game_with_one_lineup_and_one_residual_reservation_and_one_reservation,
        game_with_two_lineups_and_two_residual_reservations,
        game_with_no_lineups_and_one_deleted_reservation,
        complete_game,
    ) = games_lineup_and_reservations_testbed(team1, team2, team3)

    resp = authed_client.get(
        urls.reverse("api:game:headtohead-list") + "?status=COMPLETE"
    )
    results = resp.json()["results"]

    assert len(results) == 1
    assert [r["id"] for r in results] == [
        complete_game.id,
    ]


@pytest.mark.django_db
def test_headetohead_game_detail_happy_path(authed_client, client_user):
    client_team = build_team(client_user)
    game = build_game(lineup1=build_lineup(client_team))

    resp = authed_client.get(
        urls.reverse("api:game:headtohead-detail", kwargs={"id": game.id})
    )
    assert resp.status_code == 200

    assert resp.json()["lineup_1"]
    assert resp.json()["lineup_1"]["player_1"]["wins"] == 5
    assert resp.json()["lineup_2"] is None


@pytest.mark.django_db
def test_in_season_tournament_games_list(authed_client, client_user):
    build_tournament(
        "Swoops Bowl",
        payout=100,
        meta={"rounds": 2, "series": [5, 7], "payout_breakdown_usd": [100]},
    )
    build_tournament(
        "Tournament 2",
        payout=200,
        kind=game.models.Tournament.Kind.PARTNER,
        meta={"rounds": 2, "series": [5, 7], "payout_breakdown_usd": [100]},
    )

    build_tournament(
        "Tournament 3",
        payout=200,
        meta={"rounds": 2, "series": [5, 7], "payout_breakdown_usd": [100]},
        kind=game.models.Tournament.Kind.IN_SEASON,
    )

    _, tournament = build_tournament(
        "Tournament 4",
        payout=200,
        meta={"rounds": 2, "series": [5, 7], "payout_breakdown_usd": [100]},
        status=game.models.Contest.Status.COMPLETE,
        kind=game.models.Tournament.Kind.IN_SEASON,
    )

    client_team = build_team(client_user)

    ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=client_team,
        seed=1,
        lineup=build_lineup(client_team),
    )

    resp = authed_client.get(urls.reverse("api:game:tournament-list"))
    assert resp.status_code == 200
    assert len(resp.json()["results"]) == 4

    # test tournament filter status OPEN

    resp = authed_client.get(
        urls.reverse("api:game:tournament-list"),
        {"status": "OPEN", "kind": game.models.Tournament.Kind.IN_SEASON},
    )

    assert resp.status_code == 200
    assert len(resp.json()["results"]) == 1

    # test tournament filter status CLOSED
    resp = authed_client.get(
        urls.reverse("api:game:tournament-list") + "?status=COMPLETE"
    )
    assert resp.status_code == 200
    assert len(resp.json()["results"]) == 1
    assert resp.json()["results"][0]["id"] == tournament.id

    assert resp.json()["results"][0]["is_current_user_enrolled"] is True


@pytest.mark.django_db
def test_tournament_detail(
    authed_client,
):
    max_rounds_completed = 2
    games_in_series = 2
    tournament_size = 4
    payout = 100
    tournament = build_full_tournament_bracket(
        "Swoops Bowl",
        tournament_size=tournament_size,
        max_rounds_completed=max_rounds_completed,
        games_in_series=games_in_series,
        payout=payout,
        visibility=game.models.Game.Visibility.PUBLIC,
    )

    tournament.visibility_at = timezone.now() + timezone.timedelta(days=1)
    tournament.save()

    resp = authed_client.get(
        urls.reverse(
            "api:game:tournament-detail", kwargs={"tournament_id": tournament.id}
        )
    )

    assert resp.status_code == 400
    assert resp.json()[0] == f"Tournament {tournament.id} has not been revealed"

    tournament.visibility_at = timezone.now() - timezone.timedelta(days=1)
    tournament.save()

    resp = authed_client.get(
        urls.reverse(
            "api:game:tournament-detail", kwargs={"tournament_id": tournament.id}
        )
    )

    assert resp.status_code == 200

    # validating tournament meta data
    assert resp.json()["name"] == "Swoops Bowl"

    assert json.loads(resp.json()["meta"]) == {
        "max_games_per_round": [games_in_series for i in range(0, games_in_series)],
        "payout_breakdown_usd": [payout],
    }

    # validating structure of tournament bracket returned
    assert len(resp.json()["rounds"]) == max_rounds_completed

    for stage, series in enumerate(resp.json()["rounds"]):
        series_size = game.utils.calculate_series_count(tournament.size, stage)
        assert len(series["series"]) == series_size
        for games in series["series"]:
            assert len(games["games"]) == games_in_series


@pytest.mark.django_db
def test_tournament_game(authed_client, client_user):
    contest, tournament = build_tournament(
        "Swoops Bowl", meta={"payout_breakdown_usd": [100]}
    )
    team1 = build_team(client_user)
    _, team2 = build_user_and_team()
    my_game = ddf.G(
        "game.Game",
        contest=contest,
        lineup_1=ddf.F(team=team1),
        lineup_2=ddf.F(team=team2),
        simulation=ddf.G(
            "simulator.Simulation",
            result=ddf.G(
                "simulator.Result",
                lineup_1_score=98,
                lineup_2_score=97,
                lineup_1_box_score=ddf.G("simulator.BoxScore", pts=98),
                lineup_2_box_score=ddf.G("simulator.BoxScore", pts=97),
            ),
        ),
    )

    resp = authed_client.get(
        urls.reverse(
            "api:game:tournament-game",
            kwargs={"tournament_id": tournament.id, "game_id": my_game.id},
        )
    )

    assert resp.json()["id"] == my_game.id
    assert "lineup_1" in resp.json()
    assert "lineup_2" in resp.json()
    assert "results" in resp.json()
    assert resp.status_code == 200


@pytest.mark.django_db
def test_tournament_teams(authed_client, client_user):
    _, tournament = build_tournament(
        "Swoops Bowl", meta={"payout_breakdown_usd": [100]}
    )

    client_team = build_team(client_user)

    ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=client_team,
        seed=1,
        lineup=build_lineup(client_team),
    )

    resp = authed_client.get(
        urls.reverse(
            "api:game:tournament-teams", kwargs={"tournament_id": tournament.id}
        )
    )

    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["seed"] == 1


@pytest.mark.django_db
def test_tournament_submit_lineup(authed_client, client_user):
    _, tournament = build_tournament(
        "Swoops Bowl", meta={"payout_breakdown_usd": [100]}
    )

    team = build_team(client_user)
    ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=team,
        seed=1,
    )
    player_token = 333
    players = [
        build_player_with_ownership(player_token, team, position1=guard)
    ] + build_free_agents([guard, forward, forward, center])

    # create test failure to submit lienup before start date
    tournament.lineup_submission_start = timezone.now() + timezone.timedelta(days=5)
    tournament.save()

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-team-lineup",
            kwargs={"tournament_id": tournament.id},
        ),
        data=build_enrollment_payload(players),
        content_type="application/json",
    )

    assert resp.status_code == 400
    assert (
        resp.json()[0] == "Tournament entry must be submitted after lineup start date."
    )

    # create test failure to submit lienup after start date
    tournament.lineup_submission_start = timezone.now() - timezone.timedelta(days=14)

    tournament.lineup_submission_cutoff = timezone.now() - timezone.timedelta(days=5)

    tournament.save()

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-team-lineup",
            kwargs={
                "tournament_id": tournament.id,
            },
        ),
        data=build_enrollment_payload(players),
        content_type="application/json",
    )

    assert resp.status_code == 400
    assert (
        resp.json()[0]
        == "Tournament entry must be submitted before lineup cutoff date."
    )

    # create test  submit success lienup after start date
    tournament.lineup_submission_cutoff = timezone.now() + timezone.timedelta(days=5)

    tournament.save()

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-team-lineup",
            kwargs={"tournament_id": tournament.id},
        ),
        data=build_enrollment_payload(players),
        content_type="application/json",
    )

    expected_positions = {"G", "G", "F", "F", "C"}
    returned_positions = []
    for i in range(1, 6):
        returned_positions.extend(resp.json()[f"player_{i}"]["positions"])
    assert not expected_positions.difference(returned_positions)
    assert resp.json()["player_1"]["id"] == players[0].id

    assert resp.status_code == 201


@pytest.mark.django_db
def test_tournament_team_lineup(client, authed_client, client_user):
    _, tournament = build_tournament(
        "Swoops Bowl", meta={"payout_breakdown_usd": [100]}
    )

    client_team = build_team(client_user)

    resp = authed_client.get(
        urls.reverse(
            "api:game:tournament-team-lineup",
            kwargs={"tournament_id": tournament.id},
        ),
    )

    assert resp.status_code == 404

    ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=client_team,
        seed=1,
        lineup=build_lineup(client_team),
    )

    resp = authed_client.get(
        urls.reverse(
            "api:game:tournament-team-lineup",
            kwargs={"tournament_id": tournament.id},
        ),
    )

    assert resp.status_code == 200
    assert "player_1" in resp.json()
    assert "player_2" in resp.json()
    assert "player_3" in resp.json()
    assert "player_4" in resp.json()
    assert "player_5" in resp.json()


@pytest.mark.django_db
def test_tournament_team_series(authed_client, client_user):
    contest, tournament = build_tournament(
        "Swoops Bowl", meta={"payout_breakdown_usd": [100]}
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
    series = ddf.G("game.Series", round=my_round, entry_1=entry_1, entry_2=entry_2)
    my_game = ddf.G(
        "game.Game",
        contest=contest,
        lineup_1=ddf.F(team=team1),
        lineup_2=ddf.F(team=team2),
        simulation=ddf.G(
            "simulator.Simulation",
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

    resp = authed_client.get(
        urls.reverse(
            "api:game:tournament-series-detail",
            kwargs={
                "tournament_id": tournament.id,
                "round_id": my_round.id,
                "series_id": series.id,
            },
        ),
    )

    assert "team_1" in resp.json()
    assert "team_2" in resp.json()
    assert "lineup_1" in resp.json()
    assert "lineup_2" in resp.json()
    assert "id" in resp.json()
    assert "games" in resp.json()

    assert resp.json()["games"][0]["id"] == my_game.id

    assert resp.status_code == 200


@pytest.mark.django_db
def test_tournament_validations():
    contest = ddf.G("game.Contest", kind=game.models.Contest.Kind.TOURNAMENT)
    t = game.models.Tournament()
    t.name = "Swoops Bowl"
    t.contest = contest
    t.payout = 100
    t.start_date = timezone.now()
    t.end_date = timezone.now() + timezone.timedelta(hours=5)

    # test tournament size error
    t.size = 5
    with pytest.raises(
        ValidationError,
        match="['Invalid tournament size, tournaments must be size 2^n.']",
    ):
        t.clean()

    t.size = 8

    t.meta = json.dumps({"max_games_per_round": ""})
    with pytest.raises(
        ValidationError,
        match="['type max_games_per_round must be a list.']",  # noqa: E501
    ):
        t.clean()

    t.meta = json.dumps({"max_games_per_round": []})

    with pytest.raises(
        ValidationError,
        match="['max_games_per_round must have 3 entries. One max game entry per round.']",  # noqa: E501
    ):
        t.clean()
    t.meta = json.dumps(
        {
            "max_games_per_round": [4, 4, 4],
        }
    )

    with pytest.raises(
        ValidationError,
        match="['Max game of 4 in Round 1 must be odd.']",  # noqa: E501
    ):
        t.clean()

    payout_breakdown_usd = [101, 22]
    payout_breakdown_sum = sum([101, 22])
    t.meta = json.dumps(
        {
            "max_games_per_round": [3, 3, 3],
            "payout_breakdown_usd": payout_breakdown_usd,
        }
    )

    with pytest.raises(
        ValidationError,
        match=f"['payout_breakdown_usd sum {payout_breakdown_sum} doesn't equal the total payout {t.payout}.']",  # noqa: E501
    ):
        t.clean()

    payout_breakdown_usd = [75, 25]
    t.meta = json.dumps(
        {
            "max_games_per_round": [3, 3, 3],
            "payout_breakdown_usd": payout_breakdown_usd,
        }
    )

    # all validation raised
    t.clean()


@pytest.mark.django_db
def test_team_tournaments_participated_in(authed_client):
    _, tournament_1 = build_tournament(
        "Sweet Swoops", meta={"payout_breakdown_usd": [100]}
    )
    _, tournament_2 = build_tournament(
        "Big Swoops 2", meta={"payout_breakdown_usd": [100]}
    )

    _, team1 = build_user_and_team()

    lineup = build_lineup(team1)
    ddf.G(
        "game.TournamentEntry",
        tournament=tournament_1,
        team=team1,
        seed=1,
        lineup=lineup,
    )

    ddf.G(
        "game.TournamentEntry",
        tournament=tournament_2,
        team=team1,
        seed=1,
        lineup=lineup,
    )

    resp = authed_client.get(
        urls.reverse(
            "api:game:team-tournaments",
            kwargs={"team_id": team1.id},
        )
    )

    assert resp.status_code == 200

    assert resp.json()["results"][0]["id"] == tournament_1.id
    assert resp.json()["results"][1]["id"] == tournament_2.id


@pytest.mark.django_db
def test_tournament_linups(authed_client):
    # insert mocking of serializer to replace functions that use the historical stats

    _, tournament = build_tournament(
        "Sweet Swoops", meta={"payout_breakdown_usd": [100]}
    )
    tournament.lineup_reveal_date = timezone.now() + timezone.timedelta(days=5)

    tournament.save()

    _, team1 = build_user_and_team()
    team1.name = "A"
    team1.save()

    _, team2 = build_user_and_team()
    team2.name = "Z"
    team2.save()

    ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=team1,
        seed=1,
        rank=1,
        lineup=build_lineup(team1),
    )
    ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=team2,
        seed=2,
        rank=2,
        lineup=build_lineup(team2),
    )

    # test attempting returning tournament lineups before reveal date
    resp = authed_client.get(
        urls.reverse(
            "api:game:tournament-lineups",
            kwargs={
                "tournament_id": tournament.id,
            },
        ),
    )
    assert resp.status_code == 400
    assert resp.json()[0] == "Tournament lineups cannot be returned before reveal date."

    # test attempting returning tournament lineups after reveal date
    tournament.lineup_reveal_date = timezone.now() - timezone.timedelta(days=5)

    tournament.save()

    resp = authed_client.get(
        urls.reverse(
            "api:game:tournament-lineups",
            kwargs={
                "tournament_id": tournament.id,
            },
        ),
    )

    assert resp.json()[0]["team"]["name"] == "A"
    assert resp.json()[1]["team"]["name"] == "Z"


@pytest.mark.django_db
def test_tournament_reservation(authed_client, client_user):
    _, tournament_1 = build_tournament(
        "Sweet Swoops",
        kind=game.models.Tournament.Kind.IN_SEASON,
        start_date=timezone.now(),
        meta={"payout_breakdown_usd": [100]},
    )

    # test tournament entry user email not verified

    client_user.is_verified = False
    client_user.save()
    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_1.id,
            },
        ),
    )
    assert resp.status_code == 403
    assert resp.json()["detail"] == "Email must be verified."

    # test tournament entry user doesnt' own player
    client_user.is_verified = True
    client_user.save()

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_1.id,
            },
        ),
    )
    assert resp.status_code == 403
    assert resp.json()["detail"] == "Must own at least one player."

    client_team = build_team(client_user)
    build_player_with_ownership(777, client_team)

    _, tournament_2 = build_tournament(
        "Big Swoops",
        meta={"payout_breakdown_usd": [100]},
    )
    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_2.id,
            },
        ),
    )

    assert resp.status_code == 400
    assert resp.json()["detail"] == (
        f"Tournament={tournament_2.id} is not an In-Season, Partner tournament."
        " Reservations are not allowed."
    )

    # test tournament entry with tournament filled
    tournament_3 = build_full_tournament_bracket(
        "Full Swoops Tournament",
        max_rounds_completed=1,
        kind=game.models.Tournament.Kind.IN_SEASON,
    )
    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_3.id,
            },
        ),
    )

    assert resp.status_code == 400
    assert resp.json()["detail"] == (
        f"Tournament={tournament_3.id} reservations are no longer available."
        " Tournament entries are filled."
    )

    # test successful tournament entry

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_1.id,
            },
        ),
    )

    assert resp.status_code == 201
    assert resp.json()["tournament"]["id"] == tournament_1.id

    # test tournament entry with a team that expired reservation

    # update existing reservation as expired
    reservation = game.models.TournamentReservation.objects.all().first()
    reservation.expires_at = timezone.now() - timezone.timedelta(minutes=5)
    reservation.delted = True
    reservation.save()

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_1.id,
            },
        ),
    )

    assert resp.status_code == 202
    assert resp.json()["tournament"]["id"] == tournament_1.id

    # test tournament condition entry 1)
    # team entered a tournament today and attempting to enter
    # another tournament the same day
    ddf.G(
        "game.TournamentEntry",
        tournament=tournament_1,
        team=client_team,
        seed=1,
        lineup=build_lineup(client_team),
    )

    _, tournament_4 = build_tournament(
        "Big Swoops 2",
        kind=game.models.Tournament.Kind.IN_SEASON,
        start_date=timezone.now(),
        meta={"payout_breakdown_usd": [100]},
    )
    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_4.id,
            },
        ),
    )

    assert resp.status_code == 400
    assert resp.json()["detail"] == (
        f"Team={client_team.id} already has an entry submitted "
        "for another in-season tournament today."
    )

    # test tournament condition entry 2)
    # team entered a tournament today and attempting to pre-register
    # for another tournament tomorrow
    tournament_4.start_date = timezone.now() + timezone.timedelta(days=1)
    tournament_4.save()

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_4.id,
            },
        ),
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == (
        f"Team={client_team.id} already has an entry submitted "
        "for another in-season tournament today."
    )

    # test tournament condition entry 3)
    # team pre-registered for a tournament tomorrow and attempting to pre-register
    # for another tournament tomorrow
    tournament_1.start_date = timezone.now() + timezone.timedelta(days=1)
    tournament_1.save()

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_4.id,
            },
        ),
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == (
        f"Team={client_team.id} already has an entry submitted "
        "for another in-season tournament today."
    )

    # get tournament reservation
    reservation = game.models.TournamentReservation.objects.filter(
        deleted=False
    ).first()
    resp = authed_client.get(
        urls.reverse(
            "api:game:tournament-reservation-detail",
            kwargs={
                "tournament_id": reservation.tournament.id,
                "reservation_id": reservation.id,
            },
        ),
    )
    assert resp.status_code == 200
    assert resp.json()["tournament"]["id"] == reservation.tournament.id


@pytest.mark.django_db
def test_partner_tournament_reservation(authed_client, client_user, settings):
    client_team = build_team(client_user)
    build_player_with_ownership(777, client_team)

    # test partner touranment entry limit
    settings.MAX_PARTNER_GAMES_ALLOWED = 1
    _, tournament_1 = build_tournament(
        "Tournament 1",
        payout=200,
        kind=game.models.Tournament.Kind.PARTNER,
        meta={"rounds": 2, "series": [5, 7], "payout_breakdown_usd": [100]},
    )

    # test user who reserve for a partner tournament with less than allowable
    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_1.id,
            },
        ),
    )
    assert resp.status_code == 201
    resp.json()["tournament"]["id"] == tournament_1.id

    # test user who reserve for a partner tournament with greater than allowable
    _, team2 = build_user_and_team()
    game_obj = build_game(
        game.models.Contest.Status.COMPLETE,
        lineup1=build_lineup(client_team),
        lineup2=build_lineup(team2),
    )

    game_obj.simulation.status = simulator.models.Simulation.Status.FINISHED
    game_obj.simulation.save()

    completed_games_count = 1

    _, tournament_2 = build_tournament(
        "Tournament 2",
        payout=200,
        kind=game.models.Tournament.Kind.PARTNER,
        meta={"rounds": 2, "series": [5, 7], "payout_breakdown_usd": [100]},
    )

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-reservation",
            kwargs={
                "tournament_id": tournament_2.id,
            },
        ),
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == (
        f"Team={client_team.id} cannot enter this partner "
        f"Tournament={tournament_2.id}. They "
        f"have completed {completed_games_count} games "
        "more than the maximum allowable games "
        f"of {settings.MAX_PARTNER_GAMES_ALLOWED}."
    )


@pytest.mark.django_db
def test_tournament_reservation_delete(authed_client, client_user):
    _, tournament_1 = build_tournament(
        "Sweet Swoops",
        kind=game.models.Tournament.Kind.IN_SEASON,
        meta={"payout_breakdown_usd": [100]},
    )
    client_team = build_team(client_user)
    reservation = build_tournament_reservation(tournament_1, client_team)

    resp = authed_client.delete(
        urls.reverse(
            "api:game:tournament-reservation-detail",
            kwargs={"tournament_id": tournament_1.id, "reservation_id": reservation.id},
        )
    )
    assert resp.status_code == 204
    assert game.models.TournamentReservation.objects.all().first().deleted is True


@pytest.mark.django_db
def test_in_season_tournament_entry(authed_client, client_user):
    # insert mocking of serializer to replace functions that use the historical stats

    tokens_required = 1
    _, tournament = build_tournament(
        "Sweet Swoops",
        kind=game.models.Tournament.Kind.IN_SEASON,
        tokens_required=tokens_required,
        meta={"payout_breakdown_usd": [100]},
    )

    _, team_2 = build_user_and_team()

    ddf.G(
        "game.TournamentEntry",
        tournament=tournament,
        team=team_2,
        seed=1,
        lineup=build_lineup(team_2),
    )

    client_team = build_team(client_user)

    # submit lineup to tournament that doesn't meet token gate requirement
    player_token = 545
    players = [
        build_player_with_ownership(player_token, client_team, position1=guard),
        build_player_with_ownership(player_token + 1, client_team, position1=guard),
    ] + build_free_agents([forward, forward, center])
    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-team-lineup",
            kwargs={"tournament_id": tournament.id},
        ),
        data=build_enrollment_payload(players),
        content_type="application/json",
    )
    assert resp.status_code == 400
    assert (
        resp.json()[0]
        == f"Team must own less than {tokens_required} players to enter this game."
    )

    # test submitting an entry after reservation expired
    build_tournament_reservation(tournament, client_team, expired=True)

    player_token = 444
    players = [
        build_player_with_ownership(player_token, client_team, position1=guard)
    ] + build_free_agents([guard, forward, forward, center])

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-team-lineup",
            kwargs={"tournament_id": tournament.id},
        ),
        data=build_enrollment_payload(players),
        content_type="application/json",
    )
    assert resp.status_code == 400
    assert resp.json()[0] == f"Tournament={tournament.id} reservation doesn't exist."

    # successfully submit in-season tournament entry
    build_tournament_reservation(tournament, client_team)

    resp = authed_client.post(
        urls.reverse(
            "api:game:tournament-team-lineup",
            kwargs={"tournament_id": tournament.id},
        ),
        data=build_enrollment_payload(players),
        content_type="application/json",
    )
    assert resp.status_code == 201

    expected_positions = {"G", "G", "F", "F", "C"}
    returned_positions = []
    for i in range(1, 6):
        returned_positions.extend(resp.json()[f"player_{i}"]["positions"])
    assert not expected_positions.difference(returned_positions)
    assert resp.json()["player_1"]["id"] == players[0].id


@pytest.mark.django_db
def test_player_progression_stats(authed_client):
    token_id = 555
    build_player(token_id)

    resp = authed_client.get(
        urls.reverse(
            "api:game:player-progression",
            kwargs={
                "token_id": token_id,
            },
        ),
    )

    assert resp.status_code == 200
    assert resp.json()["interior_defense_delta"] == "1.5000000000"
    assert resp.json()["newly_revealed_ratings"] == ["drb", "ft"]


@pytest.mark.django_db
def test_send_gm_notification_result(authed_client, client_user, mocker):
    mock_send_mail = mocker.patch("comm.email.SendGridAPIClient")
    mock_send_magic_bell = mocker.patch("comm.notification.requests.post")

    # test email doesn't exit
    resp = authed_client.post(
        urls.reverse(
            "api:game:gm-notification-results",
        ),
        data={
            "email": "email@doesntexist.com",
            "url": "https://playswoops.com",
            "msg": "hello world",
            "key": "play-swoops-gm",
        },
        content_type="application/json",
    )
    assert resp.status_code == 400

    # key does not match
    resp = authed_client.post(
        urls.reverse(
            "api:game:gm-notification-results",
        ),
        data={
            "email": client_user.email,
            "url": "https://playswoops.com",
            "msg": "hello world",
            "key": "play-swoops-2345",
        },
        content_type="application/json",
    )

    assert resp.status_code == 400

    # test successful message send
    resp = authed_client.post(
        urls.reverse(
            "api:game:gm-notification-results",
        ),
        data={
            "email": client_user.email,
            "url": "https://playswoops.com",
            "msg": "hello world",
            "key": "play-swoops-gm",
        },
        content_type="application/json",
    )

    assert resp.status_code == 202

    mock_send_mail.assert_called_once()
    mock_send_magic_bell.assert_called_once()


"""
Tests to add for public publish feature:
 - Staff publish game is only visible by staff. It is not visible by any other user
 - Hidden publish game is not visible by both staff or regular users.
 - Publich publish game is visible by both staff and regular users.

We need to test series worker add hidden games.
We need to test publish games endpoint on the simulator side.

We need to test admin in staging after the code is deployed there.
"""

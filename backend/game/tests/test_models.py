"""Tests basic properties, triggers, and methods in game/models.py"""
import uuid

import ddf
import pytest
from django.db.utils import InternalError

import game.models
from simulator.client import Client


@pytest.mark.django_db
def test_game_player_sync_trigger_independent_updates(mocker):
    """Test syncing of GamePlayers when lineups are updated independently"""
    mocker.patch.object(Client, "create_game", return_value={"uuid": uuid.uuid4()})

    # A Game with no lineups should have no GamePlayer objects
    game_obj = ddf.G("game.Game")
    assert not game.models.GamePlayer.objects.exists()

    # A game with no updates to lineups should product no errors
    game_obj.contest = ddf.G("game.Contest")
    game_obj.save()

    assert not game.models.GamePlayer.objects.exists()

    # Test the scenario of updating lineups independently
    game_obj.lineup_1 = ddf.G("game.Lineup")
    game_obj.save()
    assert game.models.GamePlayer.objects.count() == 5
    game_obj.lineup_2 = ddf.G("game.Lineup")
    game_obj.save()
    assert game.models.GamePlayer.objects.count() == 10
    assert set(
        game.models.GamePlayer.objects.values_list("game_id", "player_id")
    ) == set(
        [
            (game_obj.id, game_obj.lineup_1.player_1_id),
            (game_obj.id, game_obj.lineup_1.player_2_id),
            (game_obj.id, game_obj.lineup_1.player_3_id),
            (game_obj.id, game_obj.lineup_1.player_4_id),
            (game_obj.id, game_obj.lineup_1.player_5_id),
            (game_obj.id, game_obj.lineup_2.player_1_id),
            (game_obj.id, game_obj.lineup_2.player_2_id),
            (game_obj.id, game_obj.lineup_2.player_3_id),
            (game_obj.id, game_obj.lineup_2.player_4_id),
            (game_obj.id, game_obj.lineup_2.player_5_id),
        ]
    )


@pytest.mark.django_db
def test_game_player_sync_trigger_upon_creation(mocker):
    """Test syncing of GamePlayers when lineups are part of creation"""

    mocker.patch.object(Client, "create_game", return_value={"uuid": uuid.uuid4()})
    # A Game with both lineups on creation should work
    game_obj = ddf.G("game.Game", lineup_1=ddf.F(), lineup_2=ddf.F())
    assert game.models.GamePlayer.objects.count() == 10
    assert set(
        game.models.GamePlayer.objects.values_list("game_id", "player_id")
    ) == set(
        [
            (game_obj.id, game_obj.lineup_1.player_1_id),
            (game_obj.id, game_obj.lineup_1.player_2_id),
            (game_obj.id, game_obj.lineup_1.player_3_id),
            (game_obj.id, game_obj.lineup_1.player_4_id),
            (game_obj.id, game_obj.lineup_1.player_5_id),
            (game_obj.id, game_obj.lineup_2.player_1_id),
            (game_obj.id, game_obj.lineup_2.player_2_id),
            (game_obj.id, game_obj.lineup_2.player_3_id),
            (game_obj.id, game_obj.lineup_2.player_4_id),
            (game_obj.id, game_obj.lineup_2.player_5_id),
        ]
    )


@pytest.mark.django_db(transaction=True)
def test_game_lineup_updates(mocker):
    """Ensures that lineups of a game cannot be updated once set"""
    mocker.patch.object(Client, "create_game", return_value={"uuid": uuid.uuid4()})

    game_obj = ddf.G("game.Game")
    # An empty update should be allowed since the lineup objects are null
    game_obj.save()

    # One can update the lineup_1 and lineup_2 objects one time
    game_obj.lineup_1 = ddf.G("game.Lineup")
    game_obj.save()
    game_obj.lineup_2 = ddf.G("game.Lineup")
    game_obj.save()

    # An update to lineup_1 will cause an error
    game_obj.lineup_1 = ddf.G("game.Lineup")
    with pytest.raises(InternalError):
        game_obj.save()

    # Ensure we are at a clean slate and can successfully save
    game_obj.refresh_from_db()
    game_obj.save()

    # An update to lineup_2 will cause an error
    game_obj.lineup_2 = ddf.G("game.Lineup")
    with pytest.raises(InternalError):
        game_obj.save()

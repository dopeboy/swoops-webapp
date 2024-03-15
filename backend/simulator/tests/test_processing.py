import datetime as dt
import uuid
from decimal import Decimal

import ddf
import freezegun
import pytest
from django.core.management import call_command
from django.utils import timezone

import game.models
import simulator.models
import simulator.processing
from conftest import build_user_and_team
from simulator.client import Client


@pytest.fixture(autouse=True)
def use_real_client(settings):
    settings.SIMULATOR_CLIENT = "simulator.client.Client"


@pytest.mark.django_db
def test_update_games(mocker, settings):
    lineup_1_uuids = [uuid.uuid4() for i in range(5)]
    for player_uuid in lineup_1_uuids:
        ddf.G(
            "game.Player",
            simulated=ddf.F(
                uuid=str(player_uuid),
                age=3,
            ),
        )

    lineup_2_uuids = [uuid.uuid4() for i in range(5)]
    for player_uuid in lineup_2_uuids:
        ddf.G(
            "game.Player",
            simulated=ddf.F(
                uuid=str(player_uuid),
                age=2,
            ),
        )

    patched_retrieve_game = mocker.patch.object(
        Client,
        "retrieve_game",
        return_value={
            "uuid": "07ef093e-79f1-47e4-9caa-2cfbf0fdd37d",
            "status": "FINISHED",
            "result": {
                "pbp": [
                    {
                        "quarter": 1,
                        "gameclock": "10:00",
                        "Possession": 1,
                        "pbp_string": "Start of Period",
                        "time_remaining": 600.0,
                        "challenged_score": 0,
                        "challenger_score": 0,
                    },
                    {
                        "quarter": 1,
                        "gameclock": "9:44",
                        "Possession": 1,
                        "pbp_string": "Made Two by Derrick Rose from 7 feet",
                        "time_remaining": 583.948619319,
                        "challenged_score": 0,
                        "challenger_score": 2,
                    },
                    {
                        "quarter": 1,
                        "gameclock": "9:44",
                        "Possession": 1,
                        "pbp_string": "Assisted by John Collins",
                        "time_remaining": 583.948619319,
                        "challenged_score": 0,
                        "challenger_score": 2,
                    },
                ],
                "totals": [
                    {
                        "fg": 21.0,
                        "ft": 3.0,
                        "pf": 9.0,
                        "ast": 11.0,
                        "blk": 1.0,
                        "drb": 23.0,
                        "fga": 52.0,
                        "fta": 5.0,
                        "orb": 6.0,
                        "pts": 51.0,
                        "stl": 4.0,
                        "tov": 4.0,
                        "trb": 29.0,
                        "Team": "Challengers",
                        "two_p": 15.0,
                        "fg_pct": 0.4,
                        "ft_pct": 0.6,
                        "two_pa": 35.0,
                        "three_p": 6.0,
                        "three_pa": 17.0,
                        "two_p_pct": 0.43,
                        "three_p_pct": 0.35,
                    },
                    {
                        "fg": 23.0,
                        "ft": 7.0,
                        "pf": 12.0,
                        "ast": 10.0,
                        "blk": 2.0,
                        "drb": 20.0,
                        "fga": 54.0,
                        "fta": 9.0,
                        "orb": 3.0,
                        "pts": 59.0,
                        "stl": 2.0,
                        "tov": 7.0,
                        "trb": 23.0,
                        "Team": "Challenged",
                        "two_p": 17.0,
                        "fg_pct": 0.43,
                        "ft_pct": 0.78,
                        "two_pa": 36.0,
                        "three_p": 6.0,
                        "three_pa": 18.0,
                        "two_p_pct": 0.47,
                        "three_p_pct": 0.33,
                    },
                ],
                "players": {
                    "swoopster-0": {
                        "g": 1,
                        "fg": 3.0,
                        "ft": None,
                        "apg": 2.0,
                        "bpg": None,
                        "fga": 10.0,
                        "fpg": 1.0,
                        "fta": None,
                        "ppg": 7.0,
                        "rpg": 6.0,
                        "spg": 1.0,
                        "tpg": None,
                        "drpg": 6.0,
                        "orpg": None,
                        "uuid": str(lineup_1_uuids[0]),
                        "wins": 0,
                        "two_p": 2.0,
                        "fg_pct": 0.3,
                        "ft_pct": None,
                        "losses": 1,
                        "two_pa": 7.0,
                        "three_p": 1.0,
                        "three_pa": 3.0,
                        "two_p_pct": 0.29,
                        "three_p_pct": 0.33,
                    },
                    "swoopster-1": {
                        "g": 1,
                        "fg": 3.0,
                        "ft": 2.0,
                        "apg": 1.0,
                        "bpg": None,
                        "fga": 9.0,
                        "fpg": 2.0,
                        "fta": 2.0,
                        "ppg": 8.0,
                        "rpg": 5.0,
                        "spg": 3.0,
                        "tpg": None,
                        "drpg": 4.0,
                        "orpg": 1.0,
                        "uuid": str(lineup_1_uuids[1]),
                        "wins": 0,
                        "two_p": 3.0,
                        "fg_pct": 0.33,
                        "ft_pct": 1.0,
                        "losses": 1,
                        "two_pa": 7.0,
                        "three_p": None,
                        "three_pa": 2.0,
                        "two_p_pct": 0.43,
                        "three_p_pct": None,
                    },
                    "swoopster-2": {
                        "g": 1,
                        "fg": 6.0,
                        "ft": None,
                        "apg": 3.0,
                        "bpg": 1.0,
                        "fga": 14.0,
                        "fpg": 1.0,
                        "fta": 1.0,
                        "ppg": 14.0,
                        "rpg": 5.0,
                        "spg": None,
                        "tpg": None,
                        "drpg": 4.0,
                        "orpg": 1.0,
                        "uuid": str(lineup_1_uuids[2]),
                        "wins": 0,
                        "two_p": 4.0,
                        "fg_pct": 0.43,
                        "ft_pct": None,
                        "losses": 1,
                        "two_pa": 8.0,
                        "three_p": 2.0,
                        "three_pa": 6.0,
                        "two_p_pct": 0.5,
                        "three_p_pct": 0.33,
                    },
                    "swoopster-3": {
                        "g": 1,
                        "fg": 4.0,
                        "ft": 1.0,
                        "apg": 4.0,
                        "bpg": None,
                        "fga": 9.0,
                        "fpg": 2.0,
                        "fta": 2.0,
                        "ppg": 9.0,
                        "rpg": 8.0,
                        "spg": None,
                        "tpg": 1.0,
                        "drpg": 6.0,
                        "orpg": 2.0,
                        "uuid": str(lineup_1_uuids[3]),
                        "wins": 0,
                        "two_p": 4.0,
                        "fg_pct": 0.44,
                        "ft_pct": 0.5,
                        "losses": 1,
                        "two_pa": 7.0,
                        "three_p": None,
                        "three_pa": 2.0,
                        "two_p_pct": 0.57,
                        "three_p_pct": None,
                    },
                    "swoopster-4": {
                        "g": 1,
                        "fg": 5.0,
                        "ft": None,
                        "apg": 1.0,
                        "bpg": None,
                        "fga": 10.0,
                        "fpg": 3.0,
                        "fta": None,
                        "ppg": 13.0,
                        "rpg": 5.0,
                        "spg": None,
                        "tpg": 3.0,
                        "drpg": 3.0,
                        "orpg": 2.0,
                        "uuid": str(lineup_1_uuids[4]),
                        "wins": 0,
                        "two_p": 2.0,
                        "fg_pct": 0.5,
                        "ft_pct": None,
                        "losses": 1,
                        "two_pa": 6.0,
                        "three_p": 3.0,
                        "three_pa": 4.0,
                        "two_p_pct": 0.33,
                        "three_p_pct": 0.75,
                    },
                    "swoopster-5": {
                        "g": 1,
                        "fg": 3.0,
                        "ft": 4.0,
                        "apg": 1.0,
                        "bpg": None,
                        "fga": 7.0,
                        "fpg": 1.0,
                        "fta": 4.0,
                        "ppg": 10.0,
                        "rpg": 2.0,
                        "spg": None,
                        "tpg": None,
                        "drpg": 2.0,
                        "orpg": None,
                        "uuid": str(lineup_2_uuids[0]),
                        "wins": 1,
                        "two_p": 3.0,
                        "fg_pct": 0.43,
                        "ft_pct": 1.0,
                        "losses": 0,
                        "two_pa": 5.0,
                        "three_p": None,
                        "three_pa": 2.0,
                        "two_p_pct": 0.6,
                        "three_p_pct": None,
                    },
                    "swoopster-6": {
                        "g": 1,
                        "fg": 7.0,
                        "ft": None,
                        "apg": 1.0,
                        "bpg": 1.0,
                        "fga": 14.0,
                        "fpg": 1.0,
                        "fta": None,
                        "ppg": 15.0,
                        "rpg": 5.0,
                        "spg": None,
                        "tpg": None,
                        "drpg": 4.0,
                        "orpg": 1.0,
                        "uuid": str(lineup_2_uuids[1]),
                        "wins": 1,
                        "two_p": 6.0,
                        "fg_pct": 0.5,
                        "ft_pct": None,
                        "losses": 0,
                        "two_pa": 11.0,
                        "three_p": 1.0,
                        "three_pa": 3.0,
                        "two_p_pct": 0.55,
                        "three_p_pct": 0.33,
                    },
                    "swoopster-7": {
                        "g": 1,
                        "fg": 3.0,
                        "ft": None,
                        "apg": 2.0,
                        "bpg": None,
                        "fga": 11.0,
                        "fpg": 2.0,
                        "fta": None,
                        "ppg": 9.0,
                        "rpg": 4.0,
                        "spg": 1.0,
                        "tpg": 1.0,
                        "drpg": 3.0,
                        "orpg": 1.0,
                        "uuid": str(lineup_2_uuids[2]),
                        "wins": 1,
                        "two_p": None,
                        "fg_pct": 0.27,
                        "ft_pct": None,
                        "losses": 0,
                        "two_pa": 4.0,
                        "three_p": 3.0,
                        "three_pa": 7.0,
                        "two_p_pct": None,
                        "three_p_pct": 0.43,
                    },
                    "swoopster-8": {
                        "g": 1,
                        "fg": 6.0,
                        "ft": None,
                        "apg": 4.0,
                        "bpg": 1.0,
                        "fga": 11.0,
                        "fpg": 4.0,
                        "fta": 1.0,
                        "ppg": 14.0,
                        "rpg": 7.0,
                        "spg": None,
                        "tpg": 4.0,
                        "drpg": 7.0,
                        "orpg": None,
                        "uuid": str(lineup_2_uuids[3]),
                        "wins": 1,
                        "two_p": 4.0,
                        "fg_pct": 0.55,
                        "ft_pct": None,
                        "losses": 0,
                        "two_pa": 7.0,
                        "three_p": 2.0,
                        "three_pa": 4.0,
                        "two_p_pct": 0.57,
                        "three_p_pct": 0.5,
                    },
                    "swoopster-9": {
                        "g": 1,
                        "fg": 4.0,
                        "ft": 3.0,
                        "apg": 2.0,
                        "bpg": None,
                        "fga": 11.0,
                        "fpg": 4.0,
                        "fta": 4.0,
                        "ppg": 11.0,
                        "rpg": 5.0,
                        "spg": 1.0,
                        "tpg": 2.0,
                        "drpg": 4.0,
                        "orpg": 1.0,
                        "uuid": str(lineup_2_uuids[4]),
                        "wins": 1,
                        "two_p": 4.0,
                        "fg_pct": 0.36,
                        "ft_pct": 0.75,
                        "losses": 0,
                        "two_pa": 9.0,
                        "three_p": None,
                        "three_pa": 2.0,
                        "two_p_pct": 0.44,
                        "three_p_pct": None,
                    },
                },
                "combined_boxscore": [
                    {
                        "fg": 3.0,
                        "ft": 0.0,
                        "pf": 1.0,
                        "ast": 2.0,
                        "blk": 0.0,
                        "drb": 6.0,
                        "fga": 10.0,
                        "fta": 0.0,
                        "orb": 0.0,
                        "pts": 7.0,
                        "stl": 1.0,
                        "tov": 0.0,
                        "trb": 6.0,
                        "Team": "Challengers",
                        "two_p": 2.0,
                        "fg_pct": 0.3,
                        "ft_pct": 0.0,
                        "two_pa": 7.0,
                        "three_p": 1.0,
                        "three_pa": 3.0,
                        "canonical": "swoopster-0",
                        "two_p_pct": 0.29,
                        "three_p_pct": 0.33,
                    },
                    {
                        "fg": 3.0,
                        "ft": 2.0,
                        "pf": 2.0,
                        "ast": 1.0,
                        "blk": 0.0,
                        "drb": 4.0,
                        "fga": 9.0,
                        "fta": 2.0,
                        "orb": 1.0,
                        "pts": 8.0,
                        "stl": 3.0,
                        "tov": 0.0,
                        "trb": 5.0,
                        "Team": "Challengers",
                        "two_p": 3.0,
                        "fg_pct": 0.33,
                        "ft_pct": 1.0,
                        "two_pa": 7.0,
                        "three_p": 0.0,
                        "three_pa": 2.0,
                        "canonical": "swoopster-1",
                        "two_p_pct": 0.43,
                        "three_p_pct": 0.0,
                    },
                    {
                        "fg": 6.0,
                        "ft": 0.0,
                        "pf": 1.0,
                        "ast": 3.0,
                        "blk": 1.0,
                        "drb": 4.0,
                        "fga": 14.0,
                        "fta": 1.0,
                        "orb": 1.0,
                        "pts": 14.0,
                        "stl": 0.0,
                        "tov": 0.0,
                        "trb": 5.0,
                        "Team": "Challengers",
                        "two_p": 4.0,
                        "fg_pct": 0.43,
                        "ft_pct": 0.0,
                        "two_pa": 8.0,
                        "three_p": 2.0,
                        "three_pa": 6.0,
                        "canonical": "swoopster-2",
                        "two_p_pct": 0.5,
                        "three_p_pct": 0.33,
                    },
                    {
                        "fg": 4.0,
                        "ft": 1.0,
                        "pf": 2.0,
                        "ast": 4.0,
                        "blk": 0.0,
                        "drb": 6.0,
                        "fga": 9.0,
                        "fta": 2.0,
                        "orb": 2.0,
                        "pts": 9.0,
                        "stl": 0.0,
                        "tov": 1.0,
                        "trb": 8.0,
                        "Team": "Challengers",
                        "two_p": 4.0,
                        "fg_pct": 0.44,
                        "ft_pct": 0.5,
                        "two_pa": 7.0,
                        "three_p": 0.0,
                        "three_pa": 2.0,
                        "canonical": "swoopster-3",
                        "two_p_pct": 0.57,
                        "three_p_pct": 0.0,
                    },
                    {
                        "fg": 5.0,
                        "ft": 0.0,
                        "pf": 3.0,
                        "ast": 1.0,
                        "blk": 0.0,
                        "drb": 3.0,
                        "fga": 10.0,
                        "fta": 0.0,
                        "orb": 2.0,
                        "pts": 13.0,
                        "stl": 0.0,
                        "tov": 3.0,
                        "trb": 5.0,
                        "Team": "Challengers",
                        "two_p": 2.0,
                        "fg_pct": 0.5,
                        "ft_pct": 0.0,
                        "two_pa": 6.0,
                        "three_p": 3.0,
                        "three_pa": 4.0,
                        "canonical": "swoopster-4",
                        "two_p_pct": 0.33,
                        "three_p_pct": 0.75,
                    },
                    {
                        "fg": 3.0,
                        "ft": 4.0,
                        "pf": 1.0,
                        "ast": 1.0,
                        "blk": 0.0,
                        "drb": 2.0,
                        "fga": 7.0,
                        "fta": 4.0,
                        "orb": 0.0,
                        "pts": 10.0,
                        "stl": 0.0,
                        "tov": 0.0,
                        "trb": 2.0,
                        "Team": "Challenged",
                        "two_p": 3.0,
                        "fg_pct": 0.43,
                        "ft_pct": 1.0,
                        "two_pa": 5.0,
                        "three_p": 0.0,
                        "three_pa": 2.0,
                        "canonical": "swoopster-5",
                        "two_p_pct": 0.6,
                        "three_p_pct": 0.0,
                    },
                    {
                        "fg": 7.0,
                        "ft": 0.0,
                        "pf": 1.0,
                        "ast": 1.0,
                        "blk": 1.0,
                        "drb": 4.0,
                        "fga": 14.0,
                        "fta": 0.0,
                        "orb": 1.0,
                        "pts": 15.0,
                        "stl": 0.0,
                        "tov": 0.0,
                        "trb": 5.0,
                        "Team": "Challenged",
                        "two_p": 6.0,
                        "fg_pct": 0.5,
                        "ft_pct": 0.0,
                        "two_pa": 11.0,
                        "three_p": 1.0,
                        "three_pa": 3.0,
                        "canonical": "swoopster-6",
                        "two_p_pct": 0.55,
                        "three_p_pct": 0.33,
                    },
                    {
                        "fg": 3.0,
                        "ft": 0.0,
                        "pf": 2.0,
                        "ast": 2.0,
                        "blk": 0.0,
                        "drb": 3.0,
                        "fga": 11.0,
                        "fta": 0.0,
                        "orb": 1.0,
                        "pts": 9.0,
                        "stl": 1.0,
                        "tov": 1.0,
                        "trb": 4.0,
                        "Team": "Challenged",
                        "two_p": 0.0,
                        "fg_pct": 0.27,
                        "ft_pct": 0.0,
                        "two_pa": 4.0,
                        "three_p": 3.0,
                        "three_pa": 7.0,
                        "canonical": "swoopster-7",
                        "two_p_pct": 0.0,
                        "three_p_pct": 0.43,
                    },
                    {
                        "fg": 6.0,
                        "ft": 0.0,
                        "pf": 4.0,
                        "ast": 4.0,
                        "blk": 1.0,
                        "drb": 7.0,
                        "fga": 11.0,
                        "fta": 1.0,
                        "orb": 0.0,
                        "pts": 14.0,
                        "stl": 0.0,
                        "tov": 4.0,
                        "trb": 7.0,
                        "Team": "Challenged",
                        "two_p": 4.0,
                        "fg_pct": 0.55,
                        "ft_pct": 0.0,
                        "two_pa": 7.0,
                        "three_p": 2.0,
                        "three_pa": 4.0,
                        "canonical": "swoopster-8",
                        "two_p_pct": 0.57,
                        "three_p_pct": 0.5,
                    },
                    {
                        "fg": 4.0,
                        "ft": 3.0,
                        "pf": 4.0,
                        "ast": 2.0,
                        "blk": 0.0,
                        "drb": 4.0,
                        "fga": 11.0,
                        "fta": 4.0,
                        "orb": 1.0,
                        "pts": 11.0,
                        "stl": 1.0,
                        "tov": 2.0,
                        "trb": 5.0,
                        "Team": "Challenged",
                        "two_p": 4.0,
                        "fg_pct": 0.36,
                        "ft_pct": 0.75,
                        "two_pa": 9.0,
                        "three_p": 0.0,
                        "three_pa": 2.0,
                        "canonical": "swoopster-9",
                        "two_p_pct": 0.44,
                        "three_p_pct": 0.0,
                    },
                ],
                "challenged_boxscore": [
                    {
                        "fg": 3.0,
                        "ft": 4.0,
                        "pf": 1.0,
                        "ast": 1.0,
                        "blk": 0.0,
                        "drb": 2.0,
                        "fga": 7.0,
                        "fta": 4.0,
                        "orb": 0.0,
                        "pts": 10.0,
                        "stl": 0.0,
                        "tov": 0.0,
                        "trb": 2.0,
                        "two_p": 3.0,
                        "fg_pct": 0.43,
                        "ft_pct": 1.0,
                        "two_pa": 5.0,
                        "three_p": 0.0,
                        "three_pa": 2.0,
                        "canonical": "swoopster-5",
                        "two_p_pct": 0.6,
                        "three_p_pct": 0.0,
                    },
                    {
                        "fg": 7.0,
                        "ft": 0.0,
                        "pf": 1.0,
                        "ast": 1.0,
                        "blk": 1.0,
                        "drb": 4.0,
                        "fga": 14.0,
                        "fta": 0.0,
                        "orb": 1.0,
                        "pts": 15.0,
                        "stl": 0.0,
                        "tov": 0.0,
                        "trb": 5.0,
                        "two_p": 6.0,
                        "fg_pct": 0.5,
                        "ft_pct": 0.0,
                        "two_pa": 11.0,
                        "three_p": 1.0,
                        "three_pa": 3.0,
                        "canonical": "swoopster-6",
                        "two_p_pct": 0.55,
                        "three_p_pct": 0.33,
                    },
                    {
                        "fg": 3.0,
                        "ft": 0.0,
                        "pf": 2.0,
                        "ast": 2.0,
                        "blk": 0.0,
                        "drb": 3.0,
                        "fga": 11.0,
                        "fta": 0.0,
                        "orb": 1.0,
                        "pts": 9.0,
                        "stl": 1.0,
                        "tov": 1.0,
                        "trb": 4.0,
                        "two_p": 0.0,
                        "fg_pct": 0.27,
                        "ft_pct": 0.0,
                        "two_pa": 4.0,
                        "three_p": 3.0,
                        "three_pa": 7.0,
                        "canonical": "swoopster-7",
                        "two_p_pct": 0.0,
                        "three_p_pct": 0.43,
                    },
                    {
                        "fg": 6.0,
                        "ft": 0.0,
                        "pf": 4.0,
                        "ast": 4.0,
                        "blk": 1.0,
                        "drb": 7.0,
                        "fga": 11.0,
                        "fta": 1.0,
                        "orb": 0.0,
                        "pts": 14.0,
                        "stl": 0.0,
                        "tov": 4.0,
                        "trb": 7.0,
                        "two_p": 4.0,
                        "fg_pct": 0.55,
                        "ft_pct": 0.0,
                        "two_pa": 7.0,
                        "three_p": 2.0,
                        "three_pa": 4.0,
                        "canonical": "swoopster-8",
                        "two_p_pct": 0.57,
                        "three_p_pct": 0.5,
                    },
                    {
                        "fg": 4.0,
                        "ft": 3.0,
                        "pf": 4.0,
                        "ast": 2.0,
                        "blk": 0.0,
                        "drb": 4.0,
                        "fga": 11.0,
                        "fta": 4.0,
                        "orb": 1.0,
                        "pts": 11.0,
                        "stl": 1.0,
                        "tov": 2.0,
                        "trb": 5.0,
                        "two_p": 4.0,
                        "fg_pct": 0.36,
                        "ft_pct": 0.75,
                        "two_pa": 9.0,
                        "three_p": 0.0,
                        "three_pa": 2.0,
                        "canonical": "swoopster-9",
                        "two_p_pct": 0.44,
                        "three_p_pct": 0.0,
                    },
                ],
                "challengers_boxscore": [
                    {
                        "fg": 3.0,
                        "ft": 0.0,
                        "pf": 1.0,
                        "ast": 2.0,
                        "blk": 0.0,
                        "drb": 6.0,
                        "fga": 10.0,
                        "fta": 0.0,
                        "orb": 0.0,
                        "pts": 7.0,
                        "stl": 1.0,
                        "tov": 0.0,
                        "trb": 6.0,
                        "two_p": 2.0,
                        "fg_pct": 0.3,
                        "ft_pct": 0.0,
                        "two_pa": 7.0,
                        "three_p": 1.0,
                        "three_pa": 3.0,
                        "canonical": "swoopster-0",
                        "two_p_pct": 0.29,
                        "three_p_pct": 0.33,
                    },
                    {
                        "fg": 3.0,
                        "ft": 2.0,
                        "pf": 2.0,
                        "ast": 1.0,
                        "blk": 0.0,
                        "drb": 4.0,
                        "fga": 9.0,
                        "fta": 2.0,
                        "orb": 1.0,
                        "pts": 8.0,
                        "stl": 3.0,
                        "tov": 0.0,
                        "trb": 5.0,
                        "two_p": 3.0,
                        "fg_pct": 0.33,
                        "ft_pct": 1.0,
                        "two_pa": 7.0,
                        "three_p": 0.0,
                        "three_pa": 2.0,
                        "canonical": "swoopster-1",
                        "two_p_pct": 0.43,
                        "three_p_pct": 0.0,
                    },
                    {
                        "fg": 6.0,
                        "ft": 0.0,
                        "pf": 1.0,
                        "ast": 3.0,
                        "blk": 1.0,
                        "drb": 4.0,
                        "fga": 14.0,
                        "fta": 1.0,
                        "orb": 1.0,
                        "pts": 14.0,
                        "stl": 0.0,
                        "tov": 0.0,
                        "trb": 5.0,
                        "two_p": 4.0,
                        "fg_pct": 0.43,
                        "ft_pct": 0.0,
                        "two_pa": 8.0,
                        "three_p": 2.0,
                        "three_pa": 6.0,
                        "canonical": "swoopster-2",
                        "two_p_pct": 0.5,
                        "three_p_pct": 0.33,
                    },
                    {
                        "fg": 4.0,
                        "ft": 1.0,
                        "pf": 2.0,
                        "ast": 4.0,
                        "blk": 0.0,
                        "drb": 6.0,
                        "fga": 9.0,
                        "fta": 2.0,
                        "orb": 2.0,
                        "pts": 9.0,
                        "stl": 0.0,
                        "tov": 1.0,
                        "trb": 8.0,
                        "two_p": 4.0,
                        "fg_pct": 0.44,
                        "ft_pct": 0.5,
                        "two_pa": 7.0,
                        "three_p": 0.0,
                        "three_pa": 2.0,
                        "canonical": "swoopster-3",
                        "two_p_pct": 0.57,
                        "three_p_pct": 0.0,
                    },
                    {
                        "fg": 5.0,
                        "ft": 0.0,
                        "pf": 3.0,
                        "ast": 1.0,
                        "blk": 0.0,
                        "drb": 3.0,
                        "fga": 10.0,
                        "fta": 0.0,
                        "orb": 2.0,
                        "pts": 13.0,
                        "stl": 0.0,
                        "tov": 3.0,
                        "trb": 5.0,
                        "two_p": 2.0,
                        "fg_pct": 0.5,
                        "ft_pct": 0.0,
                        "two_pa": 6.0,
                        "three_p": 3.0,
                        "three_pa": 4.0,
                        "canonical": "swoopster-4",
                        "two_p_pct": 0.33,
                        "three_p_pct": 0.75,
                    },
                ],
            },
        },
    )

    retrieve_player_stats = mocker.patch.object(
        Client,
        "retrieve_player_stats",
        return_value={
            "player_uuids": [lineup_1_uuids[0]],
            "results": [
                {
                    "apg": 4.92,
                    "bpg": 1.25,
                    "drpg": 5.62,
                    "fg": 5.92,
                    "fg_pct": 0.45,
                    "fga": 12.92,
                    "fpg": 3.37,
                    "ft": 4.85,
                    "ft_pct": 0.76,
                    "fta": 5.85,
                    "g": 27,
                    "losses": 11,
                    "orpg": 3.37,
                    "player_uuid": lineup_1_uuids[0],
                    "ppg": 19.40,
                    "rpg": 9.0,
                    "spg": 0.66,
                    "three_p": 2.70,
                    "three_p_pct": 0.409,
                    "three_pa": 6.33,
                    "tpg": 2.25,
                    "two_p": 3.22,
                    "two_p_pct": 0.49,
                    "two_pa": 6.59,
                    "wins": 16,
                }
            ],
        },
    )

    user_1, team_1 = build_user_and_team()
    user_2, team_2 = build_user_and_team()

    ddf.G(
        "game.Game",
        lineup_1=ddf.F(team=team_1),
        lineup_2=ddf.F(team=team_2),
        simulation=ddf.G(
            "simulator.Simulation",
            uuid=uuid.uuid4(),
            status=simulator.models.Simulation.Status.PENDING,
            lineup_1_uuids=lineup_1_uuids,
            lineup_2_uuids=lineup_2_uuids,
        ),
    )

    call_command("update_simulated_games")

    assert len(patched_retrieve_game.call_args_list) == 1
    assert (
        simulator.models.Simulation.objects.filter(
            status=simulator.models.Simulation.Status.FINISHED
        ).count()
        == 1
    )

    assert simulator.models.BoxScore.objects.count() == 12

    # No other changes should happen
    call_command("update_simulated_games")
    assert len(patched_retrieve_game.call_args_list) == 1
    assert (
        simulator.models.Simulation.objects.filter(
            status=simulator.models.Simulation.Status.FINISHED
        ).count()
        == 1
    )

    assert simulator.models.BoxScore.objects.count() == 12

    simulation_obj = simulator.models.Simulation.objects.first()
    assert simulation_obj.result.lineup_1_score == 51
    assert simulation_obj.result.lineup_2_score == 59
    assert simulation_obj.result.lineup_1_player_1_box_score.pts == 7
    assert simulation_obj.result.lineup_1_player_2_box_score.pts == 8
    assert simulation_obj.result.lineup_1_player_3_box_score.pts == 14
    assert simulation_obj.result.lineup_1_player_4_box_score.pts == 9
    assert simulation_obj.result.lineup_1_player_5_box_score.pts == 13
    assert simulation_obj.result.lineup_1_box_score.pts == 51
    assert simulation_obj.result.lineup_2_player_1_box_score.pts == 10
    assert simulation_obj.result.lineup_2_player_2_box_score.pts == 15
    assert simulation_obj.result.lineup_2_player_3_box_score.pts == 9
    assert simulation_obj.result.lineup_2_player_4_box_score.pts == 14
    assert simulation_obj.result.lineup_2_player_5_box_score.pts == 11
    assert simulation_obj.result.lineup_2_box_score.pts == 59
    assert simulation_obj.play_by_play.feed is not None
    assert simulation_obj.play_by_play.feed != ""
    # test wins losses were updated
    assert simulation_obj.game.lineup_1.team.wins == 0
    assert simulation_obj.game.lineup_1.team.losses == 1

    assert simulation_obj.game.lineup_2.team.wins == 1
    assert simulation_obj.game.lineup_2.team.losses == 0

    # check player stats
    assert (
        simulator.models.Player.objects.filter(uuid=str(lineup_1_uuids[0])).count() == 1
    )

    assert len(retrieve_player_stats.call_args_list) == 1
    game_player = game.models.Player.objects.get(
        simulated__uuid=str(lineup_1_uuids[0])
    )  # noqa: E501

    # ignore player stats for now
    assert game_player.wins == 16
    assert game_player.losses == 11

    simulated_player = game_player.simulated
    assert simulated_player.g == Decimal(27)
    assert simulated_player.fg == Decimal(str(5.92))
    assert simulated_player.ft == Decimal(str(4.85))
    assert simulated_player.apg == Decimal(str(4.92))

    assert simulated_player.bpg == Decimal(str(1.25))
    assert simulated_player.fga == Decimal(str(12.92))
    assert simulated_player.fpg == Decimal(str(3.37))
    assert simulated_player.fta == Decimal(str(5.85))
    assert simulated_player.ppg == Decimal(str(19.40))
    assert simulated_player.rpg == Decimal(str(9.0))
    assert simulated_player.spg == Decimal(str(0.66))
    assert simulated_player.tpg == Decimal(str(2.25))
    assert simulated_player.drpg == Decimal(str(5.62))
    assert simulated_player.orpg == Decimal(str(3.37))

    assert simulated_player.two_p == Decimal(str(3.22))
    assert simulated_player.ft_pct == Decimal(str(0.76))

    assert simulated_player.two_pa == Decimal(str(6.59))
    assert simulated_player.three_p == Decimal(str(2.70))
    assert simulated_player.three_pa == Decimal(str(6.33))
    assert simulated_player.two_p_pct == Decimal(str(0.49))
    assert simulated_player.three_p_pct == Decimal(str(0.409))


@pytest.mark.django_db
def test_update_games_error(mocker):
    mocker.patch("simulator.processing.game_simulation_status_updated")
    patched_retrieve_game = mocker.patch.object(
        Client, "retrieve_game", side_effect=Exception("Unexpected exception!")
    )
    ddf.G(
        "simulator.Simulation",
        n=5,
        status=simulator.models.Simulation.Status.PENDING,
    )

    call_command("update_simulated_games")
    assert len(patched_retrieve_game.call_args_list) == 5
    assert simulator.models.Simulation.objects.count() == 5
    assert (
        simulator.models.Simulation.objects.filter(
            status=simulator.models.Simulation.Status.ERRORED
        ).count()
        == 5
    )

    # No other changes should happen since we haven't waited long enough for next retry
    call_command("update_simulated_games")
    assert len(patched_retrieve_game.call_args_list) == 5
    assert simulator.models.Simulation.objects.count() == 5

    # Fast forward to the future and we will retry 4 more times
    with freezegun.freeze_time(timezone.now() + dt.timedelta(minutes=10)):
        call_command("update_simulated_games")
        assert len(patched_retrieve_game.call_args_list) == 10
        assert simulator.models.Simulation.objects.count() == 5

    with freezegun.freeze_time(timezone.now() + dt.timedelta(minutes=25)):
        call_command("update_simulated_games")
        assert len(patched_retrieve_game.call_args_list) == 15
        assert simulator.models.Simulation.objects.count() == 5

    with freezegun.freeze_time(timezone.now() + dt.timedelta(minutes=45)):
        call_command("update_simulated_games")
        assert len(patched_retrieve_game.call_args_list) == 20
        assert simulator.models.Simulation.objects.count() == 5

    with freezegun.freeze_time(timezone.now() + dt.timedelta(minutes=70)):
        call_command("update_simulated_games")
        assert len(patched_retrieve_game.call_args_list) == 25
        assert simulator.models.Simulation.objects.count() == 5

    # We are done retrying
    with freezegun.freeze_time(timezone.now() + dt.timedelta(minutes=100)):
        call_command("update_simulated_games")
        assert len(patched_retrieve_game.call_args_list) == 25
        assert simulator.models.Simulation.objects.count() == 5


@pytest.mark.django_db
def test_update_games_timeout(mocker):
    mocker.patch("simulator.processing.game_simulation_status_updated")
    patched_retrieve_game = mocker.patch.object(
        Client,
        "retrieve_game",
        return_value={
            "status": simulator.models.Simulation.Status.STARTED,
        },
    )
    sim = ddf.G(
        "simulator.Simulation",
        status=simulator.models.Simulation.Status.PENDING,
    )

    call_command("update_simulated_games")
    assert len(patched_retrieve_game.call_args_list) == 1
    sim.refresh_from_db()
    assert sim.status == simulator.models.Simulation.Status.STARTED

    with freezegun.freeze_time(timezone.now() + dt.timedelta(minutes=10)):
        call_command("update_simulated_games")
        assert len(patched_retrieve_game.call_args_list) == 2
        sim.refresh_from_db()
        assert sim.status == simulator.models.Simulation.Status.STARTED

    # Time out simulations after 8 hours
    with freezegun.freeze_time(timezone.now() + dt.timedelta(days=1)):
        call_command("update_simulated_games")
        assert len(patched_retrieve_game.call_args_list) == 3
        sim.refresh_from_db()
        assert sim.status == simulator.models.Simulation.Status.TIMED_OUT

    # The simulation should no longer be touched
    call_command("update_simulated_games")
    assert len(patched_retrieve_game.call_args_list) == 3
    sim.refresh_from_db()
    assert sim.status == simulator.models.Simulation.Status.TIMED_OUT


@pytest.mark.django_db
def test_game_errors_to_terminal_failure(mocker):
    mocker.patch("simulator.processing.game_simulation_status_updated")
    patched_retrieve_game = mocker.patch.object(
        Client, "retrieve_game", side_effect=Exception("Unexpected exception!")
    )

    sim = ddf.G(
        "simulator.Simulation",
        status=simulator.models.Simulation.Status.ERRORED,
        num_retries=4,
    )

    call_command("update_simulated_games")
    assert len(patched_retrieve_game.call_args_list) == 1
    sim.refresh_from_db()
    assert sim.status == simulator.models.Simulation.Status.TERMINAL_ERROR


@pytest.mark.django_db
def test_sync_players(mocker, settings):
    settings.PLAYER_MIN_TOKEN_ID_ACCESSIBLE = 0
    settings.PLAYER_MAX_TOKEN_ID_ACCESSIBLE = 10

    patched_retrieve_players = mocker.patch.object(
        Client,
        "players",
        return_value=[
            {
                "uuid": "577a1c3d-782b-44f7-8853-dce713d1c966",
                "token": 5,
                "full_name": "TEST-5",
                "first_name": "",
                "last_name": "",
                "canonical": "test-5",
                "positions": ["F"],
                "age": 3.0,
                "star_rating": 1.0,
                "free_agent": False,
                "stats": {
                    "wins": {"value": 0, "description": "Games won"},
                    "losses": {"value": 0, "description": "Games lost"},
                    "g": {"value": None, "description": "Games played"},
                    "fg": {"value": None, "description": "Field goals per game"},
                    "fga": {
                        "value": None,
                        "description": "Field goal attempts per game",
                    },
                    "fg_pct": {"value": None, "description": "Field goal percentage"},
                    "three_p": {
                        "value": None,
                        "description": "Three pointers per game",
                    },
                    "three_pa": {
                        "value": None,
                        "description": "Three pointer attempts per game",
                    },
                    "three_p_pct": {
                        "value": None,
                        "description": "Three point percentage",
                    },
                    "two_p": {"value": None, "description": "Two pointers per game"},
                    "two_pa": {
                        "value": None,
                        "description": "Two pointer attempts per game",
                    },
                    "two_p_pct": {"value": None, "description": "Two point percentage"},
                    "ft": {"value": None, "description": "Free throws per game"},
                    "fta": {
                        "value": None,
                        "description": "Free throw attempts per game",
                    },
                    "ft_pct": {"value": None, "description": "Free throw percentage"},
                    "orpg": {
                        "value": None,
                        "description": "Offensive rebounds per game",
                    },
                    "drpg": {
                        "value": None,
                        "description": "Defensive rebounds per game",
                    },
                    "rpg": {"value": None, "description": "Rebounds per game"},
                    "apg": {"value": None, "description": "Assists per game"},
                    "spg": {"value": None, "description": "Steals per game"},
                    "bpg": {"value": None, "description": "Blocks per game"},
                    "tpg": {"value": None, "description": "Turnovers per game"},
                    "fpg": {"value": None, "description": "Fouls per game"},
                    "ppg": {"value": None, "description": "Points per game"},
                },
                "visual_attributes": {
                    "accessory": "NONE",
                    "balls": "CLASSIC",
                    "exo_shell": "MATTE_SAND",
                    "finger_tips": "FINGER_TIPS_CHROME",
                    "hair": "MOHAWK_GREEN",
                    "jersey_trim": "BLUE",
                    "background": "RED",
                    "ear_plate": "RED",
                    "face": "FACE_STEEL",
                    "guts": "SMOKED",
                    "jersey": "GREY",
                    "ensemble": None,
                },
                "attributes": {
                    "three_pt_rating": None,
                    "interior_2pt_rating": None,
                    "midrange_2pt_rating": None,
                    "ft_rating": None,
                    "drb_rating": None,
                    "orb_rating": 66.1396992138,
                    "ast_rating": None,
                    "physicality_rating": None,
                    "interior_defense_rating": None,
                    "perimeter_defense_rating": None,
                    "longevity_rating": 61.0126672048,
                    "hustle_rating": 91.5811535398,
                    "bball_iq_rating": None,
                    "leadership_rating": None,
                    "coachability_rating": None,
                },
                "top_attributes": [
                    "hustle_rating",
                    "bball_iq_rating",
                    "leadership_rating",
                ],
                "created_at": "2022-12-02T02:31:07.309563Z",
                "updated_at": "2023-01-18T18:28:32.489266Z",
            },
            {
                "uuid": "e39bc259-5328-418f-8fb9-f697b4824b87",
                "token": -10,
                "full_name": "FREE-AGENT-10",
                "first_name": "",
                "last_name": "",
                "canonical": "fa-10",
                "positions": ["F"],
                "age": 4.0,
                "star_rating": 1.0,
                "free_agent": False,
                "stats": {
                    "wins": {"value": 9, "description": "Games won"},
                    "losses": {"value": 13, "description": "Games lost"},
                    "g": {"value": 23.0, "description": "Games played"},
                    "fg": {"value": 3.12, "description": "Field goals per game"},
                    "fga": {
                        "value": 12.99,
                        "description": "Field goal attempts per game",
                    },
                    "fg_pct": {"value": 0.24, "description": "Field goal percentage"},
                    "three_p": {
                        "value": 2.96,
                        "description": "Three pointers per game",
                    },
                    "three_pa": {
                        "value": 8.04,
                        "description": "Three pointer attempts per game",
                    },
                    "three_p_pct": {
                        "value": 0.37,
                        "description": "Three point percentage",
                    },
                    "two_p": {"value": 0.17, "description": "Two pointers per game"},
                    "two_pa": {
                        "value": 4.95,
                        "description": "Two pointer attempts per game",
                    },
                    "two_p_pct": {"value": 0.04, "description": "Two point percentage"},
                    "ft": {"value": 3.21, "description": "Free throws per game"},
                    "fta": {
                        "value": 4.25,
                        "description": "Free throw attempts per game",
                    },
                    "ft_pct": {"value": 0.75, "description": "Free throw percentage"},
                    "orpg": {
                        "value": 1.0,
                        "description": "Offensive rebounds per game",
                    },
                    "drpg": {
                        "value": 1.3,
                        "description": "Defensive rebounds per game",
                    },
                    "rpg": {"value": 2.3, "description": "Rebounds per game"},
                    "apg": {"value": 3.84, "description": "Assists per game"},
                    "spg": {"value": 2.04, "description": "Steals per game"},
                    "bpg": {"value": 2.91, "description": "Blocks per game"},
                    "tpg": {"value": 3.96, "description": "Turnovers per game"},
                    "fpg": {"value": 2.96, "description": "Fouls per game"},
                    "ppg": {"value": 12.42, "description": "Points per game"},
                },
                "visual_attributes": {
                    "accessory": "MASK_GREEN",
                    "balls": "CARBON_GLOW",
                    "exo_shell": "MATTE_RED",
                    "finger_tips": "FINGER_TIPS_CHROME",
                    "hair": "MOHAWK_GREY",
                    "jersey_trim": "BLUE",
                    "background": "PURPLE",
                    "ear_plate": "BLACK",
                    "face": "FACE_GREEN_DIP",
                    "guts": "SMOKED",
                    "jersey": "GREEN",
                    "ensemble": None,
                },
                "attributes": {
                    "three_pt_rating": 57.0736149833,
                    "interior_2pt_rating": None,
                    "midrange_2pt_rating": None,
                    "ft_rating": 58.2644869349,
                    "drb_rating": None,
                    "orb_rating": None,
                    "ast_rating": None,
                    "physicality_rating": None,
                    "interior_defense_rating": 50.788692098,
                    "perimeter_defense_rating": None,
                    "longevity_rating": None,
                    "hustle_rating": None,
                    "bball_iq_rating": 86.0553440278,
                    "leadership_rating": None,
                    "coachability_rating": None,
                },
                "top_attributes": [
                    "bball_iq_rating",
                    "perimeter_defense_rating",
                    "coachability_rating",
                ],
                "created_at": "2022-12-02T02:31:07.098346Z",
                "updated_at": "2023-05-07T16:40:49.411772Z",
            },
            {
                "uuid": "435985c2-4a3f-48c5-bbe3-da56dabfc766",
                "token": 20,
                "full_name": "TEST-20",
                "first_name": "",
                "last_name": "",
                "canonical": "test-20",
                "positions": ["F"],
                "age": 4.0,
                "star_rating": 2.0,
                "free_agent": False,
                "stats": {
                    "wins": {"value": 0, "description": "Games won"},
                    "losses": {"value": 0, "description": "Games lost"},
                    "g": {"value": None, "description": "Games played"},
                    "fg": {"value": None, "description": "Field goals per game"},
                    "fga": {
                        "value": None,
                        "description": "Field goal attempts per game",
                    },
                    "fg_pct": {"value": None, "description": "Field goal percentage"},
                    "three_p": {
                        "value": None,
                        "description": "Three pointers per game",
                    },
                    "three_pa": {
                        "value": None,
                        "description": "Three pointer attempts per game",
                    },
                    "three_p_pct": {
                        "value": None,
                        "description": "Three point percentage",
                    },
                    "two_p": {"value": None, "description": "Two pointers per game"},
                    "two_pa": {
                        "value": None,
                        "description": "Two pointer attempts per game",
                    },
                    "two_p_pct": {"value": None, "description": "Two point percentage"},
                    "ft": {"value": None, "description": "Free throws per game"},
                    "fta": {
                        "value": None,
                        "description": "Free throw attempts per game",
                    },
                    "ft_pct": {"value": None, "description": "Free throw percentage"},
                    "orpg": {
                        "value": None,
                        "description": "Offensive rebounds per game",
                    },
                    "drpg": {
                        "value": None,
                        "description": "Defensive rebounds per game",
                    },
                    "rpg": {"value": None, "description": "Rebounds per game"},
                    "apg": {"value": None, "description": "Assists per game"},
                    "spg": {"value": None, "description": "Steals per game"},
                    "bpg": {"value": None, "description": "Blocks per game"},
                    "tpg": {"value": None, "description": "Turnovers per game"},
                    "fpg": {"value": None, "description": "Fouls per game"},
                    "ppg": {"value": None, "description": "Points per game"},
                },
                "visual_attributes": {
                    "accessory": "SLEEVE_GREEN",
                    "balls": "CHROME",
                    "exo_shell": "MATTE_BLUE",
                    "finger_tips": "FINGER_TIPS_CHROME",
                    "hair": "CLEAN",
                    "jersey_trim": "GOLD",
                    "background": "GREY",
                    "ear_plate": "GREEN",
                    "face": "FACE_STEEL",
                    "guts": "SMOKED",
                    "jersey": "GREY",
                    "ensemble": None,
                },
                "attributes": {
                    "three_pt_rating": None,
                    "interior_2pt_rating": 47.2566221354,
                    "midrange_2pt_rating": None,
                    "ft_rating": None,
                    "drb_rating": None,
                    "orb_rating": None,
                    "ast_rating": 46.2521758111,
                    "physicality_rating": None,
                    "interior_defense_rating": None,
                    "perimeter_defense_rating": None,
                    "longevity_rating": 56.0732568468,
                    "hustle_rating": 49.5427186086,
                    "bball_iq_rating": None,
                    "leadership_rating": None,
                    "coachability_rating": None,
                },
                "top_attributes": [
                    "leadership_rating",
                    "midrange_2pt_rating",
                    "perimeter_defense_rating",
                ],
                "created_at": "2022-12-02T02:31:06.896826Z",
                "updated_at": "2023-01-18T18:28:32.457592Z",
            },
        ],
    )

    simulator.processing.sync_players()

    assert len(patched_retrieve_players.call_args_list) == 1
    assert simulator.models.Player.objects.all().count() == 1

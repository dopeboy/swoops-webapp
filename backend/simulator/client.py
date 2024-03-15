import abc
import json
import pathlib
from uuid import uuid4

import ddf
import requests
from django.conf import settings
from django.core.cache import caches
from django.forms.models import model_to_dict
from django.utils.module_loading import import_string

API = settings.SIMULATOR_API_ROOT


def get():
    """Gets the simulator client"""
    return import_string(settings.SIMULATOR_CLIENT)()


class BaseClient(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def players(self):
        pass

    @abc.abstractmethod
    def create_game(self, *, lineup_1_players, lineup_2_players, is_published):
        pass

    @abc.abstractmethod
    def retrieve_game(self, uuid):
        pass

    @abc.abstractmethod
    def retrieve_player_stats(self, uuids):
        pass

    @abc.abstractmethod
    def update_player_name(self, token, full_name):
        pass

    @abc.abstractmethod
    def publish_games(self, game_uuids):
        pass


class Client(BaseClient):
    def players(self):
        """
        Return all player data
        """
        results = []
        player_api = f"{API}/api/swoops/player?page_size=1000"

        while True:
            resp = requests.get(player_api)
            resp.raise_for_status()

            resp_json = resp.json()
            results.extend(resp_json["results"])

            if resp_json["next"]:
                player_api = resp_json["next"]
            else:
                break

        return results

    def create_game(self, *, lineup_1_players, lineup_2_players, is_published):
        game_data = {
            "challenger_player_one": str(lineup_1_players[0]),
            "challenger_player_two": str(lineup_1_players[1]),
            "challenger_player_three": str(lineup_1_players[2]),
            "challenger_player_four": str(lineup_1_players[3]),
            "challenger_player_five": str(lineup_1_players[4]),
            "challenged_player_one": str(lineup_2_players[0]),
            "challenged_player_two": str(lineup_2_players[1]),
            "challenged_player_three": str(lineup_2_players[2]),
            "challenged_player_four": str(lineup_2_players[3]),
            "challenged_player_five": str(lineup_2_players[4]),
            "is_published": is_published,
        }
        resp = requests.post(f"{API}/api/swoops/simulate-game", json=game_data)
        resp.raise_for_status()

        return resp.json()

    def retrieve_game(self, uuid):
        resp = requests.get(f"{API}/api/swoops/game", params={"uuid": str(uuid)})
        resp.raise_for_status()
        return resp.json()

    def retrieve_player_stats(self, uuids=[]):
        params = {"player_uuids": ",".join(uuids)}
        resp = requests.get(f"{API}/api/swoops/player-stats/v2", params=params)
        resp.raise_for_status()
        return resp.json()

    def update_player_name(self, token, full_name):
        resp = requests.post(
            f"{API}/api/swoops/update-player-name",
            json={"token": token, "full_name": full_name},
        )
        resp.raise_for_status()
        return resp.json()

    def update_player_token(self, canonical, updated_token):
        resp = requests.post(
            f"{API}/api/swoops/update-player-token",
            json={"canonical": canonical, "new_token": updated_token},
        )
        resp.raise_for_status()
        return resp.json()

    def publish_games(self, game_uuids):
        resp = requests.post(
            f"{API}/api/swoops/publish-games",
            data={"game_uuids": game_uuids},
        )
        resp.raise_for_status()
        return resp.json()


class MockClient(BaseClient):
    PLAYER_UUIDS = [
        "226ebf20-cdb9-42b4-b779-340d72637476",
        "55c2daee-ba69-4e3f-a73b-16be7a5b7332",
        "05ff9c18-0ba8-40e7-a09c-c6946043ef77",
        "c8151c92-6f5d-4662-9fe8-882b51da7a08",
        "925442dd-3448-4061-ad91-ab6ff7237f13",
        "5ac894f4-62ec-4de6-b1ff-de41d7e8cc40",
        "dbe35b1e-551b-43f8-8277-ac2950685124",
        "59868c69-aa7c-485e-bade-6e924dc87e9c",
        "b71eb193-a972-4224-8a79-3d1b1e0f90c5",
        "60689d6d-cd33-42ef-aadf-72bfeed066c2",
        "330951b2-64bf-4174-a5fb-58bdab404e94",
        "ca6f8a1b-1f25-4369-b740-9d681831ae3e",
        "904478ea-e5a2-475a-ad6e-3cf111a3d62b",
        "0ea18280-12ac-4abf-bd5d-788f8f6e2c7b",
        "f29e0d67-f16d-441c-a2f7-7ac2b0cc6403",
    ]

    def players(self):
        fake_player = [
            {
                "uuid": "090bf6c9-f7b7-448f-8753-c484387e83c7",
                "full_name": "Will Slaprock",
                "canonical": "swoopster-99",
                "token": 500,
                "positions": ["C", "F"],
                "age": 7.0,
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
                    "accessory": "VISOR",
                    "balls": "CHROME",
                    "exo_shell": "MATTE_GREEN",
                    "finger_tips": "FINGER_TIPS_CHROME",
                    "hair": "MOHAWK_BLUE",
                    "jersey_trim": "GREEN",
                    "background": "BLUE",
                    "ear_plate": "GOLD",
                    "face": "FACE_BLUE_DIP",
                    "guts": "SILVER",
                    "jersey": "PURPLE",
                },
                "attributes": {
                    "three_pt_rating": 52.2837943457,
                    "interior_2pt_rating": 69.4586862818,
                    "midrange_2pt_rating": None,
                    "ft_rating": None,
                    "drb_rating": 57.5753043195,
                    "orb_rating": 91.3331329326,
                    "ast_rating": 42.4898009474,
                    "physicality_rating": None,
                    "interior_defense_rating": 62.6485767275,
                    "perimeter_defense_rating": 60.9858495673,
                    "longevity_rating": None,
                    "hustle_rating": None,
                    "bball_iq_rating": None,
                    "leadership_rating": None,
                    "coachability_rating": None,
                },
                "top_attributes": [
                    "orb_rating",
                    "midrange_2pt_rating",
                    "interior_2pt_rating",
                ],
                "created_at": "2022-09-21T23:42:00.281069Z",
                "updated_at": "2022-09-21T23:42:00.281092Z",
            }
        ]

        return fake_player

    def create_game(self, *, lineup_1_players, lineup_2_players, is_published):
        return {"uuid": uuid4()}

    def retrieve_game(self, uuid):
        player_boxscores = ddf.N("simulator.BoxScore", n=10)
        lineup_boxscores = ddf.N("simulator.BoxScore", n=2)

        return {
            "status": "FINISHED",
            "result": {
                "challenged_boxscore": [
                    model_to_dict(player_boxscores[i]) | {"uuid": player_uuid}
                    for i, player_uuid in enumerate(self.PLAYER_UUIDS[:5])
                ],
                "challengers_boxscore": [
                    model_to_dict(player_boxscores[i]) | {"uuid": player_uuid}
                    for i, player_uuid in enumerate(self.PLAYER_UUIDS[5:10])
                ],
                "totals": [
                    model_to_dict(lineup_boxscores[0]) | {"Team": "Challengers"},
                    model_to_dict(lineup_boxscores[1]) | {"Team": "Challenged"},
                ],
            },
        }

    def retrieve_player_stats(self, uuids=[]):
        return {
            "player_uuids": ["090bf6c9-f7b7-448f-8753-c484387e83c7"],
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
                    "player_uuid": "090bf6c9-f7b7-448f-8753-c484387e83c7",
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
        }

    def update_player_name(self, canonical, full_name):
        return {
            "uuid": "2fe6528a-26f6-4cac-ae00-070e3304c0d8",
            "canonical": "swoopster-99",
            "full_name": "SWOOPSTER-99",
        }

    def update_player_token(self, canonical, updated_token):
        return {"token": 5}

    def publish_games(self, game_uuids):
        return {
            "game_uuids": [
                "0ba9dac9-e104-4df5-903b-a27d52bec4b2",
                "7f1745ca-cca0-463b-a1e8-1a6319d3baac",
                "444315c8-7631-44e2-a70e-13cc5215a6c2",
                "bd7cc8e8-c16f-4d24-8053-6ce2f60c2a9f",
                "ee3d1dc8-65ca-46b9-8ae1-e685287fca4e",
            ],
            "is_published": True,
        }


class MockIntegrationClient(BaseClient):
    EXAMPLE_PLAY_BY_PLAY = (
        pathlib.Path(__file__).parent / "resources" / "example-play-by-play.json"
    )
    PLAY_BY_PLAY = ""

    BASE_UUID = "-0000-0000-0000-000000000000"
    FREE_AGENT_UUIDS = [
        "aaaaaaaa-cdb9-42b4-b779-340d72637476",
        "aaaaaaaa-ba69-4e3f-a73b-16be7a5b7332",
        "aaaaaaaa-0ba8-40e7-a09c-c6946043ef77",
        "aaaaaaaa-6f5d-4662-9fe8-882b51da7a08",
        "aaaaaaaa-3448-4061-ad91-ab6ff7237f13",
        "aaaaaaaa-62ec-4de6-b1ff-de41d7e8cc40",
        "aaaaaaaa-551b-43f8-8277-ac2950685124",
        "aaaaaaaa-aa7c-485e-bade-6e924dc87e9c",
        "aaaaaaaa-a972-4224-8a79-3d1b1e0f90c5",
        "aaaaaaaa-cd33-42ef-aadf-72bfeed066c2",
        "aaaaaaaa-64bf-4174-a5fb-58bdab404e94",
        "aaaaaaaa-1f25-4369-b740-9d681831ae3e",
        "aaaaaaaa-e5a2-475a-ad6e-3cf111a3d62b",
        "aaaaaaaa-12ac-4abf-bd5d-788f8f6e2c7b",
        "aaaaaaaa-f16d-441c-a2f7-7ac2b0cc6403",
    ]

    def _load_play_by_play(self):
        if self.PLAY_BY_PLAY == "":
            with open(self.EXAMPLE_PLAY_BY_PLAY, encoding="utf-8") as f:
                self.PLAY_BY_PLAY = json.loads(f.read())
        return self.PLAY_BY_PLAY

    def players(self):
        total_supply = 100
        fake_players = [
            self.build_player(
                uuid=f"{i:08}" + self.BASE_UUID,
                name="GeneratedSwoopster-" + str(i),
                token_id=i,
            )
            for i in range(total_supply)
        ]

        fake_players += [
            self.build_player(
                uuid=player_uuid, name="FreeAgent-" + str(i), token_id=None
            )
            for i, player_uuid in enumerate(self.FREE_AGENT_UUIDS)
        ]

        return {"results": [player for player in fake_players], "next": None}

    def build_player(self, uuid, name, token_id):
        return {
            "uuid": uuid,
            "token": token_id,
            "full_name": name,
            "first_name": "",
            "last_name": "",
            "canonical": self.build_canonical_name(name),
            "positions": ["C", "F"],
            "age": 7.0,
            "star_rating": 1.0,
            "height": 80,
            "weight": 88,
            "free_agent": False,
            "stats": {
                "wins": 6,
                "losses": 7,
                "g": 13,
                "fg": 13,
                "fga": 18,
                "fg_pct": 0.72,
                "three_p": 3,
                "three_pa": 4.2,
                "three_p_pct": 0.75,
                "two_p": 10,
                "two_pa": 14,
                "two_p_pct": 0.71,
                "ft": None,
                "fta": 0,
                "ft_pct": 0.0,
                "orpg": 1.0,
                "drpg": 4.0,
                "rpg": 5.4,
                "apg": 1.1,
                "spg": 0,
                "bpg": None,
                "tpg": 0.7,
                "fpg": 67,
                "ppg": 6.7,
            },
            "visual_attributes": {
                "accessory": "VISOR",
                "balls": "CHROME",
                "exo_shell": "MATTE_GREEN",
                "finger_tips": "FINGER_TIPS_CHROME",
                "hair": "MOHAWK_BLUE",
                "jersey_trim": "GREEN",
                "background": "BLUE",
                "ear_plate": "GOLD",
                "face": "FACE_BLUE_DIP",
                "guts": "SILVER",
                "jersey": "PURPLE",
                "ensemble": None,
            },
            "attributes": {
                "three_pt_rating": 52.2837943457,
                "interior_2pt_rating": 69.4586862818,
                "midrange_2pt_rating": None,
                "ft_rating": None,
                "drb_rating": 57.5753043195,
                "orb_rating": 91.3331329326,
                "ast_rating": 42.4898009474,
                "physicality_rating": None,
                "interior_defense_rating": 62.6485767275,
                "perimeter_defense_rating": 60.9858495673,
                "longevity_rating": None,
                "hustle_rating": None,
                "bball_iq_rating": None,
                "leadership_rating": None,
                "coachability_rating": None,
            },
            "top_attributes": [
                "orb_rating",
                "midrange_2pt_rating",
                "interior_2pt_rating",
            ],
            "created_at": "2022-09-21T23:42:00.281069Z",
            "updated_at": "2022-09-21T23:42:00.281092Z",
        }

    def build_canonical_name(self, player_uuid):
        return str(player_uuid) + "-canconical"

    def as_dict_without_id(self, obj):
        d = model_to_dict(obj)
        d.pop("id")
        return d

    def create_game(self, *, lineup_1_players, lineup_2_players, is_published):
        cache = caches["default"]
        game_uuid = uuid4()
        cache.add(
            game_uuid,
            value={
                "lineup1": lineup_1_players,  # challenged
                "lineup2": lineup_2_players,  # challengers
                "is_published": is_published,
            },
        )

        return {"uuid": game_uuid}

    def retrieve_game(self, uuid):
        cache = caches["default"]

        lineups = cache.get(uuid)
        challenged_players = lineups["lineup1"]
        challengers_players = lineups["lineup2"]

        player_aggregate_stats_boxscores = ddf.N(
            "simulator.HistoricalPlayerStats",
            n=10,
            fill_nullable_fields=True,
            player=None,
        )
        player_boxscores = ddf.N("simulator.BoxScore", n=10, fill_nullable_fields=True)
        lineup_boxscores = ddf.N("simulator.BoxScore", n=2, fill_nullable_fields=True)

        players_aggregate_stats = {}
        combined_boxscores = []
        challenged_boxscores = []

        for index, player_uuid in enumerate(challenged_players):
            canconical_name = self.build_canonical_name(player_uuid)

            generated_player_stats = model_to_dict(
                player_aggregate_stats_boxscores[index]
            )
            generated_player_stats |= {"uuid": str(player_uuid)}
            generated_player_stats["g"] = (
                generated_player_stats["wins"] + generated_player_stats["losses"]
            )
            players_aggregate_stats[canconical_name] = generated_player_stats

            challenged_boxscores.append(
                self.as_dict_without_id(player_boxscores[index])
                | {
                    "uuid": player_uuid,
                    "canonical": canconical_name,
                }
            )

            combined_boxscores.append(
                self.as_dict_without_id(player_boxscores[index])
                | {
                    "Team": "Challengers",
                    "canonical": canconical_name,
                }
            )

        challengers_boxscores = []
        for index, player_uuid in enumerate(challengers_players):
            canconical_name = self.build_canonical_name(player_uuid)

            generated_player_stats = self.as_dict_without_id(
                player_aggregate_stats_boxscores[5 + index]
            )
            generated_player_stats |= {"uuid": str(player_uuid)}
            generated_player_stats["g"] = (
                generated_player_stats["wins"] + generated_player_stats["losses"]
            )
            players_aggregate_stats[canconical_name] = generated_player_stats

            challengers_boxscores.append(
                self.as_dict_without_id(player_boxscores[5 + index])
                | {
                    "uuid": player_uuid,
                    "canonical": canconical_name,
                }
            )

            combined_boxscores.append(
                self.as_dict_without_id(player_boxscores[5 + index])
                | {
                    "Team": "Challenged",
                    "canonical": canconical_name,
                }
            )

        result = {
            "uuid": uuid,
            "status": "FINISHED",
            "result": {
                "totals": [
                    self.as_dict_without_id(lineup_boxscores[0])
                    | {"Team": "Challengers"},  # noqa: 501
                    self.as_dict_without_id(lineup_boxscores[1])
                    | {"Team": "Challenged"},  # noqa: 501
                ],
                "pbp": self._load_play_by_play(),
                "players": players_aggregate_stats,
                "challenged_boxscore": challengers_boxscores,
                "challengers_boxscore": challenged_boxscores,
                "combined_boxscore": combined_boxscores,
            },
        }

        cache.delete(uuid)
        return result

    def retrieve_player_stats(self, uuids):
        player_aggregate_stats_boxscores = ddf.N(
            "simulator.HistoricalPlayerStats",
            n=len(uuids) + 1,
            fill_nullable_fields=True,
            player=None,
        )

        all_generated_stats = []
        for index, player_uuid in enumerate(uuids):
            generated_player_stats = self.as_dict_without_id(
                player_aggregate_stats_boxscores[index]
            )
            generated_player_stats |= {"player_uuid": player_uuid}
            generated_player_stats["g"] = (
                generated_player_stats["wins"] + generated_player_stats["losses"]
            )
            all_generated_stats.append(generated_player_stats)

        return {"player_uuids": uuids, "results": all_generated_stats}

    def update_player_name(self, token, full_name):
        # the simulator would return things that this request cant know about
        # just die instead of trying to make it work
        raise NotImplementedError()

    def publish_games(self, game_uuids):
        return {"game_uuids": game_uuids, "is_published": True}

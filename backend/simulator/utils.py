import game.models
import simulator.models


def update_simulator_player_stats(simulator_client, player_uuids):
    # update and insert player simulated stats
    simulator_player_fields = {
        field.name for field in simulator.models.Player._meta.fields
    }

    game_player_fields = {field.name for field in game.models.Player._meta.fields}

    result = simulator_client.retrieve_player_stats(
        uuids=player_uuids,
    )

    for player_stats in result["results"]:

        # insert game player stats
        game.models.Player.objects.filter(
            simulated__uuid=player_stats["player_uuid"]
        ).update(
            **{
                key: player_stats[key]
                for key in player_stats
                if key in game_player_fields
            },
        )

        # update simulator player stats
        simulator.models.Player.objects.filter(uuid=player_stats["player_uuid"]).update(
            **{
                key: player_stats[key]
                for key in player_stats
                if key in simulator_player_fields
            },
        )


def update_team_stats(simulation_obj):
    # insert win / loss count in team
    team_1 = simulation_obj.game.lineup_1.team
    team_2 = simulation_obj.game.lineup_2.team

    if (
        simulation_obj.result.lineup_1_box_score.pts
        > simulation_obj.result.lineup_2_box_score.pts
    ):
        team_1.wins += 1
        team_1.save()

        team_2.losses += 1
        team_2.save()
    else:
        team_1.losses += 1
        team_1.save()

        team_2.wins += 1
        team_2.save()


def is_winner(team, result):
    other_team = {"Challengers": "Challenged", "Challenged": "Challengers"}
    boxscore_by_team = {boxscore["Team"]: boxscore for boxscore in result["totals"]}
    my_boxscore = boxscore_by_team[team]
    other_boxscore = boxscore_by_team[other_team[team]]
    return my_boxscore["pts"] > other_boxscore["pts"]


def insert_player_game_stats_entries(simulation, result):
    # Delete old entries if/when simulating a game again
    simulator.models.PlayerGameStats.objects.filter(simulation=simulation.uuid).delete()
    # Insert new entries
    instances = []
    for player_boxscore in result["combined_boxscore"]:
        player_uuid = result["players"][player_boxscore["canonical"]]["uuid"]
        player_team = player_boxscore["Team"]
        won = is_winner(player_team, result)
        my_entry = {
            "player_id": player_uuid,
            "simulation_id": simulation.uuid,
            "won": won,
            "fg": player_boxscore["fg"],
            "ft": player_boxscore["ft"],
            "pf": player_boxscore["pf"],
            "ast": player_boxscore["ast"],
            "blk": player_boxscore["blk"],
            "drb": player_boxscore["drb"],
            "fga": player_boxscore["fga"],
            "fta": player_boxscore["fta"],
            "orb": player_boxscore["orb"],
            "pts": player_boxscore["pts"],
            "stl": player_boxscore["stl"],
            "tov": player_boxscore["tov"],
            "trb": player_boxscore["trb"],
            "two_p": player_boxscore["two_p"],
            "fg_pct": player_boxscore["fg_pct"],
            "ft_pct": player_boxscore["ft_pct"],
            "two_pa": player_boxscore["two_pa"],
            "three_p": player_boxscore["three_p"],
            "three_pa": player_boxscore["three_pa"],
            "two_p_pct": player_boxscore["two_p_pct"],
            "three_p_pct": player_boxscore["three_p_pct"],
        }
        instance = simulator.models.PlayerGameStats(**my_entry)
        instances.append(instance)
    simulator.models.PlayerGameStats.objects.bulk_create(instances)


def _get_team(team, simulation):
    return {
        "Challengers": simulation.game.lineup_1.team,
        "Challenged": simulation.game.lineup_2.team,
    }[team]


def insert_team_game_stats_entries(simulation, result):
    # Delete old entries if/when simulating a game again
    simulator.models.TeamGameStats.objects.filter(simulation=simulation.uuid).delete()
    # Insert new entries
    instances = []
    for team_boxscore in result["totals"]:
        team = team_boxscore["Team"]
        won = is_winner(team, result)
        my_entry = {
            "team_id": _get_team(team, simulation).id,
            "simulation_id": simulation.uuid,
            "won": won,
            "fg": team_boxscore["fg"],
            "ft": team_boxscore["ft"],
            "pf": team_boxscore["pf"],
            "ast": team_boxscore["ast"],
            "blk": team_boxscore["blk"],
            "drb": team_boxscore["drb"],
            "fga": team_boxscore["fga"],
            "fta": team_boxscore["fta"],
            "orb": team_boxscore["orb"],
            "pts": team_boxscore["pts"],
            "stl": team_boxscore["stl"],
            "tov": team_boxscore["tov"],
            "trb": team_boxscore["trb"],
            "two_p": team_boxscore["two_p"],
            "fg_pct": team_boxscore["fg_pct"],
            "ft_pct": team_boxscore["ft_pct"],
            "two_pa": team_boxscore["two_pa"],
            "three_p": team_boxscore["three_p"],
            "three_pa": team_boxscore["three_pa"],
            "two_p_pct": team_boxscore["two_p_pct"],
            "three_p_pct": team_boxscore["three_p_pct"],
        }
        instance = simulator.models.TeamGameStats(**my_entry)
        instances.append(instance)
    simulator.models.TeamGameStats.objects.bulk_create(instances)

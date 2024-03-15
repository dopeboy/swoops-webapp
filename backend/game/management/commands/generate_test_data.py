import argparse
import json
import logging
import random
import secrets
import uuid
from itertools import permutations

import friendlywords
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db.models.aggregates import Max, Min
from django.utils import timezone
from web3 import Account, Web3

import eth.models
import game.models
import simulator.models
from game.utils import (
    build_tournament_structure,
    calculate_round_count,
    calculate_series_count,
)

LOGGER = logging.getLogger(__name__)

friendlywords.preload()


class Command(BaseCommand):
    help = "Generate player data"

    def add_arguments(self, parser):
        parser.add_argument(
            "-w",
            "--wallet",
            dest="wallet",
            help="The wallet to link the generated data to",
            required=True,
        )

        parser.add_argument(
            "-o",
            "--opponent",
            dest="opponent",
            default="0xffffffffffffffffffffffffffffffffffffffff",
            help="The wallet address of the opponent ",
        )

        parser.add_argument(
            "--generate-players",
            dest="generate-players",
            required=True,
            action=argparse.BooleanOptionalAction,
            help="When True, players will be generated and assigned to wallet and "
            + "opponent. When false (--no-generate-players) existing players will "
            + "be allocated.",
        )

    def generate_random_wallet(self):
        return Account.from_key("0x" + secrets.token_hex(32)).address

    def build_tournament(
        self,
        kind=game.models.Tournament.Kind.IN_SEASON,
        tokens_required=5,
        size=4,
        meta=None,
        is_public=False,
    ):
        tournament_count = game.models.Tournament.objects.all().count()

        contest = game.models.Contest(
            kind=game.models.Contest.Kind.TOURNAMENT,
            tokens_required=tokens_required,
            status=game.models.Contest.Status.COMPLETE
            if is_public
            else game.models.Contest.Status.OPEN,
            played_at=timezone.now() - timezone.timedelta(days=2),
        )
        contest.save()
        tournament = game.models.Tournament(
            name=(
                f"{game.models.Tournament.Kind.IN_SEASON.lower()} Tournament"
                f" {tournament_count + 1}"
            ),
            kind=kind,
            contest=contest,
            size=size,
            payout=100,
            meta=json.dumps(
                meta
                or {
                    "payout_breakdown_usd": [100],
                    "max_games_per_round": [1, 1],
                }
            ),
            lineup_submission_start=timezone.now() - timezone.timedelta(days=2),
            lineup_submission_cutoff=timezone.now() + timezone.timedelta(days=365),
            lineup_reveal_date=timezone.now() - timezone.timedelta(days=365)
            if is_public
            else timezone.now() + timezone.timedelta(days=365),
            start_date=timezone.now() - timezone.timedelta(days=2),
            end_date=timezone.now() - timezone.timedelta(days=2)
            if is_public
            else timezone.now() + timezone.timedelta(days=365),
            visibility_at=timezone.now() - timezone.timedelta(days=2),
            populate_entry_lineups=is_public,
            public_publish_datetime=timezone.now() - timezone.timedelta(days=2)
            if is_public
            else None,
        )
        tournament.save()

        return tournament

    def generate_tournament_entry(self, tournament, team, seed):
        entry_count = game.models.TournamentEntry.objects.all().count()
        lineup = game.models.Lineup.objects.all().order_by("?").first()

        entry = game.models.TournamentEntry(
            tournament=tournament,
            team=team,
            lineup=lineup,
            rank=entry_count + 1,
            seed=seed,
        )
        entry.save()

        return entry

    def build_tournament_round(self, tournament, round, status=None):
        if status is None:
            status = game.models.Round.Status.FINISHED

        round = game.models.Round.objects.create(
            status=status, tournament=tournament, stage=round
        )
        return round

    def build_tournament_series(
        self, tournament_entry1, tournament_entry2, round, order=None, status=None
    ):
        if status is None:
            status = game.models.Series.Status.FINISHED

        return game.models.Series.objects.create(
            status=status,
            round=round,
            order=order or 0,
            entry_1=tournament_entry1,
            entry_2=tournament_entry2,
        )

    def generate_tournament_entries(self, tournament, winner, other_entrants):
        # the last entrant in the list is the overall winner
        entrants = other_entrants + [winner]

        entries = []
        for i, entrant in enumerate(entrants):
            entry = game.models.TournamentEntry(
                tournament=tournament,
                team=entrant.team,
                lineup=self.compose_lineup(entrant),
                rank=i + 1,
                seed=i + 1,
            )
            entry.save()
            entries.append(entry)

        return entries

    def build_completed_tournament(self, winner, *other_entrants):
        tournament = self.build_tournament(
            size=len(other_entrants) + 1,
            is_public=True,
            meta={
                "payout_breakdown_usd": [100],
                "max_games_per_round": [3, 3],
            },
        )
        tournament.finalized_on = timezone.now()
        tournament.save()

        entries = self.generate_tournament_entries(
            tournament, winner, list(other_entrants)
        )

        round_count = calculate_round_count(tournament.size)
        games_in_series = 3

        # when tournaments are created this way, in a series with 2 participants, the
        # owner of lineup2 always wins. The winner of the whole tournament is the last
        # entry in the list of tournament_entries.
        for i in range(0, round_count):
            tournament_round = self.build_tournament_round(tournament, i)
            series_count = calculate_series_count(tournament.size, i)
            team_offset = int(2**i) - 1

            for _ in range(0, series_count):
                entry_1 = entries[team_offset]
                entry_2 = entries[team_offset + int(2**i)]

                team_offset += 2 * int(2**i)

                series = self.build_tournament_series(
                    entry_1, entry_2, tournament_round
                )

                for k in range(0, games_in_series):
                    game = self.generate_finished_game(
                        entry_1.lineup,
                        entry_2.lineup,
                        lineup1_wins=False if k % 2 == 0 else True,
                    )
                    series.games.add(game)

    def generate_player_name(self):
        for _ in range(100):
            name = friendlywords.generate("po")
            if len(name) <= 16:
                return name

        raise Exception(
            "We can only generate player names that are 16 characters or"
            + " less, and the library we use to generate names keeps"
            + " giving us names that are too long. We dont want to infinite"
            + " loop, so please run this command again."
        )

    def generate_team_name(self):
        for _ in range(100):
            name = friendlywords.generate("pt")
            if len(name) <= 16:
                return name

        raise Exception(
            "We can only generate player names that are 16 characters or"
            + " less, and the library we use to generate names keeps"
            + " giving us names that are too long. We dont want to infinite"
            + " loop, so please run this command again."
        )

    def generate_simulator_player(self, token_id, position1=None, position2=None):
        if position1 is None:
            position1 = simulator.models.PlayerPosition.CENTER
        if position2 is None:
            position2 = simulator.models.PlayerPosition.FORWARD

        playername = self.generate_player_name()
        return simulator.models.Player(
            token=token_id,
            uuid=uuid.uuid4(),
            age=4,
            star_rating=3,
            full_name=playername.title(),
            canonical=playername.replace(" ", "-").lower(),
            position_1=position1,
            position_2=position2,
            two_p_pct=10.9999999900,
            ft_rating=66.3333330000,
            three_pt_rating=44.7777777770,
            top_attribute_1="ft_rating",
            top_attribute_2="three_pt_rating",
            top_attribute_3="interior_2pt_rating",
        )

    def generate_player(self, token_id, position1=None, position2=None):
        sim_player = self.generate_simulator_player(token_id, position1, position2)
        sim_player.save()
        game_player = game.models.Player(simulated=sim_player)
        game_player.save()
        return game_player

    def get_largest_token_id(self):
        largest_token = (
            simulator.models.Player.objects.all()
            .values("token")
            .aggregate(max_token=Max("token"))["max_token"]
        )

        return 0 if largest_token is None else largest_token

    def get_or_create_user_and_team(self, wallet):
        checksummed_wallet = Web3.toChecksumAddress(wallet)
        user, _ = get_user_model().objects.get_or_create(
            wallet_address=checksummed_wallet
        )
        user.is_verified = True
        user.email = "user+{}@playswoops.com".format(wallet)
        user.email_verification_token = uuid.uuid4()
        user.save()
        team, _ = game.models.Team.objects.get_or_create(owner=user)
        if team.name is None or team.name == "":
            team.name = self.generate_team_name()
            team.save()
        return user, team

    def init_user_and_assign_players(self, wallet, number_of_players_needed):
        checksummed_wallet = Web3.toChecksumAddress(wallet)
        user, team = self.get_or_create_user_and_team(checksummed_wallet)

        number_of_players_owned_by_this_user = (
            game.models.Player.objects.players_owned_by_user(user.id).count()
        )

        if number_of_players_owned_by_this_user >= number_of_players_needed:
            return user

        assignable_players = (
            game.models.Player.objects.all()
            .select_related("simulated")
            .filter(simulated__token__gte=0, team_id__isnull=True)
        )

        if number_of_players_owned_by_this_user < number_of_players_needed:
            # check to make sure we have sufficent players to assign
            if len(assignable_players) < (
                number_of_players_needed - number_of_players_owned_by_this_user
            ):
                raise Exception(
                    "There aren't enough assignable players to complete this request."
                )

        for i in range(number_of_players_needed - number_of_players_owned_by_this_user):
            assignable_players[i].team = team
            assignable_players[i].save()

            eth.models.Transfer(
                to_address=checksummed_wallet,
                from_address="0x0000000000000000000000000000000000000000",
                token=assignable_players[i].simulated.token,
                block=int(timezone.now().strftime("%y%j%H%M")),
                tx_hash=timezone.now().strftime("%Y%m%d%H%M%S%f"),
                log_index=i,
            ).save()

        return user

    def init_user_and_generate_players(self, wallet, number_of_players_to_generate):
        checksummed_wallet = Web3.toChecksumAddress(wallet)
        user, team = self.get_or_create_user_and_team(checksummed_wallet)

        number_of_players_owned_by_this_user = (
            game.models.Player.objects.players_owned_by_user(user.id).count()
        )

        largest_token = self.get_largest_token_id()

        possible_positions = list(
            permutations([e for e in simulator.models.PlayerPosition], 2)
        )
        if number_of_players_owned_by_this_user < number_of_players_to_generate:
            for i in range(
                number_of_players_to_generate - number_of_players_owned_by_this_user
            ):
                largest_token = largest_token + 1
                positions = possible_positions[i % len(possible_positions)]
                player = self.generate_player(largest_token, positions[0], positions[1])
                player.team = team
                player.save()

                eth.models.Transfer(
                    to_address=checksummed_wallet,
                    from_address="0x0000000000000000000000000000000000000000",
                    token=largest_token,
                    block=int(timezone.now().strftime("%y%j%H%M")),
                    tx_hash=timezone.now().strftime("%Y%m%d%H%M%S%f"),
                    log_index=i,
                ).save()

        return user

    def build_game_reservation(self, game_obj, team, expires_at=None):
        return game.models.Reservation.objects.create(
            game=game_obj,
            team=team,
            expires_at=timezone.now() if expires_at is None else expires_at,
        )

    def compose_lineup(self, user, free_agents_to_use=[]):
        owned_players = list(
            game.models.Player.objects.players_owned_by_user(user.id).order_by("id")
        )

        players = []
        players.extend(free_agents_to_use)
        players.extend(owned_players)

        lineup = game.models.Lineup(
            team=user.team,
            player_1=players[0],
            player_2=players[1],
            player_3=players[2],
            player_4=players[3],
            player_5=players[4],
        )

        lineup.save()

        return lineup

    def generate_open_game(self, lineup1=None, lineup2=None):
        contest = game.models.Contest(
            kind=game.models.Contest.Kind.HEAD_TO_HEAD,
        )
        contest.save()

        g = game.models.Game(contest=contest, lineup_1=lineup1, lineup_2=lineup2)
        g.save()

        return g

    def build_box_score(self):
        score = simulator.models.BoxScore(
            ast=random.randint(0, 15),
            blk=random.randint(0, 10),
            drb=random.randint(0, 15),
            fg=random.randint(0, 40),
            fg_pct=0.5,
            fga=random.randint(0, 40),
            ft=random.randint(0, 20),
            ft_pct=0.6,
            fta=random.randint(0, 10),
            orb=random.randint(0, 15),
            pf=random.randint(0, 20),
            pts=random.randint(0, 40),
            stl=random.randint(0, 5),
            three_p=random.randint(0, 20),
            three_p_pct=1.0,
            three_pa=random.randint(0, 20),
            tov=random.randint(0, 15),
            trb=random.randint(0, 15),
            two_p=random.randint(0, 20),
            two_p_pct=0.5,
            two_pa=random.randint(0, 20),
        )
        score.save()
        return score

    def build_result(self, lineup1_wins=True):
        result = simulator.models.Result(
            lineup_1_score=100 if lineup1_wins else 75,
            lineup_1_box_score=self.build_box_score(),
            lineup_1_player_1_box_score=self.build_box_score(),
            lineup_1_player_2_box_score=self.build_box_score(),
            lineup_1_player_3_box_score=self.build_box_score(),
            lineup_1_player_4_box_score=self.build_box_score(),
            lineup_1_player_5_box_score=self.build_box_score(),
            lineup_2_score=75 if lineup1_wins else 100,
            lineup_2_box_score=self.build_box_score(),
            lineup_2_player_1_box_score=self.build_box_score(),
            lineup_2_player_2_box_score=self.build_box_score(),
            lineup_2_player_3_box_score=self.build_box_score(),
            lineup_2_player_4_box_score=self.build_box_score(),
            lineup_2_player_5_box_score=self.build_box_score(),
        )
        result.save()
        return result

    def generate_play_by_play_feed(self, game_id):
        return [
            {
                "quarter": 1,
                "gameclock": "10:00",
                "possession": 1,
                "detail": "Start of Period",
                "time_remaining": 600.0,
                "challenged_score": 0,
                "challenger_score": 0,
            },
            {
                "quarter": 1,
                "gameclock": "9:44",
                "possession": 1,
                "detail": "Made Two by Derrick Rose from 7 feet",
                "time_remaining": 583.948619319,
                "challenged_score": 0,
                "challenger_score": 2,
            },
            {
                "quarter": 1,
                "gameclock": "9:44",
                "possession": 1,
                "detail": "Assisted by John Collins",
                "time_remaining": 583.948619319,
                "challenged_score": 0,
                "challenger_score": 2,
            },
            {
                "quarter": 1,
                "gameclock": "9:31",
                "possession": 2,
                "detail": "Missed Two by Kevin Durant from 12 feet",
                "time_remaining": 570.7437310821,
                "challenged_score": 0,
                "challenger_score": 2,
            },
            {
                "quarter": 1,
                "gameclock": "9:29",
                "possession": 2,
                "detail": "Defensive Rebound by Derrick Rose",
                "time_remaining": 568.7858984973,
                "challenged_score": 0,
                "challenger_score": 2,
            },
            {
                "quarter": 1,
                "gameclock": "9:26",
                "possession": 3,
                "detail": "Missed Two by John Collins from 3 feet",
                "time_remaining": 566.0889972833,
                "challenged_score": 0,
                "challenger_score": 2,
            },
            {
                "quarter": 1,
                "gameclock": "9:23",
                "possession": 3,
                "detail": "Defensive Rebound by Steve Nash",
                "time_remaining": 562.9699689186,
                "challenged_score": 0,
                "challenger_score": 2,
            },
            {
                "quarter": 1,
                "gameclock": "9:05",
                "possession": 4,
                "detail": "Missed Two by Kyrie Irving from 12 feet",
                "time_remaining": 545.2731278091,
                "challenged_score": 0,
                "challenger_score": 2,
            },
            {
                "quarter": 1,
                "gameclock": "9:02",
                "possession": 4,
                "detail": "Defensive Rebound by John Collins",
                "time_remaining": 541.8347107725,
                "challenged_score": 0,
                "challenger_score": 2,
            },
            {
                "quarter": 1,
                "gameclock": "8:58",
                "possession": 5,
                "detail": "Turnover by Clint Capela",
                "time_remaining": 537.5542643775,
                "challenged_score": 0,
                "challenger_score": 2,
            },
            {
                "quarter": 1,
                "gameclock": "8:44",
                "possession": 6,
                "detail": "Made Three by Kyrie Irving from 25 feet",
                "time_remaining": 524.0159499437,
                "challenged_score": 3,
                "challenger_score": 2,
            },
            {
                "quarter": 1,
                "gameclock": "8:27",
                "possession": 7,
                "detail": "Made Two by John Collins from 9 feet",
                "time_remaining": 507.0594448362,
                "challenged_score": 3,
                "challenger_score": 4,
            },
            {
                "quarter": 1,
                "gameclock": "8:15",
                "possession": 8,
                "detail": "Made Two by Nic Claxton from 4 feet",
                "time_remaining": 495.3859559775,
                "challenged_score": 5,
                "challenger_score": 4,
            },
            {
                "quarter": 1,
                "gameclock": "8:15",
                "possession": 8,
                "detail": "Assisted by Ben Simmons",
                "time_remaining": 495.3859559775,
                "challenged_score": 5,
                "challenger_score": 4,
            },
            {
                "quarter": 1,
                "gameclock": "8:05",
                "possession": 9,
                "detail": "Made Two by John Collins from 2 feet",
                "time_remaining": 485.1056812009,
                "challenged_score": 5,
                "challenger_score": 6,
            },
            {
                "quarter": 1,
                "gameclock": "8:05",
                "possession": 9,
                "detail": "Assisted by Derrick Rose",
                "time_remaining": 485.1056812009,
                "challenged_score": 5,
                "challenger_score": 6,
            },
            {
                "quarter": 1,
                "gameclock": "8:05",
                "possession": 9,
                "detail": "Shooting Foul on Nic Claxton",
                "time_remaining": 485.1056812009,
                "challenged_score": 5,
                "challenger_score": 6,
            },
            {
                "quarter": 1,
                "gameclock": "8:05",
                "possession": 9,
                "detail": "Made Free Throw by John Collins",
                "time_remaining": 485.1056812009,
                "challenged_score": 5,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:56",
                "possession": 10,
                "detail": "Made Two by Nic Claxton from 3 feet",
                "time_remaining": 476.0579343464,
                "challenged_score": 7,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:56",
                "possession": 10,
                "detail": "Assisted by Steve Nash",
                "time_remaining": 476.0579343464,
                "challenged_score": 7,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:52",
                "possession": 11,
                "detail": "Missed Three by John Collins from 25 feet",
                "time_remaining": 471.7106940637,
                "challenged_score": 7,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:50",
                "possession": 11,
                "detail": "Defensive Rebound by Kevin Durant",
                "time_remaining": 469.9383644723,
                "challenged_score": 7,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:38",
                "possession": 12,
                "detail": "Made Two by Kevin Durant from 7 feet",
                "time_remaining": 457.7532550477,
                "challenged_score": 9,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:38",
                "possession": 12,
                "detail": "Assisted by Ben Simmons",
                "time_remaining": 457.7532550477,
                "challenged_score": 9,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:20",
                "possession": 13,
                "detail": "Missed Two by Derrick Rose from 1 feet",
                "time_remaining": 440.0472898606,
                "challenged_score": 9,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:16",
                "possession": 13,
                "detail": "Defensive Rebound by Kevin Durant",
                "time_remaining": 435.9179790367,
                "challenged_score": 9,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:08",
                "possession": 14,
                "detail": "Missed Two by Steve Nash from 1 feet",
                "time_remaining": 427.5964122875,
                "challenged_score": 9,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:08",
                "possession": 14,
                "detail": "Block By Derrick Rose",
                "time_remaining": 427.5964122875,
                "challenged_score": 9,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "7:05",
                "possession": 14,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 424.9374393264,
                "challenged_score": 9,
                "challenger_score": 7,
            },
            {
                "quarter": 1,
                "gameclock": "6:51",
                "possession": 15,
                "detail": "Made Three by Pascal Siakam from 29 feet",
                "time_remaining": 411.4641787633,
                "challenged_score": 9,
                "challenger_score": 10,
            },
            {
                "quarter": 1,
                "gameclock": "6:51",
                "possession": 15,
                "detail": "Assisted by John Collins",
                "time_remaining": 411.4641787633,
                "challenged_score": 9,
                "challenger_score": 10,
            },
            {
                "quarter": 1,
                "gameclock": "6:38",
                "possession": 16,
                "detail": "Made Two by Nic Claxton from 3 feet",
                "time_remaining": 398.1717929786,
                "challenged_score": 11,
                "challenger_score": 10,
            },
            {
                "quarter": 1,
                "gameclock": "6:24",
                "possession": 17,
                "detail": "Made Two by Clint Capela from 5 feet",
                "time_remaining": 383.828918667,
                "challenged_score": 11,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "6:24",
                "possession": 17,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 383.828918667,
                "challenged_score": 11,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "6:24",
                "possession": 17,
                "detail": "Shooting Foul on Nic Claxton",
                "time_remaining": 383.828918667,
                "challenged_score": 11,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "6:24",
                "possession": 17,
                "detail": "Missed Free Throw by Clint Capela",
                "time_remaining": 383.828918667,
                "challenged_score": 11,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "6:21",
                "possession": 17,
                "detail": "Defensive Rebound by Kyrie Irving",
                "time_remaining": 380.8138095184,
                "challenged_score": 11,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "6:01",
                "possession": 18,
                "detail": "Made Two by Ben Simmons from 2 feet",
                "time_remaining": 360.9780700758,
                "challenged_score": 13,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "6:01",
                "possession": 18,
                "detail": "Assisted by Nic Claxton",
                "time_remaining": 360.9780700758,
                "challenged_score": 13,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "5:40",
                "possession": 19,
                "detail": "Missed Two by Clint Capela from 6 feet",
                "time_remaining": 339.7812817007,
                "challenged_score": 13,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "5:40",
                "possession": 19,
                "detail": "Block By Nic Claxton",
                "time_remaining": 339.7812817007,
                "challenged_score": 13,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "5:38",
                "possession": 19,
                "detail": "Offensive Rebound by Clint Capela",
                "time_remaining": 337.9610280538,
                "challenged_score": 13,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "5:30",
                "possession": 19,
                "detail": "Turnover by Derrick Rose",
                "time_remaining": 330.0020388068,
                "challenged_score": 13,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "5:16",
                "possession": 20,
                "detail": "Missed Two by Kevin Durant from 13 feet",
                "time_remaining": 315.5616928795,
                "challenged_score": 13,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "5:16",
                "possession": 20,
                "detail": "Block By Mike Conley",
                "time_remaining": 315.5616928795,
                "challenged_score": 13,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "5:14",
                "possession": 20,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 314.1095396105,
                "challenged_score": 13,
                "challenger_score": 12,
            },
            {
                "quarter": 1,
                "gameclock": "5:08",
                "possession": 21,
                "detail": "Made Two by Clint Capela from 4 feet",
                "time_remaining": 308.098014192,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "5:08",
                "possession": 21,
                "detail": "Assisted by John Collins",
                "time_remaining": 308.098014192,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "5:08",
                "possession": 21,
                "detail": "Shooting Foul on Nic Claxton",
                "time_remaining": 308.098014192,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "5:08",
                "possession": 21,
                "detail": "Missed Free Throw by Clint Capela",
                "time_remaining": 308.098014192,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "5:08",
                "possession": 21,
                "detail": "Defensive Rebound by Nic Claxton",
                "time_remaining": 307.6241617048,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "5:02",
                "possession": 22,
                "detail": "Missed Three by Steve Nash from 27 feet",
                "time_remaining": 301.7039139443,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "4:58",
                "possession": 22,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 297.5583733087,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "4:37",
                "possession": 23,
                "detail": "Missed Two by John Collins from 17 feet",
                "time_remaining": 276.9358950451,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "4:36",
                "possession": 23,
                "detail": "Defensive Rebound by Nic Claxton",
                "time_remaining": 276.1022931186,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "4:28",
                "possession": 24,
                "detail": "Missed Three by Kevin Durant from 29 feet",
                "time_remaining": 267.6799375424,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "4:24",
                "possession": 24,
                "detail": "Defensive Rebound by Mike Conley",
                "time_remaining": 263.7694174178,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "4:21",
                "possession": 25,
                "detail": "Missed Two by Pascal Siakam from 1 feet",
                "time_remaining": 260.8385539672,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "4:18",
                "possession": 25,
                "detail": "Defensive Rebound by Kevin Durant",
                "time_remaining": 257.9472772103,
                "challenged_score": 13,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "4:07",
                "possession": 26,
                "detail": "Made Two by Nic Claxton from 2 feet",
                "time_remaining": 247.3830771306,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "4:07",
                "possession": 26,
                "detail": "Assisted by Ben Simmons",
                "time_remaining": 247.3830771306,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "3:59",
                "possession": 27,
                "detail": "Missed Two by Clint Capela from 2 feet",
                "time_remaining": 239.4516266645,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "3:56",
                "possession": 27,
                "detail": "Offensive Rebound by Mike Conley",
                "time_remaining": 236.0933589613,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "3:49",
                "possession": 27,
                "detail": "Missed Three by Pascal Siakam from 26 feet",
                "time_remaining": 228.9077106164,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "3:45",
                "possession": 27,
                "detail": "Defensive Rebound by Nic Claxton",
                "time_remaining": 224.863095228,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "3:25",
                "possession": 28,
                "detail": "Missed Two by Steve Nash from 3 feet",
                "time_remaining": 205.0130397444,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "3:25",
                "possession": 28,
                "detail": "Block By Mike Conley",
                "time_remaining": 205.0130397444,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "3:23",
                "possession": 28,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 202.6910075447,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "3:21",
                "possession": 29,
                "detail": "Missed Three by Mike Conley from 27 feet",
                "time_remaining": 200.600967506,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "3:16",
                "possession": 29,
                "detail": "Offensive Rebound by Clint Capela",
                "time_remaining": 195.5948639286,
                "challenged_score": 15,
                "challenger_score": 14,
            },
            {
                "quarter": 1,
                "gameclock": "3:02",
                "possession": 29,
                "detail": "Made Two by Clint Capela from 4 feet",
                "time_remaining": 181.7018777797,
                "challenged_score": 15,
                "challenger_score": 16,
            },
            {
                "quarter": 1,
                "gameclock": "2:38",
                "possession": 30,
                "detail": "Missed Three by Kevin Durant from 29 feet",
                "time_remaining": 158.3474860333,
                "challenged_score": 15,
                "challenger_score": 16,
            },
            {
                "quarter": 1,
                "gameclock": "2:37",
                "possession": 30,
                "detail": "Defensive Rebound by John Collins",
                "time_remaining": 156.9421025889,
                "challenged_score": 15,
                "challenger_score": 16,
            },
            {
                "quarter": 1,
                "gameclock": "2:23",
                "possession": 31,
                "detail": "Missed Two by John Collins from 18 feet",
                "time_remaining": 142.8108382488,
                "challenged_score": 15,
                "challenger_score": 16,
            },
            {
                "quarter": 1,
                "gameclock": "2:20",
                "possession": 31,
                "detail": "Defensive Rebound by Kyrie Irving",
                "time_remaining": 140.2876804227,
                "challenged_score": 15,
                "challenger_score": 16,
            },
            {
                "quarter": 1,
                "gameclock": "2:13",
                "possession": 32,
                "detail": "Missed Three by Kyrie Irving from 25 feet",
                "time_remaining": 132.7792417949,
                "challenged_score": 15,
                "challenger_score": 16,
            },
            {
                "quarter": 1,
                "gameclock": "2:11",
                "possession": 32,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 130.7372129014,
                "challenged_score": 15,
                "challenger_score": 16,
            },
            {
                "quarter": 1,
                "gameclock": "2:09",
                "possession": 33,
                "detail": "Shooting Foul on Ben Simmons",
                "time_remaining": 128.836500177,
                "challenged_score": 15,
                "challenger_score": 16,
            },
            {
                "quarter": 1,
                "gameclock": "2:09",
                "possession": 33,
                "detail": "Missed Free Throw by Mike Conley",
                "time_remaining": 128.836500177,
                "challenged_score": 15,
                "challenger_score": 16,
            },
            {
                "quarter": 1,
                "gameclock": "2:09",
                "possession": 33,
                "detail": "Made Free Throw by Mike Conley",
                "time_remaining": 128.836500177,
                "challenged_score": 15,
                "challenger_score": 17,
            },
            {
                "quarter": 1,
                "gameclock": "2:07",
                "possession": 34,
                "detail": "Turnover by Steve Nash",
                "time_remaining": 127.3720406144,
                "challenged_score": 15,
                "challenger_score": 17,
            },
            {
                "quarter": 1,
                "gameclock": "2:07",
                "possession": 34,
                "detail": "Steal by Pascal Siakam",
                "time_remaining": 127.3720406144,
                "challenged_score": 15,
                "challenger_score": 17,
            },
            {
                "quarter": 1,
                "gameclock": "1:53",
                "possession": 35,
                "detail": "Made Two by Pascal Siakam from 4 feet",
                "time_remaining": 113.0451843749,
                "challenged_score": 15,
                "challenger_score": 19,
            },
            {
                "quarter": 1,
                "gameclock": "1:53",
                "possession": 35,
                "detail": "Assisted by Derrick Rose",
                "time_remaining": 113.0451843749,
                "challenged_score": 15,
                "challenger_score": 19,
            },
            {
                "quarter": 1,
                "gameclock": "1:48",
                "possession": 36,
                "detail": "Missed Two by Steve Nash from 1 feet",
                "time_remaining": 108.4422330124,
                "challenged_score": 15,
                "challenger_score": 19,
            },
            {
                "quarter": 1,
                "gameclock": "1:48",
                "possession": 36,
                "detail": "Block By John Collins",
                "time_remaining": 108.4422330124,
                "challenged_score": 15,
                "challenger_score": 19,
            },
            {
                "quarter": 1,
                "gameclock": "1:46",
                "possession": 36,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 106.0991582737,
                "challenged_score": 15,
                "challenger_score": 19,
            },
            {
                "quarter": 1,
                "gameclock": "1:39",
                "possession": 37,
                "detail": "Made Three by Mike Conley from 24 feet",
                "time_remaining": 98.7602680339,
                "challenged_score": 15,
                "challenger_score": 22,
            },
            {
                "quarter": 1,
                "gameclock": "1:39",
                "possession": 37,
                "detail": "Assisted by Derrick Rose",
                "time_remaining": 98.7602680339,
                "challenged_score": 15,
                "challenger_score": 22,
            },
            {
                "quarter": 1,
                "gameclock": "1:21",
                "possession": 38,
                "detail": "Missed Two by Kevin Durant from 1 feet",
                "time_remaining": 80.5396128214,
                "challenged_score": 15,
                "challenger_score": 22,
            },
            {
                "quarter": 1,
                "gameclock": "1:17",
                "possession": 38,
                "detail": "Defensive Rebound by John Collins",
                "time_remaining": 76.7179969353,
                "challenged_score": 15,
                "challenger_score": 22,
            },
            {
                "quarter": 1,
                "gameclock": "1:05",
                "possession": 39,
                "detail": "Made Two by Clint Capela from 3 feet",
                "time_remaining": 65.0788380545,
                "challenged_score": 15,
                "challenger_score": 24,
            },
            {
                "quarter": 1,
                "gameclock": "1:05",
                "possession": 39,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 65.0788380545,
                "challenged_score": 15,
                "challenger_score": 24,
            },
            {
                "quarter": 1,
                "gameclock": "0:54",
                "possession": 40,
                "detail": "Missed Three by Kyrie Irving from 26 feet",
                "time_remaining": 54.3448358751,
                "challenged_score": 15,
                "challenger_score": 24,
            },
            {
                "quarter": 1,
                "gameclock": "0:52",
                "possession": 40,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 52.3722657343,
                "challenged_score": 15,
                "challenger_score": 24,
            },
            {
                "quarter": 1,
                "gameclock": "0:32",
                "possession": 41,
                "detail": "Missed Two by Pascal Siakam from 14 feet",
                "time_remaining": 32.2809863771,
                "challenged_score": 15,
                "challenger_score": 24,
            },
            {
                "quarter": 1,
                "gameclock": "0:31",
                "possession": 41,
                "detail": "Defensive Rebound by Ben Simmons",
                "time_remaining": 31.2246967197,
                "challenged_score": 15,
                "challenger_score": 24,
            },
            {
                "quarter": 1,
                "gameclock": "0:16",
                "possession": 42,
                "detail": "Missed Two by Kyrie Irving from 14 feet",
                "time_remaining": 15.5225442853,
                "challenged_score": 15,
                "challenger_score": 24,
            },
            {
                "quarter": 1,
                "gameclock": "0:13",
                "possession": 42,
                "detail": "Offensive Rebound by Ben Simmons",
                "time_remaining": 12.5660925921,
                "challenged_score": 15,
                "challenger_score": 24,
            },
            {
                "quarter": 1,
                "gameclock": "0:05",
                "possession": 42,
                "detail": "Missed Two by Kyrie Irving from 7 feet",
                "time_remaining": 4.7323139524,
                "challenged_score": 15,
                "challenger_score": 24,
            },
            {
                "quarter": 1,
                "gameclock": "0:02",
                "possession": 42,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 1.8215549243,
                "challenged_score": 15,
                "challenger_score": 24,
            },
            {
                "quarter": 1,
                "gameclock": "0:00",
                "possession": 43,
                "detail": "Made Two by Pascal Siakam from 4 feet",
                "time_remaining": 0.0,
                "challenged_score": 15,
                "challenger_score": 26,
            },
            {
                "quarter": 1,
                "gameclock": "0:00",
                "possession": 43,
                "detail": "Assisted by Clint Capela",
                "time_remaining": 0.0,
                "challenged_score": 15,
                "challenger_score": 26,
            },
            {
                "quarter": 2,
                "gameclock": "10:00",
                "possession": 44,
                "detail": "Start of Period",
                "time_remaining": 600.0,
                "challenged_score": 15,
                "challenger_score": 26,
            },
            {
                "quarter": 2,
                "gameclock": "9:48",
                "possession": 44,
                "detail": "Missed Two by Kyrie Irving from 8 feet",
                "time_remaining": 588.0234969575,
                "challenged_score": 15,
                "challenger_score": 26,
            },
            {
                "quarter": 2,
                "gameclock": "9:45",
                "possession": 44,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 585.102581206,
                "challenged_score": 15,
                "challenger_score": 26,
            },
            {
                "quarter": 2,
                "gameclock": "9:39",
                "possession": 45,
                "detail": "Missed Two by Pascal Siakam from 13 feet",
                "time_remaining": 578.9151174377,
                "challenged_score": 15,
                "challenger_score": 26,
            },
            {
                "quarter": 2,
                "gameclock": "9:36",
                "possession": 45,
                "detail": "Defensive Rebound by Nic Claxton",
                "time_remaining": 576.0408956918,
                "challenged_score": 15,
                "challenger_score": 26,
            },
            {
                "quarter": 2,
                "gameclock": "9:31",
                "possession": 46,
                "detail": "Defensive Foul By John Collins",
                "time_remaining": 571.2810438347,
                "challenged_score": 15,
                "challenger_score": 26,
            },
            {
                "quarter": 2,
                "gameclock": "9:08",
                "possession": 46,
                "detail": "Made Two by Kevin Durant from 12 feet",
                "time_remaining": 547.6403935853,
                "challenged_score": 17,
                "challenger_score": 26,
            },
            {
                "quarter": 2,
                "gameclock": "9:08",
                "possession": 46,
                "detail": "Assisted by Steve Nash",
                "time_remaining": 547.6403935853,
                "challenged_score": 17,
                "challenger_score": 26,
            },
            {
                "quarter": 2,
                "gameclock": "8:56",
                "possession": 47,
                "detail": "Made Two by Clint Capela from 4 feet",
                "time_remaining": 536.0061274452,
                "challenged_score": 17,
                "challenger_score": 28,
            },
            {
                "quarter": 2,
                "gameclock": "8:56",
                "possession": 47,
                "detail": "Assisted by Derrick Rose",
                "time_remaining": 536.0061274452,
                "challenged_score": 17,
                "challenger_score": 28,
            },
            {
                "quarter": 2,
                "gameclock": "8:35",
                "possession": 48,
                "detail": "Made Three by Steve Nash from 25 feet",
                "time_remaining": 514.8611815291,
                "challenged_score": 20,
                "challenger_score": 28,
            },
            {
                "quarter": 2,
                "gameclock": "8:35",
                "possession": 48,
                "detail": "Assisted by Kevin Durant",
                "time_remaining": 514.8611815291,
                "challenged_score": 20,
                "challenger_score": 28,
            },
            {
                "quarter": 2,
                "gameclock": "8:32",
                "possession": 49,
                "detail": "Missed Two by Pascal Siakam from 11 feet",
                "time_remaining": 512.3066465741,
                "challenged_score": 20,
                "challenger_score": 28,
            },
            {
                "quarter": 2,
                "gameclock": "8:29",
                "possession": 49,
                "detail": "Defensive Rebound by Kevin Durant",
                "time_remaining": 509.2806049384,
                "challenged_score": 20,
                "challenger_score": 28,
            },
            {
                "quarter": 2,
                "gameclock": "8:15",
                "possession": 50,
                "detail": "Missed Two by Kevin Durant from 15 feet",
                "time_remaining": 494.5807222905,
                "challenged_score": 20,
                "challenger_score": 28,
            },
            {
                "quarter": 2,
                "gameclock": "8:11",
                "possession": 50,
                "detail": "Defensive Rebound by Derrick Rose",
                "time_remaining": 490.5213630719,
                "challenged_score": 20,
                "challenger_score": 28,
            },
            {
                "quarter": 2,
                "gameclock": "7:55",
                "possession": 51,
                "detail": "Made Two by Clint Capela from 3 feet",
                "time_remaining": 474.7679942009,
                "challenged_score": 20,
                "challenger_score": 30,
            },
            {
                "quarter": 2,
                "gameclock": "7:46",
                "possession": 52,
                "detail": "Shooting Foul on John Collins",
                "time_remaining": 466.4727493105,
                "challenged_score": 20,
                "challenger_score": 30,
            },
            {
                "quarter": 2,
                "gameclock": "7:46",
                "possession": 52,
                "detail": "Missed Free Throw by Ben Simmons",
                "time_remaining": 466.4727493105,
                "challenged_score": 20,
                "challenger_score": 30,
            },
            {
                "quarter": 2,
                "gameclock": "7:46",
                "possession": 52,
                "detail": "Missed Free Throw by Ben Simmons",
                "time_remaining": 466.4727493105,
                "challenged_score": 20,
                "challenger_score": 30,
            },
            {
                "quarter": 2,
                "gameclock": "7:45",
                "possession": 52,
                "detail": "Defensive Rebound by John Collins",
                "time_remaining": 465.3392901911,
                "challenged_score": 20,
                "challenger_score": 30,
            },
            {
                "quarter": 2,
                "gameclock": "7:34",
                "possession": 53,
                "detail": "Made Two by Mike Conley from 2 feet",
                "time_remaining": 454.1431355801,
                "challenged_score": 20,
                "challenger_score": 32,
            },
            {
                "quarter": 2,
                "gameclock": "7:34",
                "possession": 53,
                "detail": "Shooting Foul on Kevin Durant",
                "time_remaining": 454.1431355801,
                "challenged_score": 20,
                "challenger_score": 32,
            },
            {
                "quarter": 2,
                "gameclock": "7:34",
                "possession": 53,
                "detail": "Made Free Throw by Mike Conley",
                "time_remaining": 454.1431355801,
                "challenged_score": 20,
                "challenger_score": 33,
            },
            {
                "quarter": 2,
                "gameclock": "7:11",
                "possession": 54,
                "detail": "Turnover by Kevin Durant",
                "time_remaining": 431.392504881,
                "challenged_score": 20,
                "challenger_score": 33,
            },
            {
                "quarter": 2,
                "gameclock": "7:06",
                "possession": 55,
                "detail": "Missed Two by Derrick Rose from 12 feet",
                "time_remaining": 425.5695333283,
                "challenged_score": 20,
                "challenger_score": 33,
            },
            {
                "quarter": 2,
                "gameclock": "7:02",
                "possession": 55,
                "detail": "Defensive Rebound by Nic Claxton",
                "time_remaining": 422.0581921657,
                "challenged_score": 20,
                "challenger_score": 33,
            },
            {
                "quarter": 2,
                "gameclock": "6:59",
                "possession": 56,
                "detail": "Made Three by Steve Nash from 29 feet",
                "time_remaining": 419.0246536348,
                "challenged_score": 23,
                "challenger_score": 33,
            },
            {
                "quarter": 2,
                "gameclock": "6:59",
                "possession": 56,
                "detail": "Assisted by Kevin Durant",
                "time_remaining": 419.0246536348,
                "challenged_score": 23,
                "challenger_score": 33,
            },
            {
                "quarter": 2,
                "gameclock": "6:51",
                "possession": 57,
                "detail": "Defensive Foul By Steve Nash",
                "time_remaining": 410.7668962796,
                "challenged_score": 23,
                "challenger_score": 33,
            },
            {
                "quarter": 2,
                "gameclock": "6:41",
                "possession": 57,
                "detail": "Made Two by Pascal Siakam from 4 feet",
                "time_remaining": 401.0951666401,
                "challenged_score": 23,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "6:41",
                "possession": 57,
                "detail": "Assisted by John Collins",
                "time_remaining": 401.0951666401,
                "challenged_score": 23,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "6:23",
                "possession": 58,
                "detail": "Made Two by Kevin Durant from 14 feet",
                "time_remaining": 382.6555703157,
                "challenged_score": 25,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "6:21",
                "possession": 59,
                "detail": "Defensive Foul By Kevin Durant",
                "time_remaining": 381.22583638,
                "challenged_score": 25,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "6:06",
                "possession": 59,
                "detail": "Missed Two by Mike Conley from 10 feet",
                "time_remaining": 366.3718174018,
                "challenged_score": 25,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "6:03",
                "possession": 59,
                "detail": "Defensive Rebound by Steve Nash",
                "time_remaining": 363.3430767064,
                "challenged_score": 25,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "5:54",
                "possession": 60,
                "detail": "Missed Two by Steve Nash from 3 feet",
                "time_remaining": 354.1752439118,
                "challenged_score": 25,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "5:52",
                "possession": 60,
                "detail": "Offensive Rebound by Nic Claxton",
                "time_remaining": 351.9494358434,
                "challenged_score": 25,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "5:39",
                "possession": 60,
                "detail": "Missed Two by Nic Claxton from 10 feet",
                "time_remaining": 338.9730763286,
                "challenged_score": 25,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "5:36",
                "possession": 60,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 335.5023697945,
                "challenged_score": 25,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "5:35",
                "possession": 61,
                "detail": "Shooting Foul on Kevin Durant",
                "time_remaining": 334.5685530566,
                "challenged_score": 25,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "5:35",
                "possession": 61,
                "detail": "Missed Free Throw by Pascal Siakam",
                "time_remaining": 334.5685530566,
                "challenged_score": 25,
                "challenger_score": 35,
            },
            {
                "quarter": 2,
                "gameclock": "5:35",
                "possession": 61,
                "detail": "Made Free Throw by Pascal Siakam",
                "time_remaining": 334.5685530566,
                "challenged_score": 25,
                "challenger_score": 36,
            },
            {
                "quarter": 2,
                "gameclock": "5:16",
                "possession": 62,
                "detail": "Missed Two by Kyrie Irving from 14 feet",
                "time_remaining": 315.9142459824,
                "challenged_score": 25,
                "challenger_score": 36,
            },
            {
                "quarter": 2,
                "gameclock": "5:14",
                "possession": 62,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 314.1947601451,
                "challenged_score": 25,
                "challenger_score": 36,
            },
            {
                "quarter": 2,
                "gameclock": "5:06",
                "possession": 63,
                "detail": "Made Two by Pascal Siakam from 4 feet",
                "time_remaining": 305.534562513,
                "challenged_score": 25,
                "challenger_score": 38,
            },
            {
                "quarter": 2,
                "gameclock": "4:56",
                "possession": 64,
                "detail": "Shooting Foul on Clint Capela",
                "time_remaining": 295.9837286263,
                "challenged_score": 25,
                "challenger_score": 38,
            },
            {
                "quarter": 2,
                "gameclock": "4:56",
                "possession": 64,
                "detail": "Made Free Throw by Kyrie Irving",
                "time_remaining": 295.9837286263,
                "challenged_score": 26,
                "challenger_score": 38,
            },
            {
                "quarter": 2,
                "gameclock": "4:56",
                "possession": 64,
                "detail": "Made Free Throw by Kyrie Irving",
                "time_remaining": 295.9837286263,
                "challenged_score": 27,
                "challenger_score": 38,
            },
            {
                "quarter": 2,
                "gameclock": "4:54",
                "possession": 65,
                "detail": "Made Two by Pascal Siakam from 2 feet",
                "time_remaining": 293.8150361435,
                "challenged_score": 27,
                "challenger_score": 40,
            },
            {
                "quarter": 2,
                "gameclock": "4:54",
                "possession": 65,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 293.8150361435,
                "challenged_score": 27,
                "challenger_score": 40,
            },
            {
                "quarter": 2,
                "gameclock": "4:48",
                "possession": 66,
                "detail": "Missed Two by Ben Simmons from 4 feet",
                "time_remaining": 287.6990725349,
                "challenged_score": 27,
                "challenger_score": 40,
            },
            {
                "quarter": 2,
                "gameclock": "4:48",
                "possession": 66,
                "detail": "Block By Pascal Siakam",
                "time_remaining": 287.6990725349,
                "challenged_score": 27,
                "challenger_score": 40,
            },
            {
                "quarter": 2,
                "gameclock": "4:46",
                "possession": 66,
                "detail": "Offensive Rebound by Nic Claxton",
                "time_remaining": 285.7597638832,
                "challenged_score": 27,
                "challenger_score": 40,
            },
            {
                "quarter": 2,
                "gameclock": "4:44",
                "possession": 66,
                "detail": "Shooting Foul on John Collins",
                "time_remaining": 284.0044381532,
                "challenged_score": 27,
                "challenger_score": 40,
            },
            {
                "quarter": 2,
                "gameclock": "4:44",
                "possession": 66,
                "detail": "Made Free Throw by Kevin Durant",
                "time_remaining": 284.0044381532,
                "challenged_score": 28,
                "challenger_score": 40,
            },
            {
                "quarter": 2,
                "gameclock": "4:44",
                "possession": 66,
                "detail": "Made Free Throw by Kevin Durant",
                "time_remaining": 284.0044381532,
                "challenged_score": 29,
                "challenger_score": 40,
            },
            {
                "quarter": 2,
                "gameclock": "4:31",
                "possession": 67,
                "detail": "Made Two by John Collins from 3 feet",
                "time_remaining": 270.5747710666,
                "challenged_score": 29,
                "challenger_score": 42,
            },
            {
                "quarter": 2,
                "gameclock": "4:31",
                "possession": 67,
                "detail": "Assisted by Derrick Rose",
                "time_remaining": 270.5747710666,
                "challenged_score": 29,
                "challenger_score": 42,
            },
            {
                "quarter": 2,
                "gameclock": "4:26",
                "possession": 68,
                "detail": "Turnover by Ben Simmons",
                "time_remaining": 266.0407773576,
                "challenged_score": 29,
                "challenger_score": 42,
            },
            {
                "quarter": 2,
                "gameclock": "4:26",
                "possession": 68,
                "detail": "Steal by Pascal Siakam",
                "time_remaining": 266.0407773576,
                "challenged_score": 29,
                "challenger_score": 42,
            },
            {
                "quarter": 2,
                "gameclock": "4:04",
                "possession": 69,
                "detail": "Made Two by Pascal Siakam from 8 feet",
                "time_remaining": 244.1260722787,
                "challenged_score": 29,
                "challenger_score": 44,
            },
            {
                "quarter": 2,
                "gameclock": "4:04",
                "possession": 69,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 244.1260722787,
                "challenged_score": 29,
                "challenger_score": 44,
            },
            {
                "quarter": 2,
                "gameclock": "3:45",
                "possession": 70,
                "detail": "Turnover by Nic Claxton",
                "time_remaining": 224.9878387803,
                "challenged_score": 29,
                "challenger_score": 44,
            },
            {
                "quarter": 2,
                "gameclock": "3:45",
                "possession": 70,
                "detail": "Steal by Mike Conley",
                "time_remaining": 224.9878387803,
                "challenged_score": 29,
                "challenger_score": 44,
            },
            {
                "quarter": 2,
                "gameclock": "3:34",
                "possession": 71,
                "detail": "Made Three by Derrick Rose from 28 feet",
                "time_remaining": 214.3968047414,
                "challenged_score": 29,
                "challenger_score": 47,
            },
            {
                "quarter": 2,
                "gameclock": "3:23",
                "possession": 72,
                "detail": "Made Two by Kevin Durant from 8 feet",
                "time_remaining": 203.4480239455,
                "challenged_score": 31,
                "challenger_score": 47,
            },
            {
                "quarter": 2,
                "gameclock": "3:14",
                "possession": 73,
                "detail": "Made Two by Clint Capela from 4 feet",
                "time_remaining": 193.7518251071,
                "challenged_score": 31,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "3:14",
                "possession": 73,
                "detail": "Assisted by Pascal Siakam",
                "time_remaining": 193.7518251071,
                "challenged_score": 31,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "2:57",
                "possession": 74,
                "detail": "Made Two by Kevin Durant from 7 feet",
                "time_remaining": 177.3328265183,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "2:57",
                "possession": 74,
                "detail": "Assisted by Steve Nash",
                "time_remaining": 177.3328265183,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "2:43",
                "possession": 75,
                "detail": "Missed Two by Derrick Rose from 1 feet",
                "time_remaining": 162.9021577255,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "2:43",
                "possession": 75,
                "detail": "Block By Nic Claxton",
                "time_remaining": 162.9021577255,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "2:39",
                "possession": 75,
                "detail": "Offensive Rebound by Clint Capela",
                "time_remaining": 158.5342075978,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "2:31",
                "possession": 75,
                "detail": "Missed Two by Derrick Rose from 5 feet",
                "time_remaining": 151.040402149,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "2:28",
                "possession": 75,
                "detail": "Defensive Rebound by Nic Claxton",
                "time_remaining": 147.6170117895,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "2:15",
                "possession": 76,
                "detail": "Missed Two by Steve Nash from 14 feet",
                "time_remaining": 134.5755381051,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "2:11",
                "possession": 76,
                "detail": "Offensive Rebound by Ben Simmons",
                "time_remaining": 131.2475496761,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "1:60",
                "possession": 76,
                "detail": "Missed Two by Kevin Durant from 16 feet",
                "time_remaining": 119.608390244,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "1:57",
                "possession": 76,
                "detail": "Offensive Rebound by Nic Claxton",
                "time_remaining": 117.3413531631,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "1:54",
                "possession": 76,
                "detail": "Missed Two by Kevin Durant from 17 feet",
                "time_remaining": 113.51505346,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "1:49",
                "possession": 76,
                "detail": "Offensive Rebound by Nic Claxton",
                "time_remaining": 109.3939148154,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "1:40",
                "possession": 76,
                "detail": "Missed Two by Steve Nash from 9 feet",
                "time_remaining": 100.4012240352,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "1:39",
                "possession": 76,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 98.5461198813,
                "challenged_score": 33,
                "challenger_score": 49,
            },
            {
                "quarter": 2,
                "gameclock": "1:26",
                "possession": 77,
                "detail": "Made Two by John Collins from 16 feet",
                "time_remaining": 86.1803567765,
                "challenged_score": 33,
                "challenger_score": 51,
            },
            {
                "quarter": 2,
                "gameclock": "1:26",
                "possession": 77,
                "detail": "Assisted by Pascal Siakam",
                "time_remaining": 86.1803567765,
                "challenged_score": 33,
                "challenger_score": 51,
            },
            {
                "quarter": 2,
                "gameclock": "1:19",
                "possession": 78,
                "detail": "Made Two by Kyrie Irving from 2 feet",
                "time_remaining": 78.8906717002,
                "challenged_score": 35,
                "challenger_score": 51,
            },
            {
                "quarter": 2,
                "gameclock": "1:19",
                "possession": 78,
                "detail": "Assisted by Kevin Durant",
                "time_remaining": 78.8906717002,
                "challenged_score": 35,
                "challenger_score": 51,
            },
            {
                "quarter": 2,
                "gameclock": "1:08",
                "possession": 79,
                "detail": "Missed Two by Pascal Siakam from 4 feet",
                "time_remaining": 68.4346031056,
                "challenged_score": 35,
                "challenger_score": 51,
            },
            {
                "quarter": 2,
                "gameclock": "1:06",
                "possession": 79,
                "detail": "Offensive Rebound by John Collins",
                "time_remaining": 66.2601354758,
                "challenged_score": 35,
                "challenger_score": 51,
            },
            {
                "quarter": 2,
                "gameclock": "0:59",
                "possession": 79,
                "detail": "Defensive Foul By Kevin Durant",
                "time_remaining": 58.6444820436,
                "challenged_score": 35,
                "challenger_score": 51,
            },
            {
                "quarter": 2,
                "gameclock": "0:57",
                "possession": 79,
                "detail": "Shooting Foul on Steve Nash",
                "time_remaining": 56.5089682861,
                "challenged_score": 35,
                "challenger_score": 51,
            },
            {
                "quarter": 2,
                "gameclock": "0:57",
                "possession": 79,
                "detail": "Made Free Throw by Pascal Siakam",
                "time_remaining": 56.5089682861,
                "challenged_score": 35,
                "challenger_score": 52,
            },
            {
                "quarter": 2,
                "gameclock": "0:57",
                "possession": 79,
                "detail": "Missed Free Throw by Pascal Siakam",
                "time_remaining": 56.5089682861,
                "challenged_score": 35,
                "challenger_score": 52,
            },
            {
                "quarter": 2,
                "gameclock": "0:53",
                "possession": 79,
                "detail": "Offensive Rebound by Pascal Siakam",
                "time_remaining": 53.1975910774,
                "challenged_score": 35,
                "challenger_score": 52,
            },
            {
                "quarter": 2,
                "gameclock": "0:41",
                "possession": 79,
                "detail": "Made Two by Derrick Rose from 14 feet",
                "time_remaining": 40.7203935715,
                "challenged_score": 35,
                "challenger_score": 54,
            },
            {
                "quarter": 2,
                "gameclock": "0:41",
                "possession": 79,
                "detail": "Shooting Foul on Kyrie Irving",
                "time_remaining": 40.7203935715,
                "challenged_score": 35,
                "challenger_score": 54,
            },
            {
                "quarter": 2,
                "gameclock": "0:41",
                "possession": 79,
                "detail": "Made Free Throw by Derrick Rose",
                "time_remaining": 40.7203935715,
                "challenged_score": 35,
                "challenger_score": 55,
            },
            {
                "quarter": 2,
                "gameclock": "0:28",
                "possession": 80,
                "detail": "Made Two by Ben Simmons from 9 feet",
                "time_remaining": 28.3155051505,
                "challenged_score": 37,
                "challenger_score": 55,
            },
            {
                "quarter": 2,
                "gameclock": "0:28",
                "possession": 80,
                "detail": "Assisted by Steve Nash",
                "time_remaining": 28.3155051505,
                "challenged_score": 37,
                "challenger_score": 55,
            },
            {
                "quarter": 2,
                "gameclock": "0:28",
                "possession": 80,
                "detail": "Shooting Foul on Pascal Siakam",
                "time_remaining": 28.3155051505,
                "challenged_score": 37,
                "challenger_score": 55,
            },
            {
                "quarter": 2,
                "gameclock": "0:28",
                "possession": 80,
                "detail": "Missed Free Throw by Ben Simmons",
                "time_remaining": 28.3155051505,
                "challenged_score": 37,
                "challenger_score": 55,
            },
            {
                "quarter": 2,
                "gameclock": "0:26",
                "possession": 80,
                "detail": "Defensive Rebound by John Collins",
                "time_remaining": 25.5314059293,
                "challenged_score": 37,
                "challenger_score": 55,
            },
            {
                "quarter": 2,
                "gameclock": "0:18",
                "possession": 81,
                "detail": "Turnover by Clint Capela",
                "time_remaining": 18.4233420843,
                "challenged_score": 37,
                "challenger_score": 55,
            },
            {
                "quarter": 2,
                "gameclock": "0:12",
                "possession": 82,
                "detail": "Missed Two by Kevin Durant from 3 feet",
                "time_remaining": 11.7259896958,
                "challenged_score": 37,
                "challenger_score": 55,
            },
            {
                "quarter": 2,
                "gameclock": "0:12",
                "possession": 82,
                "detail": "Block By John Collins",
                "time_remaining": 11.7259896958,
                "challenged_score": 37,
                "challenger_score": 55,
            },
            {
                "quarter": 2,
                "gameclock": "0:09",
                "possession": 82,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 9.2125092126,
                "challenged_score": 37,
                "challenger_score": 55,
            },
            {
                "quarter": 2,
                "gameclock": "0:00",
                "possession": 83,
                "detail": "Made Two by Clint Capela from 4 feet",
                "time_remaining": 0.0,
                "challenged_score": 37,
                "challenger_score": 57,
            },
            {
                "quarter": 2,
                "gameclock": "0:00",
                "possession": 83,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 0.0,
                "challenged_score": 37,
                "challenger_score": 57,
            },
            {
                "quarter": 3,
                "gameclock": "10:00",
                "possession": 84,
                "detail": "Start of Period",
                "time_remaining": 600.0,
                "challenged_score": 37,
                "challenger_score": 57,
            },
            {
                "quarter": 3,
                "gameclock": "9:42",
                "possession": 84,
                "detail": "Shooting Foul on Kyrie Irving",
                "time_remaining": 582.2689736542,
                "challenged_score": 37,
                "challenger_score": 57,
            },
            {
                "quarter": 3,
                "gameclock": "9:42",
                "possession": 84,
                "detail": "Made Free Throw by Pascal Siakam",
                "time_remaining": 582.2689736542,
                "challenged_score": 37,
                "challenger_score": 58,
            },
            {
                "quarter": 3,
                "gameclock": "9:42",
                "possession": 84,
                "detail": "Made Free Throw by Pascal Siakam",
                "time_remaining": 582.2689736542,
                "challenged_score": 37,
                "challenger_score": 59,
            },
            {
                "quarter": 3,
                "gameclock": "9:23",
                "possession": 85,
                "detail": "Made Two by Kyrie Irving from 7 feet",
                "time_remaining": 563.4938674079,
                "challenged_score": 39,
                "challenger_score": 59,
            },
            {
                "quarter": 3,
                "gameclock": "9:23",
                "possession": 85,
                "detail": "Assisted by Kevin Durant",
                "time_remaining": 563.4938674079,
                "challenged_score": 39,
                "challenger_score": 59,
            },
            {
                "quarter": 3,
                "gameclock": "9:03",
                "possession": 86,
                "detail": "Made Two by Pascal Siakam from 4 feet",
                "time_remaining": 543.4143631367,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "9:03",
                "possession": 86,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 543.4143631367,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "8:54",
                "possession": 87,
                "detail": "Missed Two by Ben Simmons from 2 feet",
                "time_remaining": 533.9798211959,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "8:52",
                "possession": 87,
                "detail": "Defensive Rebound by John Collins",
                "time_remaining": 532.3302890002,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "8:36",
                "possession": 88,
                "detail": "Missed Three by Pascal Siakam from 24 feet",
                "time_remaining": 516.1718791511,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "8:31",
                "possession": 88,
                "detail": "Defensive Rebound by Nic Claxton",
                "time_remaining": 511.0771958022,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "8:29",
                "possession": 89,
                "detail": "Defensive Foul By John Collins",
                "time_remaining": 509.0935738172,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "8:23",
                "possession": 89,
                "detail": "Missed Two by Kyrie Irving from 11 feet",
                "time_remaining": 502.8419330736,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "8:22",
                "possession": 89,
                "detail": "Defensive Rebound by John Collins",
                "time_remaining": 501.6770388571,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "8:09",
                "possession": 90,
                "detail": "Missed Two by John Collins from 14 feet",
                "time_remaining": 488.8052947397,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "8:08",
                "possession": 90,
                "detail": "Offensive Rebound by Clint Capela",
                "time_remaining": 487.5951879678,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "7:60",
                "possession": 90,
                "detail": "Shooting Foul on Ben Simmons",
                "time_remaining": 479.5622901466,
                "challenged_score": 39,
                "challenger_score": 61,
            },
            {
                "quarter": 3,
                "gameclock": "7:60",
                "possession": 90,
                "detail": "Made Free Throw by Pascal Siakam",
                "time_remaining": 479.5622901466,
                "challenged_score": 39,
                "challenger_score": 62,
            },
            {
                "quarter": 3,
                "gameclock": "7:60",
                "possession": 90,
                "detail": "Missed Free Throw by Pascal Siakam",
                "time_remaining": 479.5622901466,
                "challenged_score": 39,
                "challenger_score": 62,
            },
            {
                "quarter": 3,
                "gameclock": "7:59",
                "possession": 90,
                "detail": "Offensive Rebound by Clint Capela",
                "time_remaining": 479.4586237167,
                "challenged_score": 39,
                "challenger_score": 62,
            },
            {
                "quarter": 3,
                "gameclock": "7:49",
                "possession": 90,
                "detail": "Made Two by John Collins from 16 feet",
                "time_remaining": 469.4164722979,
                "challenged_score": 39,
                "challenger_score": 64,
            },
            {
                "quarter": 3,
                "gameclock": "7:49",
                "possession": 90,
                "detail": "Assisted by Pascal Siakam",
                "time_remaining": 469.4164722979,
                "challenged_score": 39,
                "challenger_score": 64,
            },
            {
                "quarter": 3,
                "gameclock": "7:29",
                "possession": 91,
                "detail": "Missed Two by Nic Claxton from 1 feet",
                "time_remaining": 448.9209889372,
                "challenged_score": 39,
                "challenger_score": 64,
            },
            {
                "quarter": 3,
                "gameclock": "7:29",
                "possession": 91,
                "detail": "Block By Derrick Rose",
                "time_remaining": 448.9209889372,
                "challenged_score": 39,
                "challenger_score": 64,
            },
            {
                "quarter": 3,
                "gameclock": "7:27",
                "possession": 91,
                "detail": "Defensive Rebound by John Collins",
                "time_remaining": 447.0250151266,
                "challenged_score": 39,
                "challenger_score": 64,
            },
            {
                "quarter": 3,
                "gameclock": "7:22",
                "possession": 92,
                "detail": "Made Two by John Collins from 2 feet",
                "time_remaining": 442.1813735655,
                "challenged_score": 39,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "7:22",
                "possession": 92,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 442.1813735655,
                "challenged_score": 39,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "7:18",
                "possession": 93,
                "detail": "Turnover by Steve Nash",
                "time_remaining": 438.2372402778,
                "challenged_score": 39,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "7:18",
                "possession": 93,
                "detail": "Steal by Clint Capela",
                "time_remaining": 438.2372402778,
                "challenged_score": 39,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "7:09",
                "possession": 94,
                "detail": "Missed Two by Clint Capela from 15 feet",
                "time_remaining": 429.2832735526,
                "challenged_score": 39,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "7:08",
                "possession": 94,
                "detail": "Defensive Rebound by Nic Claxton",
                "time_remaining": 427.899139428,
                "challenged_score": 39,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "6:51",
                "possession": 95,
                "detail": "Missed Two by Ben Simmons from 1 feet",
                "time_remaining": 410.6627948376,
                "challenged_score": 39,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "6:51",
                "possession": 95,
                "detail": "Block By Pascal Siakam",
                "time_remaining": 410.6627948376,
                "challenged_score": 39,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "6:47",
                "possession": 95,
                "detail": "Offensive Rebound by Kyrie Irving",
                "time_remaining": 406.9316894666,
                "challenged_score": 39,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "6:43",
                "possession": 95,
                "detail": "Made Two by Kevin Durant from 5 feet",
                "time_remaining": 402.9563506309,
                "challenged_score": 41,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "6:43",
                "possession": 95,
                "detail": "Assisted by Ben Simmons",
                "time_remaining": 402.9563506309,
                "challenged_score": 41,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "6:43",
                "possession": 95,
                "detail": "Shooting Foul on John Collins",
                "time_remaining": 402.9563506309,
                "challenged_score": 41,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "6:43",
                "possession": 95,
                "detail": "Made Free Throw by Kevin Durant",
                "time_remaining": 402.9563506309,
                "challenged_score": 42,
                "challenger_score": 66,
            },
            {
                "quarter": 3,
                "gameclock": "6:26",
                "possession": 96,
                "detail": "Made Two by Mike Conley from 2 feet",
                "time_remaining": 386.4173947158,
                "challenged_score": 42,
                "challenger_score": 68,
            },
            {
                "quarter": 3,
                "gameclock": "6:26",
                "possession": 96,
                "detail": "Assisted by Derrick Rose",
                "time_remaining": 386.4173947158,
                "challenged_score": 42,
                "challenger_score": 68,
            },
            {
                "quarter": 3,
                "gameclock": "6:23",
                "possession": 97,
                "detail": "Missed Two by Kevin Durant from 4 feet",
                "time_remaining": 382.8833237842,
                "challenged_score": 42,
                "challenger_score": 68,
            },
            {
                "quarter": 3,
                "gameclock": "6:19",
                "possession": 97,
                "detail": "Defensive Rebound by Derrick Rose",
                "time_remaining": 379.442620596,
                "challenged_score": 42,
                "challenger_score": 68,
            },
            {
                "quarter": 3,
                "gameclock": "6:12",
                "possession": 98,
                "detail": "Offensive Foul by Clint Capela",
                "time_remaining": 372.0246010454,
                "challenged_score": 42,
                "challenger_score": 68,
            },
            {
                "quarter": 3,
                "gameclock": "6:06",
                "possession": 98,
                "detail": "Turnover by Ben Simmons",
                "time_remaining": 366.0775458189,
                "challenged_score": 42,
                "challenger_score": 68,
            },
            {
                "quarter": 3,
                "gameclock": "5:52",
                "possession": 99,
                "detail": "Made Two by Derrick Rose from 2 feet",
                "time_remaining": 351.5049034941,
                "challenged_score": 42,
                "challenger_score": 70,
            },
            {
                "quarter": 3,
                "gameclock": "5:43",
                "possession": 100,
                "detail": "Missed Two by Kyrie Irving from 11 feet",
                "time_remaining": 342.5647746497,
                "challenged_score": 42,
                "challenger_score": 70,
            },
            {
                "quarter": 3,
                "gameclock": "5:39",
                "possession": 100,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 338.6623713748,
                "challenged_score": 42,
                "challenger_score": 70,
            },
            {
                "quarter": 3,
                "gameclock": "5:32",
                "possession": 101,
                "detail": "Missed Three by Derrick Rose from 26 feet",
                "time_remaining": 331.8479320837,
                "challenged_score": 42,
                "challenger_score": 70,
            },
            {
                "quarter": 3,
                "gameclock": "5:30",
                "possession": 101,
                "detail": "Defensive Rebound by Kevin Durant",
                "time_remaining": 329.5362343875,
                "challenged_score": 42,
                "challenger_score": 70,
            },
            {
                "quarter": 3,
                "gameclock": "5:23",
                "possession": 102,
                "detail": "Turnover by Kevin Durant",
                "time_remaining": 323.3067500212,
                "challenged_score": 42,
                "challenger_score": 70,
            },
            {
                "quarter": 3,
                "gameclock": "5:21",
                "possession": 103,
                "detail": "Defensive Foul By Steve Nash",
                "time_remaining": 321.1895415034,
                "challenged_score": 42,
                "challenger_score": 70,
            },
            {
                "quarter": 3,
                "gameclock": "5:09",
                "possession": 103,
                "detail": "Defensive Foul By Kyrie Irving",
                "time_remaining": 309.3976463137,
                "challenged_score": 42,
                "challenger_score": 70,
            },
            {
                "quarter": 3,
                "gameclock": "4:59",
                "possession": 103,
                "detail": "Made Two by Pascal Siakam from 4 feet",
                "time_remaining": 298.5451362434,
                "challenged_score": 42,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "4:47",
                "possession": 104,
                "detail": "Missed Three by Kevin Durant from 26 feet",
                "time_remaining": 287.3783017375,
                "challenged_score": 42,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "4:46",
                "possession": 104,
                "detail": "Defensive Rebound by John Collins",
                "time_remaining": 285.7983172972,
                "challenged_score": 42,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "4:37",
                "possession": 105,
                "detail": "Missed Two by John Collins from 13 feet",
                "time_remaining": 277.3489789403,
                "challenged_score": 42,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "4:37",
                "possession": 105,
                "detail": "Block By Kevin Durant",
                "time_remaining": 277.3489789403,
                "challenged_score": 42,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "4:33",
                "possession": 105,
                "detail": "Defensive Rebound by Kevin Durant",
                "time_remaining": 272.6875397282,
                "challenged_score": 42,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "4:14",
                "possession": 106,
                "detail": "Made Two by Kevin Durant from 15 feet",
                "time_remaining": 254.1932594099,
                "challenged_score": 44,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "4:04",
                "possession": 107,
                "detail": "Missed Three by Mike Conley from 25 feet",
                "time_remaining": 244.3978477375,
                "challenged_score": 44,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "4:01",
                "possession": 107,
                "detail": "Defensive Rebound by Ben Simmons",
                "time_remaining": 240.5609701529,
                "challenged_score": 44,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "3:42",
                "possession": 108,
                "detail": "Made Two by Ben Simmons from 4 feet",
                "time_remaining": 221.9204151083,
                "challenged_score": 46,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "3:42",
                "possession": 108,
                "detail": "Assisted by Steve Nash",
                "time_remaining": 221.9204151083,
                "challenged_score": 46,
                "challenger_score": 72,
            },
            {
                "quarter": 3,
                "gameclock": "3:33",
                "possession": 109,
                "detail": "Made Two by John Collins from 3 feet",
                "time_remaining": 213.4174931093,
                "challenged_score": 46,
                "challenger_score": 74,
            },
            {
                "quarter": 3,
                "gameclock": "3:33",
                "possession": 109,
                "detail": "Assisted by Pascal Siakam",
                "time_remaining": 213.4174931093,
                "challenged_score": 46,
                "challenger_score": 74,
            },
            {
                "quarter": 3,
                "gameclock": "3:15",
                "possession": 110,
                "detail": "Made Two by Nic Claxton from 3 feet",
                "time_remaining": 194.7767661542,
                "challenged_score": 48,
                "challenger_score": 74,
            },
            {
                "quarter": 3,
                "gameclock": "3:07",
                "possession": 111,
                "detail": "Shooting Foul on Steve Nash",
                "time_remaining": 186.9981746763,
                "challenged_score": 48,
                "challenger_score": 74,
            },
            {
                "quarter": 3,
                "gameclock": "3:07",
                "possession": 111,
                "detail": "Made Free Throw by Mike Conley",
                "time_remaining": 186.9981746763,
                "challenged_score": 48,
                "challenger_score": 75,
            },
            {
                "quarter": 3,
                "gameclock": "3:07",
                "possession": 111,
                "detail": "Made Free Throw by Mike Conley",
                "time_remaining": 186.9981746763,
                "challenged_score": 48,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "2:58",
                "possession": 112,
                "detail": "Missed Two by Ben Simmons from 4 feet",
                "time_remaining": 177.6136949884,
                "challenged_score": 48,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "2:57",
                "possession": 112,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 177.1353832488,
                "challenged_score": 48,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "2:50",
                "possession": 113,
                "detail": "Missed Three by Mike Conley from 29 feet",
                "time_remaining": 169.5731991427,
                "challenged_score": 48,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "2:45",
                "possession": 113,
                "detail": "Defensive Rebound by Kevin Durant",
                "time_remaining": 164.7224698515,
                "challenged_score": 48,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "2:43",
                "possession": 114,
                "detail": "Made Two by Kyrie Irving from 15 feet",
                "time_remaining": 162.8441811139,
                "challenged_score": 50,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "2:43",
                "possession": 114,
                "detail": "Assisted by Ben Simmons",
                "time_remaining": 162.8441811139,
                "challenged_score": 50,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "2:22",
                "possession": 115,
                "detail": "Missed Two by Mike Conley from 8 feet",
                "time_remaining": 141.7049836603,
                "challenged_score": 50,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "2:19",
                "possession": 115,
                "detail": "Defensive Rebound by Kevin Durant",
                "time_remaining": 139.0488224569,
                "challenged_score": 50,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "2:06",
                "possession": 116,
                "detail": "Missed Two by Ben Simmons from 6 feet",
                "time_remaining": 125.8571310071,
                "challenged_score": 50,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "2:04",
                "possession": 116,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 123.9441544372,
                "challenged_score": 50,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "1:49",
                "possession": 117,
                "detail": "Missed Three by John Collins from 27 feet",
                "time_remaining": 108.996591466,
                "challenged_score": 50,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "1:44",
                "possession": 117,
                "detail": "Defensive Rebound by Nic Claxton",
                "time_remaining": 104.2140468568,
                "challenged_score": 50,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "1:40",
                "possession": 118,
                "detail": "Missed Three by Kevin Durant from 27 feet",
                "time_remaining": 100.1571485188,
                "challenged_score": 50,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "1:40",
                "possession": 118,
                "detail": "Offensive Rebound by Ben Simmons",
                "time_remaining": 99.8199673997,
                "challenged_score": 50,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "1:34",
                "possession": 118,
                "detail": "Made Three by Kevin Durant from 25 feet",
                "time_remaining": 94.184506732,
                "challenged_score": 53,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "1:34",
                "possession": 119,
                "detail": "Missed Three by Mike Conley from 29 feet",
                "time_remaining": 93.5165118025,
                "challenged_score": 53,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "1:33",
                "possession": 119,
                "detail": "Defensive Rebound by Ben Simmons",
                "time_remaining": 93.2926390764,
                "challenged_score": 53,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "1:22",
                "possession": 120,
                "detail": "Turnover by Nic Claxton",
                "time_remaining": 81.9896157458,
                "challenged_score": 53,
                "challenger_score": 76,
            },
            {
                "quarter": 3,
                "gameclock": "1:07",
                "possession": 121,
                "detail": "Made Three by Pascal Siakam from 26 feet",
                "time_remaining": 66.893176787,
                "challenged_score": 53,
                "challenger_score": 79,
            },
            {
                "quarter": 3,
                "gameclock": "1:07",
                "possession": 121,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 66.893176787,
                "challenged_score": 53,
                "challenger_score": 79,
            },
            {
                "quarter": 3,
                "gameclock": "1:03",
                "possession": 122,
                "detail": "Made Two by Kevin Durant from 13 feet",
                "time_remaining": 63.1626206212,
                "challenged_score": 55,
                "challenger_score": 79,
            },
            {
                "quarter": 3,
                "gameclock": "0:59",
                "possession": 123,
                "detail": "Made Two by Pascal Siakam from 3 feet",
                "time_remaining": 59.4376928962,
                "challenged_score": 55,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:59",
                "possession": 123,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 59.4376928962,
                "challenged_score": 55,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:48",
                "possession": 124,
                "detail": "Missed Two by Nic Claxton from 6 feet",
                "time_remaining": 48.0557659073,
                "challenged_score": 55,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:48",
                "possession": 124,
                "detail": "Block By John Collins",
                "time_remaining": 48.0557659073,
                "challenged_score": 55,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:44",
                "possession": 124,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 44.4253253736,
                "challenged_score": 55,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:27",
                "possession": 125,
                "detail": "Missed Two by Pascal Siakam from 3 feet",
                "time_remaining": 26.6958724733,
                "challenged_score": 55,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:24",
                "possession": 125,
                "detail": "Defensive Rebound by Ben Simmons",
                "time_remaining": 24.0660062155,
                "challenged_score": 55,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:22",
                "possession": 126,
                "detail": "Turnover by Kevin Durant",
                "time_remaining": 22.3826019736,
                "challenged_score": 55,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:20",
                "possession": 127,
                "detail": "Missed Two by Pascal Siakam from 4 feet",
                "time_remaining": 20.225107543,
                "challenged_score": 55,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:16",
                "possession": 127,
                "detail": "Defensive Rebound by Steve Nash",
                "time_remaining": 16.2386264409,
                "challenged_score": 55,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:05",
                "possession": 128,
                "detail": "Made Three by Steve Nash from 27 feet",
                "time_remaining": 4.6880927371,
                "challenged_score": 58,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:05",
                "possession": 128,
                "detail": "Assisted by Ben Simmons",
                "time_remaining": 4.6880927371,
                "challenged_score": 58,
                "challenger_score": 81,
            },
            {
                "quarter": 3,
                "gameclock": "0:00",
                "possession": 129,
                "detail": "Defensive Foul By Kevin Durant",
                "time_remaining": 0.0,
                "challenged_score": 58,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "10:00",
                "possession": 129,
                "detail": "Start of Period",
                "time_remaining": 600.0,
                "challenged_score": 58,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "9:54",
                "possession": 129,
                "detail": "Made Two by Kevin Durant from 2 feet",
                "time_remaining": 593.8214938309,
                "challenged_score": 60,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "9:54",
                "possession": 129,
                "detail": "Assisted by Steve Nash",
                "time_remaining": 593.8214938309,
                "challenged_score": 60,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "9:39",
                "possession": 130,
                "detail": "Missed Three by Pascal Siakam from 24 feet",
                "time_remaining": 578.8896558339,
                "challenged_score": 60,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "9:36",
                "possession": 130,
                "detail": "Defensive Rebound by Kyrie Irving",
                "time_remaining": 576.3011689468,
                "challenged_score": 60,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "9:16",
                "possession": 131,
                "detail": "Made Two by Kevin Durant from 8 feet",
                "time_remaining": 556.3618136816,
                "challenged_score": 62,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "9:16",
                "possession": 131,
                "detail": "Shooting Foul on John Collins",
                "time_remaining": 556.3618136816,
                "challenged_score": 62,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "9:16",
                "possession": 131,
                "detail": "Made Free Throw by Kevin Durant",
                "time_remaining": 556.3618136816,
                "challenged_score": 63,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "9:04",
                "possession": 132,
                "detail": "Missed Three by Derrick Rose from 28 feet",
                "time_remaining": 543.6679010331,
                "challenged_score": 63,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "9:01",
                "possession": 132,
                "detail": "Offensive Rebound by Derrick Rose",
                "time_remaining": 540.5576735675,
                "challenged_score": 63,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "8:54",
                "possession": 132,
                "detail": "Missed Two by John Collins from 3 feet",
                "time_remaining": 533.5104956494,
                "challenged_score": 63,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "8:53",
                "possession": 132,
                "detail": "Offensive Rebound by Pascal Siakam",
                "time_remaining": 533.1157785398,
                "challenged_score": 63,
                "challenger_score": 81,
            },
            {
                "quarter": 4,
                "gameclock": "8:40",
                "possession": 132,
                "detail": "Made Two by Pascal Siakam from 2 feet",
                "time_remaining": 520.1649542487,
                "challenged_score": 63,
                "challenger_score": 83,
            },
            {
                "quarter": 4,
                "gameclock": "8:40",
                "possession": 132,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 520.1649542487,
                "challenged_score": 63,
                "challenger_score": 83,
            },
            {
                "quarter": 4,
                "gameclock": "8:39",
                "possession": 133,
                "detail": "Made Three by Kyrie Irving from 27 feet",
                "time_remaining": 519.3645559124,
                "challenged_score": 66,
                "challenger_score": 83,
            },
            {
                "quarter": 4,
                "gameclock": "8:27",
                "possession": 134,
                "detail": "Made Three by Mike Conley from 25 feet",
                "time_remaining": 507.3600193921,
                "challenged_score": 66,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "8:27",
                "possession": 134,
                "detail": "Assisted by Pascal Siakam",
                "time_remaining": 507.3600193921,
                "challenged_score": 66,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "8:21",
                "possession": 135,
                "detail": "Missed Two by Ben Simmons from 4 feet",
                "time_remaining": 501.1668147699,
                "challenged_score": 66,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "8:16",
                "possession": 135,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 496.2436771641,
                "challenged_score": 66,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "8:07",
                "possession": 136,
                "detail": "Missed Two by Clint Capela from 4 feet",
                "time_remaining": 486.999307717,
                "challenged_score": 66,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "8:03",
                "possession": 136,
                "detail": "Defensive Rebound by Ben Simmons",
                "time_remaining": 483.44290686,
                "challenged_score": 66,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "7:60",
                "possession": 137,
                "detail": "Made Two by Kevin Durant from 9 feet",
                "time_remaining": 479.5238961732,
                "challenged_score": 68,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "7:60",
                "possession": 137,
                "detail": "Assisted by Ben Simmons",
                "time_remaining": 479.5238961732,
                "challenged_score": 68,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "7:46",
                "possession": 138,
                "detail": "Missed Two by Pascal Siakam from 7 feet",
                "time_remaining": 465.9379747784,
                "challenged_score": 68,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "7:43",
                "possession": 138,
                "detail": "Defensive Rebound by Ben Simmons",
                "time_remaining": 462.9378891245,
                "challenged_score": 68,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "7:36",
                "possession": 139,
                "detail": "Turnover by Steve Nash",
                "time_remaining": 455.9829952785,
                "challenged_score": 68,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "7:36",
                "possession": 139,
                "detail": "Steal by Mike Conley",
                "time_remaining": 455.9829952785,
                "challenged_score": 68,
                "challenger_score": 86,
            },
            {
                "quarter": 4,
                "gameclock": "7:24",
                "possession": 140,
                "detail": "Made Two by Pascal Siakam from 1 feet",
                "time_remaining": 444.3479251854,
                "challenged_score": 68,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "7:24",
                "possession": 140,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 444.3479251854,
                "challenged_score": 68,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "7:14",
                "possession": 141,
                "detail": "Turnover by Kevin Durant",
                "time_remaining": 433.5782934366,
                "challenged_score": 68,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "7:14",
                "possession": 141,
                "detail": "Steal by Pascal Siakam",
                "time_remaining": 433.5782934366,
                "challenged_score": 68,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "6:56",
                "possession": 142,
                "detail": "Missed Two by John Collins from 5 feet",
                "time_remaining": 415.9683697862,
                "challenged_score": 68,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "6:53",
                "possession": 142,
                "detail": "Offensive Rebound by Pascal Siakam",
                "time_remaining": 412.6866177059,
                "challenged_score": 68,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "6:45",
                "possession": 142,
                "detail": "Defensive Foul By Nic Claxton",
                "time_remaining": 405.0101781196,
                "challenged_score": 68,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "6:35",
                "possession": 142,
                "detail": "Missed Two by Mike Conley from 5 feet",
                "time_remaining": 395.4859541209,
                "challenged_score": 68,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "6:35",
                "possession": 142,
                "detail": "Block By Steve Nash",
                "time_remaining": 395.4859541209,
                "challenged_score": 68,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "6:31",
                "possession": 142,
                "detail": "Defensive Rebound by Kyrie Irving",
                "time_remaining": 390.6955119453,
                "challenged_score": 68,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "6:18",
                "possession": 143,
                "detail": "Made Two by Kevin Durant from 17 feet",
                "time_remaining": 378.4075923332,
                "challenged_score": 70,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "6:18",
                "possession": 143,
                "detail": "Assisted by Steve Nash",
                "time_remaining": 378.4075923332,
                "challenged_score": 70,
                "challenger_score": 88,
            },
            {
                "quarter": 4,
                "gameclock": "5:58",
                "possession": 144,
                "detail": "Made Two by Clint Capela from 1 feet",
                "time_remaining": 357.620998268,
                "challenged_score": 70,
                "challenger_score": 90,
            },
            {
                "quarter": 4,
                "gameclock": "5:58",
                "possession": 144,
                "detail": "Assisted by Derrick Rose",
                "time_remaining": 357.620998268,
                "challenged_score": 70,
                "challenger_score": 90,
            },
            {
                "quarter": 4,
                "gameclock": "5:42",
                "possession": 145,
                "detail": "Made Two by Steve Nash from 4 feet",
                "time_remaining": 341.9738748853,
                "challenged_score": 72,
                "challenger_score": 90,
            },
            {
                "quarter": 4,
                "gameclock": "5:42",
                "possession": 145,
                "detail": "Assisted by Ben Simmons",
                "time_remaining": 341.9738748853,
                "challenged_score": 72,
                "challenger_score": 90,
            },
            {
                "quarter": 4,
                "gameclock": "5:36",
                "possession": 146,
                "detail": "Shooting Foul on Nic Claxton",
                "time_remaining": 335.7811541435,
                "challenged_score": 72,
                "challenger_score": 90,
            },
            {
                "quarter": 4,
                "gameclock": "5:36",
                "possession": 146,
                "detail": "Made Free Throw by Clint Capela",
                "time_remaining": 335.7811541435,
                "challenged_score": 72,
                "challenger_score": 91,
            },
            {
                "quarter": 4,
                "gameclock": "5:36",
                "possession": 146,
                "detail": "Missed Free Throw by Clint Capela",
                "time_remaining": 335.7811541435,
                "challenged_score": 72,
                "challenger_score": 91,
            },
            {
                "quarter": 4,
                "gameclock": "5:33",
                "possession": 146,
                "detail": "Defensive Rebound by Ben Simmons",
                "time_remaining": 333.3961150853,
                "challenged_score": 72,
                "challenger_score": 91,
            },
            {
                "quarter": 4,
                "gameclock": "5:20",
                "possession": 147,
                "detail": "Missed Two by Ben Simmons from 3 feet",
                "time_remaining": 320.4148411452,
                "challenged_score": 72,
                "challenger_score": 91,
            },
            {
                "quarter": 4,
                "gameclock": "5:20",
                "possession": 147,
                "detail": "Block By Clint Capela",
                "time_remaining": 320.4148411452,
                "challenged_score": 72,
                "challenger_score": 91,
            },
            {
                "quarter": 4,
                "gameclock": "5:17",
                "possession": 147,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 316.6029747676,
                "challenged_score": 72,
                "challenger_score": 91,
            },
            {
                "quarter": 4,
                "gameclock": "5:07",
                "possession": 148,
                "detail": "Missed Two by Pascal Siakam from 2 feet",
                "time_remaining": 306.9232599976,
                "challenged_score": 72,
                "challenger_score": 91,
            },
            {
                "quarter": 4,
                "gameclock": "5:06",
                "possession": 148,
                "detail": "Defensive Rebound by Ben Simmons",
                "time_remaining": 306.1550087807,
                "challenged_score": 72,
                "challenger_score": 91,
            },
            {
                "quarter": 4,
                "gameclock": "4:47",
                "possession": 149,
                "detail": "Made Two by Nic Claxton from 1 feet",
                "time_remaining": 287.2826543513,
                "challenged_score": 74,
                "challenger_score": 91,
            },
            {
                "quarter": 4,
                "gameclock": "4:43",
                "possession": 150,
                "detail": "Made Two by Clint Capela from 3 feet",
                "time_remaining": 282.8456527429,
                "challenged_score": 74,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "4:43",
                "possession": 150,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 282.8456527429,
                "challenged_score": 74,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "4:30",
                "possession": 151,
                "detail": "Missed Two by Kyrie Irving from 17 feet",
                "time_remaining": 270.2666895853,
                "challenged_score": 74,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "4:28",
                "possession": 151,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 268.1311152549,
                "challenged_score": 74,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "4:13",
                "possession": 152,
                "detail": "Missed Two by Mike Conley from 16 feet",
                "time_remaining": 253.3920454635,
                "challenged_score": 74,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "4:13",
                "possession": 152,
                "detail": "Defensive Rebound by Ben Simmons",
                "time_remaining": 252.632717243,
                "challenged_score": 74,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "3:59",
                "possession": 153,
                "detail": "Made Two by Ben Simmons from 9 feet",
                "time_remaining": 239.3334653356,
                "challenged_score": 76,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "3:59",
                "possession": 153,
                "detail": "Assisted by Kyrie Irving",
                "time_remaining": 239.3334653356,
                "challenged_score": 76,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "3:42",
                "possession": 154,
                "detail": "Missed Two by Pascal Siakam from 4 feet",
                "time_remaining": 222.1019750022,
                "challenged_score": 76,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "3:42",
                "possession": 154,
                "detail": "Block By Steve Nash",
                "time_remaining": 222.1019750022,
                "challenged_score": 76,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "3:38",
                "possession": 154,
                "detail": "Offensive Rebound by Clint Capela",
                "time_remaining": 218.2711896607,
                "challenged_score": 76,
                "challenger_score": 93,
            },
            {
                "quarter": 4,
                "gameclock": "3:26",
                "possession": 154,
                "detail": "Made Three by John Collins from 28 feet",
                "time_remaining": 205.5726469772,
                "challenged_score": 76,
                "challenger_score": 96,
            },
            {
                "quarter": 4,
                "gameclock": "3:26",
                "possession": 154,
                "detail": "Shooting Foul on Ben Simmons",
                "time_remaining": 205.5726469772,
                "challenged_score": 76,
                "challenger_score": 96,
            },
            {
                "quarter": 4,
                "gameclock": "3:26",
                "possession": 154,
                "detail": "Made Free Throw by John Collins",
                "time_remaining": 205.5726469772,
                "challenged_score": 76,
                "challenger_score": 97,
            },
            {
                "quarter": 4,
                "gameclock": "3:17",
                "possession": 155,
                "detail": "Missed Two by Kevin Durant from 6 feet",
                "time_remaining": 197.2105570609,
                "challenged_score": 76,
                "challenger_score": 97,
            },
            {
                "quarter": 4,
                "gameclock": "3:15",
                "possession": 155,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 195.3577429847,
                "challenged_score": 76,
                "challenger_score": 97,
            },
            {
                "quarter": 4,
                "gameclock": "3:06",
                "possession": 156,
                "detail": "Made Two by John Collins from 18 feet",
                "time_remaining": 186.3709951722,
                "challenged_score": 76,
                "challenger_score": 99,
            },
            {
                "quarter": 4,
                "gameclock": "2:47",
                "possession": 157,
                "detail": "Missed Three by Kevin Durant from 27 feet",
                "time_remaining": 167.2973978875,
                "challenged_score": 76,
                "challenger_score": 99,
            },
            {
                "quarter": 4,
                "gameclock": "2:45",
                "possession": 157,
                "detail": "Defensive Rebound by Clint Capela",
                "time_remaining": 165.2762267356,
                "challenged_score": 76,
                "challenger_score": 99,
            },
            {
                "quarter": 4,
                "gameclock": "2:40",
                "possession": 158,
                "detail": "Made Two by Pascal Siakam from 3 feet",
                "time_remaining": 159.6083754363,
                "challenged_score": 76,
                "challenger_score": 101,
            },
            {
                "quarter": 4,
                "gameclock": "2:40",
                "possession": 158,
                "detail": "Assisted by Mike Conley",
                "time_remaining": 159.6083754363,
                "challenged_score": 76,
                "challenger_score": 101,
            },
            {
                "quarter": 4,
                "gameclock": "2:36",
                "possession": 159,
                "detail": "Missed Two by Kyrie Irving from 16 feet",
                "time_remaining": 155.7615980199,
                "challenged_score": 76,
                "challenger_score": 101,
            },
            {
                "quarter": 4,
                "gameclock": "2:33",
                "possession": 159,
                "detail": "Defensive Rebound by Pascal Siakam",
                "time_remaining": 153.4812997446,
                "challenged_score": 76,
                "challenger_score": 101,
            },
            {
                "quarter": 4,
                "gameclock": "2:12",
                "possession": 160,
                "detail": "Made Two by Derrick Rose from 2 feet",
                "time_remaining": 131.7965013163,
                "challenged_score": 76,
                "challenger_score": 103,
            },
            {
                "quarter": 4,
                "gameclock": "2:12",
                "possession": 160,
                "detail": "Assisted by Pascal Siakam",
                "time_remaining": 131.7965013163,
                "challenged_score": 76,
                "challenger_score": 103,
            },
            {
                "quarter": 4,
                "gameclock": "2:12",
                "possession": 160,
                "detail": "Shooting Foul on Steve Nash",
                "time_remaining": 131.7965013163,
                "challenged_score": 76,
                "challenger_score": 103,
            },
            {
                "quarter": 4,
                "gameclock": "2:12",
                "possession": 160,
                "detail": "Made Free Throw by Derrick Rose",
                "time_remaining": 131.7965013163,
                "challenged_score": 76,
                "challenger_score": 104,
            },
            {
                "quarter": 4,
                "gameclock": "1:56",
                "possession": 161,
                "detail": "Made Two by Kevin Durant from 16 feet",
                "time_remaining": 115.8882928586,
                "challenged_score": 78,
                "challenger_score": 104,
            },
            {
                "quarter": 4,
                "gameclock": "1:56",
                "possession": 161,
                "detail": "Assisted by Kyrie Irving",
                "time_remaining": 115.8882928586,
                "challenged_score": 78,
                "challenger_score": 104,
            },
            {
                "quarter": 4,
                "gameclock": "1:47",
                "possession": 162,
                "detail": "Made Three by John Collins from 26 feet",
                "time_remaining": 107.3163008831,
                "challenged_score": 78,
                "challenger_score": 107,
            },
            {
                "quarter": 4,
                "gameclock": "1:47",
                "possession": 162,
                "detail": "Assisted by Pascal Siakam",
                "time_remaining": 107.3163008831,
                "challenged_score": 78,
                "challenger_score": 107,
            },
            {
                "quarter": 4,
                "gameclock": "1:39",
                "possession": 163,
                "detail": "Turnover by Ben Simmons",
                "time_remaining": 98.707084501,
                "challenged_score": 78,
                "challenger_score": 107,
            },
            {
                "quarter": 4,
                "gameclock": "1:39",
                "possession": 163,
                "detail": "Steal by Derrick Rose",
                "time_remaining": 98.707084501,
                "challenged_score": 78,
                "challenger_score": 107,
            },
            {
                "quarter": 4,
                "gameclock": "1:24",
                "possession": 164,
                "detail": "Made Three by Mike Conley from 29 feet",
                "time_remaining": 83.7002968581,
                "challenged_score": 78,
                "challenger_score": 110,
            },
            {
                "quarter": 4,
                "gameclock": "1:18",
                "possession": 165,
                "detail": "Turnover by Kevin Durant",
                "time_remaining": 78.4401223375,
                "challenged_score": 78,
                "challenger_score": 110,
            },
            {
                "quarter": 4,
                "gameclock": "1:18",
                "possession": 165,
                "detail": "Steal by Pascal Siakam",
                "time_remaining": 78.4401223375,
                "challenged_score": 78,
                "challenger_score": 110,
            },
            {
                "quarter": 4,
                "gameclock": "1:05",
                "possession": 166,
                "detail": "Made Three by Derrick Rose from 27 feet",
                "time_remaining": 65.3039187069,
                "challenged_score": 78,
                "challenger_score": 113,
            },
            {
                "quarter": 4,
                "gameclock": "0:53",
                "possession": 167,
                "detail": "Missed Three by Kyrie Irving from 26 feet",
                "time_remaining": 53.4539764001,
                "challenged_score": 78,
                "challenger_score": 113,
            },
            {
                "quarter": 4,
                "gameclock": "0:51",
                "possession": 167,
                "detail": "Defensive Rebound by John Collins",
                "time_remaining": 50.6009377597,
                "challenged_score": 78,
                "challenger_score": 113,
            },
            {
                "quarter": 4,
                "gameclock": "0:41",
                "possession": 168,
                "detail": "Turnover by Clint Capela",
                "time_remaining": 40.6361819731,
                "challenged_score": 78,
                "challenger_score": 113,
            },
            {
                "quarter": 4,
                "gameclock": "0:41",
                "possession": 168,
                "detail": "Steal by Steve Nash",
                "time_remaining": 40.6361819731,
                "challenged_score": 78,
                "challenger_score": 113,
            },
            {
                "quarter": 4,
                "gameclock": "0:27",
                "possession": 169,
                "detail": "Made Two by Kevin Durant from 15 feet",
                "time_remaining": 27.3180962556,
                "challenged_score": 80,
                "challenger_score": 113,
            },
            {
                "quarter": 4,
                "gameclock": "0:27",
                "possession": 169,
                "detail": "Assisted by Kyrie Irving",
                "time_remaining": 27.3180962556,
                "challenged_score": 80,
                "challenger_score": 113,
            },
            {
                "quarter": 4,
                "gameclock": "0:20",
                "possession": 170,
                "detail": "Made Two by Derrick Rose from 2 feet",
                "time_remaining": 20.2003660647,
                "challenged_score": 80,
                "challenger_score": 115,
            },
            {
                "quarter": 4,
                "gameclock": "0:13",
                "possession": 171,
                "detail": "Offensive Foul by Kyrie Irving",
                "time_remaining": 13.4210921509,
                "challenged_score": 80,
                "challenger_score": 115,
            },
            {
                "quarter": 4,
                "gameclock": "0:01",
                "possession": 171,
                "detail": "Shooting Foul on Steve Nash",
                "time_remaining": 1.190371227,
                "challenged_score": 80,
                "challenger_score": 115,
            },
            {
                "quarter": 4,
                "gameclock": "0:01",
                "possession": 171,
                "detail": "Made Free Throw by Pascal Siakam",
                "time_remaining": 1.190371227,
                "challenged_score": 80,
                "challenger_score": 116,
            },
            {
                "quarter": 4,
                "gameclock": "0:01",
                "possession": 171,
                "detail": "Made Free Throw by Pascal Siakam",
                "time_remaining": 1.190371227,
                "challenged_score": 80,
                "challenger_score": 117,
            },
            {
                "quarter": 4,
                "gameclock": "0:00",
                "possession": 172,
                "detail": "Made Two by Kevin Durant from 21 feet",
                "time_remaining": 0.0,
                "challenged_score": 82,
                "challenger_score": 117,
            },
            {
                "quarter": 4,
                "gameclock": "0:00",
                "possession": 172,
                "detail": "Assisted by Ben Simmons",
                "time_remaining": 0.0,
                "challenged_score": 82,
                "challenger_score": 117,
            },
        ]

    def generate_finished_game(self, lineup1, lineup2, lineup1_wins=True):
        g = self.generate_open_game()
        g.contest.status = game.models.Contest.Status.COMPLETE
        g.contest.save()

        simulation = simulator.models.Simulation(
            lineup_1_uuids=[
                lineup1.player_1.simulated.uuid,
                lineup1.player_2.simulated.uuid,
                lineup1.player_3.simulated.uuid,
                lineup1.player_4.simulated.uuid,
                lineup1.player_5.simulated.uuid,
            ],
            lineup_2_uuids=[
                lineup2.player_1.simulated.uuid,
                lineup2.player_2.simulated.uuid,
                lineup2.player_3.simulated.uuid,
                lineup2.player_4.simulated.uuid,
                lineup2.player_5.simulated.uuid,
            ],
        )
        simulation.status = simulator.models.Simulation.Status.FINISHED
        simulation.result = self.build_result(lineup1_wins)
        simulation.save()

        g.simulation = simulation

        # this is total abuse- when a game is saved, if both lineups are present the
        # simulator is called, by setting the simulation result before the lineups,
        # this call to the simulator is circumvented. Super brittle!
        g.lineup_1 = lineup1
        g.lineup_2 = lineup2
        g.save()

        play_by_play = simulator.models.PlayByPlay(
            simulation=g.simulation,
            feed=json.dumps(self.generate_play_by_play_feed(g.id)),
        )
        g.simulation.save()

        play_by_play = simulator.models.PlayByPlay(
            simulation=g.simulation,
            feed=json.dumps(self.generate_play_by_play_feed(g.id)),
        )
        play_by_play.save()
        return g

    def get_free_agents(self):
        return [
            free_agent.player
            for free_agent in simulator.models.Player.objects.filter(token__lt=0)
        ]

    def generate_free_agents(self, required_number):
        free_agents = self.get_free_agents()

        if len(free_agents) < required_number:
            # free agents have negative ids. Get the lowest known id and
            # generate the next ids in the sequence
            smallest_token = (
                simulator.models.Player.objects.all()
                .values("token")
                .aggregate(min_token=Min("token"))["min_token"]
            )

            if smallest_token > 0:
                smallest_token = 0

            possible_positions = list(
                permutations([e for e in simulator.models.PlayerPosition], 2)
            )

            for i in range(required_number - len(free_agents)):
                smallest_token = smallest_token - 1
                positions = possible_positions[i % len(possible_positions)]

                agent = self.generate_player(
                    smallest_token, position1=positions[0], position2=positions[1]
                )
                agent.save()
                free_agents.append(agent)

        return free_agents

    def get_available_free_agents(self, required_number_of_agents):
        free_agents = self.get_free_agents()
        if len(free_agents) < required_number_of_agents:
            raise Exception(
                (
                    "There are not enough free agents to generate a dataset. "
                    + "Needed {}, found {}".format(
                        required_number_of_agents, len(free_agents)
                    )
                )
            )
        return free_agents

    def setup_user(self, wallet, number_of_players_needed, should_generate):
        if should_generate:
            return self.init_user_and_generate_players(wallet, number_of_players_needed)
        return self.init_user_and_assign_players(wallet, number_of_players_needed)

    def setup_free_agents(self, number_of_agents_needed, should_generate):
        if should_generate:
            return self.generate_free_agents(number_of_agents_needed)
        return self.get_available_free_agents(number_of_agents_needed)

    def createSuperUser(self):
        superuser_username = "admin@admin.com"
        superuser_password = "admin"

        superuser = get_user_model().objects.filter(email=superuser_username).first()
        if superuser:
            LOGGER.info(f"Superuser {superuser_username} already exists.")
            return

        call_command(
            "createsuperuser", "--noinput", "--wallet_address", superuser_username
        )
        superuser = get_user_model().objects.get(email=superuser_username)
        superuser.set_password(superuser_password)
        superuser.save()

    def handle(self, *args, **options):
        if settings.CONFIGURATION == "swoops.settings.Production":
            raise Exception("This command cannot be used in production!")

        self.createSuperUser()

        user = self.setup_user(
            wallet=options["wallet"],
            number_of_players_needed=50,
            should_generate=options["generate-players"],
        )
        opponent = self.setup_user(
            wallet=options["opponent"],
            number_of_players_needed=50,
            should_generate=options["generate-players"],
        )

        free_agents = self.setup_free_agents(20, options["generate-players"])

        for _ in range(5):
            self.generate_open_game()

        for _ in range(7):
            game = self.generate_finished_game(
                self.compose_lineup(user), self.compose_lineup(opponent)
            )
            self.build_game_reservation(game, user.team)
            self.build_game_reservation(game, opponent.team)

        for _ in range(3):
            game = self.generate_finished_game(
                self.compose_lineup(user, free_agents[0:2]),
                self.compose_lineup(opponent, free_agents[2:4]),
            )
            self.build_game_reservation(game, user.team)
            self.build_game_reservation(game, opponent.team)

        for _ in range(3):
            game = self.generate_open_game(self.compose_lineup(user))
            self.build_game_reservation(
                game, user.team, timezone.now() + timezone.timedelta(weeks=52)
            )

            game = self.generate_open_game(self.compose_lineup(user, free_agents[0:2]))
            self.build_game_reservation(
                game, user.team, timezone.now() + timezone.timedelta(weeks=52)
            )

            game = self.generate_open_game(self.compose_lineup(opponent))
            self.build_game_reservation(
                game, opponent.team, timezone.now() + timezone.timedelta(weeks=52)
            )

            game = self.generate_open_game(self.compose_lineup(opponent))
            self.build_game_reservation(
                game, opponent.team, timezone.now() + timezone.timedelta(weeks=52)
            )
            self.build_game_reservation(
                game, user.team, timezone.now() + timezone.timedelta(weeks=52)
            )

            game = self.generate_open_game(
                self.compose_lineup(opponent, free_agents[0:2])
            )
            self.build_game_reservation(
                game, opponent.team, timezone.now() + timezone.timedelta(weeks=52)
            )

            game = self.generate_open_game()
            self.build_game_reservation(
                game, user.team, timezone.now() + timezone.timedelta(weeks=52)
            )

        in_season_tournament = self.build_tournament()
        # build_tournament_structure instantiates the beginning structure of the
        # tournament which has complex pieces. if you want a legitimate looking
        # tournament thats about to start, use this method
        build_tournament_structure(in_season_tournament)
        self.generate_tournament_entry(
            tournament=in_season_tournament, team=user.team, seed=1
        )
        self.generate_tournament_entry(
            tournament=in_season_tournament, team=opponent.team, seed=2
        )

        more_entrants = []
        for _ in range(6):
            more_entrants.append(
                self.setup_user(
                    wallet=self.generate_random_wallet(),
                    number_of_players_needed=5,
                    should_generate=options["generate-players"],
                )
            )

        in_season_tournament = self.build_completed_tournament(
            user, opponent, *more_entrants
        )

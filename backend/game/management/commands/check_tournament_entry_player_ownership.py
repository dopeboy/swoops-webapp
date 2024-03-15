from django.core.management.base import BaseCommand

import game.models


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "-id",
            "--tournament_id",
            dest="tournament_id",
            type=int,
            help="Tournament Id",
            required=True,
        )

    def notify_not_owned_player(self, team, player):
        print(
            f"{player.simulated.full_name} ({player.simulated.token}) is not owned by {team.name} ({team.id})."  # noqa: E501
        )

    def handle(self, *args, **options):

        try:
            tournament = game.models.Tournament.objects.get(id=options["tournament_id"])
        except game.modelsTournament.DoesNotExist:
            raise Exception(f'Tournament { options["tournament_id"] } does not exist.')

        for tournament_entry in game.models.TournamentEntry.objects.select_related(
            "tournament",
            "lineup__team",
            "lineup__player_1__simulated",
            "lineup__player_2__simulated",
            "lineup__player_3__simulated",
            "lineup__player_4__simulated",
            "lineup__player_5__simulated",
        ).filter(tournament=tournament):
            if (
                tournament_entry.lineup.player_1.team != tournament_entry.team
                and tournament_entry.lineup.player_1.simulated.token >= 0
            ):
                self.notify_not_owned_player(
                    tournament_entry.team, tournament_entry.lineup.player_1
                )

            if (
                tournament_entry.lineup.player_2.team != tournament_entry.team
                and tournament_entry.lineup.player_2.simulated.token >= 0
            ):
                self.notify_not_owned_player(
                    tournament_entry.team, tournament_entry.lineup.player_2
                )

            if (
                tournament_entry.lineup.player_3.team != tournament_entry.team
                and tournament_entry.lineup.player_3.simulated.token >= 0
            ):
                self.notify_not_owned_player(
                    tournament_entry.team, tournament_entry.lineup.player_3
                )

            if (
                tournament_entry.lineup.player_4.team != tournament_entry.team
                and tournament_entry.lineup.player_4.simulated.token >= 0
            ):
                self.notify_not_owned_player(
                    tournament_entry.team, tournament_entry.lineup.player_4
                )

            if (
                tournament_entry.lineup.player_5.team != tournament_entry.team
                and tournament_entry.lineup.player_5.simulated.token >= 0
            ):

                self.notify_not_owned_player(
                    tournament_entry.team, tournament_entry.lineup.player_5
                )

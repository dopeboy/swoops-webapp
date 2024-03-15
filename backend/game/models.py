import datetime
import json
import math
from collections import namedtuple

import pgtrigger
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import connection, models, transaction
from django.db.models import Case, Count, IntegerField, Q, When
from django.utils import timezone

import simulator.models
import utils.helpers


class Team(models.Model):
    """
    A team has players associated with it and an owner that never changes.
    """

    name = models.CharField(
        max_length=64, help_text="The official team name.", db_index=True
    )
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="team"
    )
    wins = models.IntegerField(default=0, help_text="The all-time wins.")
    losses = models.IntegerField(default=0, help_text="The all-time losses.")
    path = models.CharField(
        max_length=256, blank=True, help_text="The official team logo"
    )

    def __str__(self):
        return f"{self.name}"

    @property
    def games_played(self):
        return self.wins + self.losses


class PlayerManager(models.Manager):
    def players_owned_by_user(self, owner_id):
        return self.select_related("team").filter(team__owner_id=owner_id)


class Player(models.Model):
    """
    Players are the core construct for NFT players or free agents. They can
    be owned by different teams.
    """

    team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        help_text="The current team.",
    )
    simulated = models.OneToOneField("simulator.Player", on_delete=models.PROTECT)
    wins = models.IntegerField(default=0, help_text="The all-time wins.")
    losses = models.IntegerField(default=0, help_text="The all-time losses.")
    opensea_price_usd = models.DecimalField(
        help_text="Opensea Price USD",
        max_digits=20,
        decimal_places=10,
        null=True,
        blank=True,
    )

    first_named_on = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.simulated.full_name} ({self.simulated.token})"

    objects = PlayerManager()


class LineupManager(models.Manager):
    def get_queryset(self):
        return (
            super(LineupManager, self)
            .get_queryset()
            .select_related(
                "player_1",
                "player_2",
                "player_3",
                "player_4",
                "player_5",
                "player_1__simulated",
                "player_2__simulated",
                "player_3__simulated",
                "player_4__simulated",
                "player_5__simulated",
            )
        )


class Lineup(models.Model):
    """
    A lineup for a game.
    """

    team = models.ForeignKey(Team, on_delete=models.PROTECT)
    player_1 = models.ForeignKey(Player, on_delete=models.PROTECT, related_name="+")
    player_2 = models.ForeignKey(Player, on_delete=models.PROTECT, related_name="+")
    player_3 = models.ForeignKey(Player, on_delete=models.PROTECT, related_name="+")
    player_4 = models.ForeignKey(Player, on_delete=models.PROTECT, related_name="+")
    player_5 = models.ForeignKey(Player, on_delete=models.PROTECT, related_name="+")

    objects = LineupManager()

    def __str__(self):
        lineup = f"{self.player_1.simulated.full_name}, {self.player_2.simulated.full_name}, {self.player_3.simulated.full_name}, {self.player_4.simulated.full_name}, {self.player_5.simulated.full_name}"  # noqa: E501

        return lineup


class GamePlayer(models.Model):
    """
    Unwound lineups for a game. This model is exclusively written to
    by triggers on the Game model and should not be edited directly.
    """

    player = models.ForeignKey(Player, on_delete=models.PROTECT, related_name="games")
    game = models.ForeignKey(
        "game.Game", on_delete=models.PROTECT, related_name="players"
    )

    def save(self, *args, **kwargs):
        raise AssertionError("This model can only be saved by Game triggers.")


class Contest(models.Model):
    """
    Groups games into contest types, such as head to heads or tournaments.
    """

    class Status(models.TextChoices):
        OPEN = "OPEN"
        COMPLETE = "COMPLETE"
        IN_PROGRESS = "IN_PROGRESS"
        VOIDED = "VOIDED"
        ERROR = "ERROR"

    class Kind(models.TextChoices):
        HEAD_TO_HEAD = "HEAD_TO_HEAD"
        HEAD_TO_HEAD_MATCH_MAKE = "HEAD_TO_HEAD_MATCH_MAKE"
        TOURNAMENT = "TOURNAMENT"

    status = models.CharField(
        max_length=32, choices=Status.choices, default=Status.OPEN, db_index=True
    )
    kind = models.CharField(max_length=32, choices=Kind.choices)
    played_at = models.DateTimeField(null=True)
    tokens_required = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self):
        return str(self.id)


class ReservationManager(models.Manager):
    def reservation_exists(self, game_id, team_id):
        return self.filter(
            game_id=game_id,
            team_id=team_id,
            deleted=False,
            expires_at__gte=timezone.now(),
        ).exists()


class Reservation(models.Model):
    game = models.ForeignKey(
        "Game",
        related_name="reservations",
        on_delete=models.PROTECT,
    )

    team = models.ForeignKey(
        Team,
        on_delete=models.PROTECT,
    )
    expires_at = models.DateTimeField()

    deleted = models.BooleanField(default=False, null=False)

    @property
    def has_expired(self):
        return self.expires_at.astimezone(timezone.utc) < timezone.now()

    objects = ReservationManager()


SYNC_GAME_PLAYERS_SQL = (
    f"INSERT INTO {GamePlayer._meta.db_table}(player_id, game_id) "
    "SELECT "
    "  unnest(array["
    "      player_1_id, player_2_id, player_3_id, player_4_id, player_5_id"
    "]) AS player_id, "
    "  unnest(array[NEW.id, NEW.id, NEW.id, NEW.id, NEW.id]) AS game_id "
    f"FROM {Lineup._meta.db_table} "
    " WHERE id = NEW.lineup_{lineup_no}_id; RETURN NEW;"
)


class GameManager(models.Manager):
    def get_games(self, team=None, status=None):
        if team:
            return self.games_by_team(team, status)
        if status == Contest.Status.OPEN:
            return self.games_open_for_registration()
        else:
            return self.games_for_status(status)

    def _predefined_joins_for_team_lookups(self):
        return self.prefetch_related(
            "reservations", "reservations__team"
        ).select_related(
            "contest",
            "lineup_1",
            "lineup_1__team",
            "lineup_2",
            "lineup_2__team",
            "simulation__result",
        )

    def _predefined_joins_for_player_result_lookups(self):
        return self.select_related(
            "contest",
            "lineup_1",
            "lineup_1__team",
            "lineup_2",
            "lineup_2__team",
            "simulation__result",
            "lineup_1__player_1__simulated",
            "lineup_1__player_2__simulated",
            "lineup_1__player_3__simulated",
            "lineup_1__player_4__simulated",
            "lineup_1__player_5__simulated",
            "lineup_2__player_1__simulated",
            "lineup_2__player_2__simulated",
            "lineup_2__player_3__simulated",
            "lineup_2__player_4__simulated",
            "lineup_2__player_5__simulated",
            "simulation__result__lineup_1_player_1_box_score",
            "simulation__result__lineup_1_player_2_box_score",
            "simulation__result__lineup_1_player_3_box_score",
            "simulation__result__lineup_1_player_4_box_score",
            "simulation__result__lineup_1_player_5_box_score",
            "simulation__result__lineup_2_player_1_box_score",
            "simulation__result__lineup_2_player_2_box_score",
            "simulation__result__lineup_2_player_3_box_score",
            "simulation__result__lineup_2_player_4_box_score",
            "simulation__result__lineup_2_player_5_box_score",
        )

    def games_by_player(self, player_token):
        lineup1 = self._predefined_joins_for_player_result_lookups().filter(
            contest__status=Contest.Status.COMPLETE,
            visibility=Game.Visibility.PUBLIC,
        )

        lineup1 = lineup1.filter(
            Q(lineup_1__player_1__simulated__token=player_token)
            | Q(lineup_1__player_2__simulated__token=player_token)
            | Q(lineup_1__player_3__simulated__token=player_token)
            | Q(lineup_1__player_4__simulated__token=player_token)
            | Q(lineup_1__player_5__simulated__token=player_token)
        )

        lineup2 = self._predefined_joins_for_player_result_lookups().filter(
            contest__status=Contest.Status.COMPLETE,
            visibility=Game.Visibility.PUBLIC,
        )

        lineup2 = lineup2.filter(
            Q(lineup_2__player_1__simulated__token=player_token)
            | Q(lineup_2__player_2__simulated__token=player_token)
            | Q(lineup_2__player_3__simulated__token=player_token)
            | Q(lineup_2__player_4__simulated__token=player_token)
            | Q(lineup_2__player_5__simulated__token=player_token)
        )

        return lineup1.union(lineup2).order_by("-contest__played_at")

    def games_by_team(self, team_id, status):
        my_filter = {"visibility": Game.Visibility.PUBLIC, "contest__status": status}
        lineup1 = self._predefined_joins_for_team_lookups().filter(
            lineup_1__team_id=team_id, **my_filter
        )

        lineup2 = self._predefined_joins_for_team_lookups().filter(
            lineup_2__team_id=team_id, **my_filter
        )

        return lineup1.union(lineup2).order_by("-contest__played_at")

    def games_for_status(self, status):
        return (
            self.filter(contest__status=status, visibility=Game.Visibility.PUBLIC)
            .prefetch_related("reservations", "reservations__team")
            .select_related(
                "contest",
                "lineup_1",
                "lineup_1__team",
                "lineup_2",
                "lineup_2__team",
                "simulation__result",
            )
            .order_by("-contest__played_at")
        )

    def games_open_for_registration(self):
        qs = Game.objects.filter(
            simulation__isnull=True, visibility=Game.Visibility.PUBLIC
        ).annotate(
            num_active_registrations=Count(
                Case(
                    When(
                        Q(
                            reservations__expires_at__gte=timezone.now(),
                            reservations__deleted=False,
                        ),
                        then=1,
                    ),
                    output_field=IntegerField(),
                )
            )
        )

        qs = (
            qs.prefetch_related("reservations", "reservations__team")
            .select_related(
                "contest",
                "lineup_1",
                "lineup_1__team",
                "lineup_2",
                "lineup_2__team",
                "simulation__result",
            )
            .annotate(num_reservations=Count("reservations"))
            .filter(num_active_registrations__lt=2, contest__status=Contest.Status.OPEN)
            .order_by("-num_reservations")
        )

        return qs


@pgtrigger.register(
    # These four triggers ensure that we keep the GamePlayer table up to date
    # when games specify a lineup_1 or lineup_2 on create/update.
    pgtrigger.Trigger(
        name="sync_game_players_lineup_1_insert",
        operation=pgtrigger.Insert,
        when=pgtrigger.After,
        condition=pgtrigger.Q(new__lineup_1__isnull=False),
        func=SYNC_GAME_PLAYERS_SQL.format(lineup_no="1"),
    ),
    pgtrigger.Trigger(
        name="sync_game_players_lineup_1_update",
        operation=pgtrigger.Update,
        when=pgtrigger.After,
        condition=pgtrigger.Q(old__lineup_1__df=pgtrigger.F("new__lineup_1")),
        func=SYNC_GAME_PLAYERS_SQL.format(lineup_no="1"),
    ),
    pgtrigger.Trigger(
        name="sync_game_players_lineup_2_insert",
        operation=pgtrigger.Insert,
        when=pgtrigger.After,
        condition=pgtrigger.Q(new__lineup_2__isnull=False),
        func=SYNC_GAME_PLAYERS_SQL.format(lineup_no="2"),
    ),
    pgtrigger.Trigger(
        name="sync_game_players_lineup_2_update",
        operation=pgtrigger.Update,
        when=pgtrigger.After,
        condition=pgtrigger.Q(old__lineup_2__df=pgtrigger.F("new__lineup_2")),
        func=SYNC_GAME_PLAYERS_SQL.format(lineup_no="2"),
    ),
    # These two triggers ensure that lineup_1 and lineup_2 cannot be updated
    # once set. This ensures that the GamePlayer cache remains consistent since
    # we don't currently handle the case of the lineups changing.
    pgtrigger.Protect(
        name="protect_lineup_1_updates",
        operation=pgtrigger.Update,
        condition=(
            pgtrigger.Q(old__lineup_1__df=pgtrigger.F("new__lineup_1"))
            & pgtrigger.Q(old__lineup_1__isnull=False)
        ),
    ),
    pgtrigger.Protect(
        name="protect_lineup_2_updates",
        operation=pgtrigger.Update,
        condition=(
            pgtrigger.Q(old__lineup_2__df=pgtrigger.F("new__lineup_2"))
            & pgtrigger.Q(old__lineup_2__isnull=False)
        ),
    ),
)
class Game(models.Model):
    """An individual game in a contest that's simulated."""

    class Visibility(models.TextChoices):
        HIDDEN = "HIDDEN"
        STAFF = "STAFF"
        PUBLIC = "PUBLIC"

    contest = models.ForeignKey(Contest, on_delete=models.PROTECT)
    lineup_1 = models.ForeignKey(
        Lineup, blank=True, null=True, on_delete=models.PROTECT, related_name="+"
    )
    lineup_2 = models.ForeignKey(
        Lineup, blank=True, null=True, on_delete=models.PROTECT, related_name="+"
    )
    revealed_to_user_1 = models.BooleanField(default=True)
    revealed_to_user_2 = models.BooleanField(default=True)
    visibility = models.CharField(
        max_length=12,
        choices=Visibility.choices,
        default=Visibility.PUBLIC,
        db_index=True,
    )

    simulation = models.OneToOneField(
        "simulator.Simulation",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="game",
    )
    prize_pool = models.DecimalField(
        help_text="Prize Pool", max_digits=20, decimal_places=10, null=True, blank=True
    )
    transaction_id = models.CharField(
        max_length=255, help_text="Transaction Id.", blank=True, default=""
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    @property
    def is_fully_reserved(self):
        # check if reservation is full
        if (
            Reservation.objects.filter(
                game=self, expires_at__gte=timezone.now(), deleted=False
            ).count()
            == 2
        ):
            return True
        return False

    objects = GameManager()

    @transaction.atomic
    def save(self, *args, **kwargs):
        if not self.simulation_id and self.lineup_1 and self.lineup_2:
            self.simulation = simulator.models.Simulation.objects.create(
                lineup_1_uuids=[
                    self.lineup_1.player_1.simulated.uuid,
                    self.lineup_1.player_2.simulated.uuid,
                    self.lineup_1.player_3.simulated.uuid,
                    self.lineup_1.player_4.simulated.uuid,
                    self.lineup_1.player_5.simulated.uuid,
                ],
                lineup_2_uuids=[
                    self.lineup_2.player_1.simulated.uuid,
                    self.lineup_2.player_2.simulated.uuid,
                    self.lineup_2.player_3.simulated.uuid,
                    self.lineup_2.player_4.simulated.uuid,
                    self.lineup_2.player_5.simulated.uuid,
                ],
            )

            simulator.processing.create_games(simulation=self.simulation)
            self.contest.status = Contest.Status.IN_PROGRESS

        super().save(*args, **kwargs)


class TournamentPayoutManager(models.Manager):
    def tournaments_needing_a_pay_out(self, lookback_window):
        return self.raw(
            """SELECT gt.*
            FROM game_tournament gt
                LEFT JOIN game_tournamentpayout gtp ON gtp.tournament_id = gt.id
                LEFT JOIN game_payout gp on gtp.payout_id = gp.id and gp.status = 'CONFIRMED'
            WHERE gt.finalized_on >= %(LOOKBACK)s and gt.paid_out = false
            GROUP BY gt.id, gt.number_of_payouts
            HAVING count(gp.id) != gt.number_of_payouts
            ORDER BY gt.finalized_on""",  # noqa: E501
            {"LOOKBACK": lookback_window},
        )

    def count_payouts_made_for_tournament(self, tournament_id):
        return self.filter(
            id=tournament_id,
            tournamentpayout__payout__status__iexact=PayoutStatus.CONFIRMED,
        ).count()


class Tournament(models.Model):
    class Kind(models.TextChoices):
        IN_SEASON = "IN SEASON"
        END_OF_SEASON = "END OF SEASON"
        PARTNER = "PARTNER"

    populate_entry_lineups = models.BooleanField(default=False)
    name = models.CharField(max_length=255)
    kind = models.CharField(max_length=14, choices=Kind.choices, default=Kind.IN_SEASON)
    contest = models.OneToOneField(
        Contest, on_delete=models.PROTECT, related_name="tournament"
    )
    size = models.PositiveIntegerField(default=64)
    payout = models.DecimalField(
        help_text="Payout", max_digits=20, decimal_places=10, null=True, blank=True
    )
    lineup_submission_start = models.DateTimeField(null=True)
    lineup_submission_cutoff = models.DateTimeField(null=True)
    lineup_reveal_date = models.DateTimeField(null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    public_publish_datetime = models.DateTimeField(null=True)
    visibility_at = models.DateTimeField(null=True)
    meta = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    finalized_on = models.DateTimeField(null=True, db_index=True)
    banner_img_url = models.CharField(
        max_length=255, blank=True, help_text="Image URL for tournament"
    )
    # TODO number_of_payouts should be a computed column based on the JSON lookup:
    # `meta ->> 'payout_breakdown_usd'`. Because meta is a TextField and not a
    # JSONFfield, we can't query it directly- we have to load the value into the app
    # and count the number of payouts from there. As a workaround (and to defer the
    # work of converting the TextField into a JSONField), the save() method of
    # Tournament has been overridden to compute this value. Eventually, meta can be
    # renovated into a JSON field and resolve the save() override.
    number_of_payouts = models.IntegerField(null=True)
    paid_out = models.BooleanField(default=False)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        if self.name:
            return self.name

        return f"Tournament #{self.id}"

    @property
    def status(self):
        return self.contest.status

    def save(self, *args, **kwargs):
        # TODO: remove this entire override once meta is a JSONField and auto-compute
        self.number_of_payouts = len(json.loads(self.meta)["payout_breakdown_usd"])
        super(Tournament, self).save(*args, **kwargs)

    def clean(self):
        if self.size % 2 > 0:
            raise ValidationError(
                "Invalid tournament size, tournaments must be size 2^n."
            )

        if self.size > 64:
            raise ValidationError("Max tournament size of 64 teams.")

        if self.meta:
            try:
                meta = json.loads(self.meta)
            except ValueError:
                raise ValidationError("Decoding meta field has failed.")

            if "max_games_per_round" not in meta:
                raise ValidationError(
                    "max_games_per_round key must be included within meta field."
                )

            if type(meta["max_games_per_round"]) != list:
                raise ValidationError(
                    "Type max_games_per_round must be a list."  # noqa: E501
                )

            for round, max_game_in_round in enumerate(meta["max_games_per_round"]):
                if max_game_in_round < 1:
                    raise ValidationError(
                        f"Max game of {max_game_in_round} in Round { round + 1 } must be greater than 1."  # noqa: E501
                    )

                if (max_game_in_round % 2) == 0:
                    raise ValidationError(
                        f"Max game of {max_game_in_round} in Round { round + 1 } must be odd."  # noqa: E501
                    )

            total_rounds = int(math.log(self.size) / math.log(2))
            if len(meta["max_games_per_round"]) != total_rounds:
                raise ValidationError(
                    f"max_games_per_round must have {total_rounds} entries. One max game entry per round."  # noqa: E501
                )

            if "payout_breakdown_usd" not in meta:
                raise ValidationError(
                    "payout_breakdown_usd key must be included within meta field."
                )

            if type(meta["payout_breakdown_usd"]) != list:
                raise ValidationError(
                    "Type payout_breakdown_usd must be a list"  # noqa: E501
                )

            payout_breakdown_sum = sum(meta["payout_breakdown_usd"])
            if payout_breakdown_sum != self.payout:
                raise ValidationError(
                    f"payout_breakdown_usd sum { payout_breakdown_sum } doesn't equal the total payout {self.payout}."  # noqa: E501
                )
            self.number_of_payouts = len(meta["payout_breakdown_usd"])

    objects = models.Manager()
    payouts = TournamentPayoutManager()


class TournamentReservationManager(models.Manager):
    def reservation_exists(self, tournament_id, team_id):
        return self.filter(
            tournament_id=tournament_id,
            team_id=team_id,
            deleted=False,
            expires_at__gte=timezone.now(),
        ).exists()


class TournamentReservation(models.Model):
    tournament = models.ForeignKey(
        Tournament,
        related_name="reservations",
        on_delete=models.PROTECT,
    )

    team = models.ForeignKey(
        Team,
        on_delete=models.PROTECT,
    )
    expires_at = models.DateTimeField()
    deleted = models.BooleanField(default=False, null=False)

    @property
    def has_expired(self):
        return self.expires_at.astimezone(timezone.utc) < timezone.now()

    objects = TournamentReservationManager()


class TournamentEntryManager(models.Manager):
    def allowed_tournament_entry(
        self, team_id, tournament_id, kind=Tournament.Kind.IN_SEASON
    ):
        (
            start_of_today,
            end_of_today,
        ) = utils.helpers.get_eastern_time_range_starting_today()

        is_tournament_today = Tournament.objects.filter(
            id=tournament_id,
            start_date__range=(start_of_today, end_of_today),
            kind=kind,
            # contest__status=Contest.Status.OPEN,
        ).exists()

        has_team_tournament_entry_today = self.filter(
            team_id=team_id,
            tournament__start_date__range=(start_of_today, end_of_today),
            tournament__kind=kind,
            # tournament__contest__status=Contest.Status.OPEN,
        ).exists()

        if is_tournament_today:
            # 1) if the team has an entry for a tournament today,
            # they're not allowed to register for another tournament today
            if has_team_tournament_entry_today:
                return False

        start_of_tomorrow = start_of_today + datetime.timedelta(days=1)
        end_of_tomorrow = end_of_today + datetime.timedelta(days=1)

        is_tournament_tomorrow = Tournament.objects.filter(
            id=tournament_id,
            start_date__range=(start_of_tomorrow, end_of_tomorrow),
            kind=kind,
        ).exists()

        has_team_tournament_entry_tomorrow = self.filter(
            team_id=team_id,
            tournament__start_date__range=(start_of_tomorrow, end_of_tomorrow),
            tournament__kind=kind,
        ).exists()

        if is_tournament_tomorrow:
            # 2) if the team has an entry for a tournament today,
            # they're not allowed to pre-register for a tournament tomorrow
            # they must wait until tomorrow to join that tournament

            if has_team_tournament_entry_today:
                return False

            # 3)  if the team has an entry for a tournament tomorrow,
            # they can't preregister for another tournament tomorrow
            if has_team_tournament_entry_tomorrow:
                return False

        return True

    def for_tournament_in_placement_order(self, tournament_id):
        sql = """
            WITH loss_records_by_stage AS (SELECT lrbs.series_id,
                                                lrbs.stage,
                                                COUNT(lrbs.losing_entrant) AS number_of_losses,
                                                lrbs.losing_entrant
                                        FROM (SELECT CASE
                                                            WHEN sr.lineup_1_score < sr.lineup_2_score THEN gs.entry_1_id
                                                            ELSE gs.entry_2_id
                                                            END  AS losing_entrant,
                                                        gr.stage AS stage,
                                                        gs.id    AS series_id
                                                FROM game_tournament gt
                                                        JOIN game_round gr ON gt.id = gr.tournament_id
                                                        JOIN game_series gs ON gs.round_id = gr.id
                                                        JOIN game_series_games gsg ON gs.id = gsg.series_id
                                                        JOIN game_game gg ON gsg.game_id = gg.id
                                                        JOIN simulator_simulation ss ON gg.simulation_id = ss.id
                                                        JOIN simulator_result sr ON ss.result_id = sr.id
                                                WHERE gt.id = %s) AS lrbs
                                        GROUP BY lrbs.series_id, lrbs.stage, lrbs.losing_entrant)

            SELECT results.entrant_id, rank() OVER (ORDER BY results.stage DESC, results.win_or_loss DESC)
            FROM (SELECT lbrs.series_id, lbrs.stage, lbrs.losing_entrant AS entrant_id, 'LOSS' AS win_or_loss
                FROM loss_records_by_stage lbrs
                        JOIN (SELECT counted_losses.series_id, MAX(counted_losses.number_of_losses) AS max_number_of_losses
                                FROM loss_records_by_stage counted_losses
                                GROUP by counted_losses.series_id) maxxed_losses
                                ON maxxed_losses.series_id = lbrs.series_id and
                                maxxed_losses.max_number_of_losses = lbrs.number_of_losses

                UNION
                (with win_records_by_stage AS (SELECT lrbs.series_id,
                                                        lrbs.stage,
                                                        count(lrbs.winning_entrant) AS number_of_wins,
                                                        lrbs.winning_entrant
                                                FROM (SELECT CASE
                                                                WHEN sr.lineup_1_score > sr.lineup_2_score THEN gs.entry_1_id
                                                                ELSE gs.entry_2_id
                                                                END  AS winning_entrant,
                                                            gr.stage AS stage,
                                                            gs.id    AS series_id
                                                    FROM game_tournament gt
                                                                JOIN game_round gr ON gt.id = gr.tournament_id
                                                                JOIN game_series gs ON gs.round_id = gr.id
                                                                JOIN game_series_games gsg ON gs.id = gsg.series_id
                                                                JOIN game_game gg ON gsg.game_id = gg.id
                                                                JOIN simulator_simulation ss ON gg.simulation_id = ss.id
                                                                join simulator_result sr ON ss.result_id = sr.id
                                                    WHERE gt.id = %s) AS lrbs
                                                GROUP BY lrbs.series_id, lrbs.stage, lrbs.winning_entrant)
                SELECT lbrs.series_id, lbrs.stage, lbrs.winning_entrant AS entrant_id, 'WIN' AS win_or_loss
                FROM win_records_by_stage lbrs
                            JOIN (SELECT counted_wins.series_id, max(counted_wins.number_of_wins) AS max_number_of_wins
                                FROM win_records_by_stage counted_wins
                                GROUP BY counted_wins.series_id) maxxed_wins
                                ON maxxed_wins.series_id = lbrs.series_id AND maxxed_wins.max_number_of_wins = lbrs.number_of_wins
                WHERE lbrs.stage = (SELECT MAX(stage)
                                    FROM game_tournament gt
                                                JOIN game_round gr ON gt.id = gr.tournament_id
                                    WHERE gt.id = %s
                                    GROUP BY gt.id))) AS results;"""  # noqa: E501

        with connection.cursor() as cursor:
            cursor.execute(sql, [tournament_id, tournament_id, tournament_id])

            Standing = namedtuple("Standing", ["entrant_id", "place"])
            standings = [Standing(*row) for row in cursor.fetchall()]
            standings_map = {s.entrant_id: s.place for s in standings}

        entries = TournamentEntry.objects.filter(
            id__in=map(lambda s: s.entrant_id, standings)
        )
        # using `in` doesn't guarantee the order of the results, so we need to sort
        # them according to the tournament standings
        entries = sorted(entries, key=lambda e: standings_map[e.id])
        return entries


class TournamentEntry(models.Model):
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.PROTECT,
    )
    team = models.ForeignKey(
        Team,
        on_delete=models.PROTECT,
    )
    lineup = models.ForeignKey(Lineup, on_delete=models.PROTECT, blank=True, null=True)

    rank = models.PositiveIntegerField(default=0)
    seed = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TournamentEntryManager()

    class Meta:
        ordering = ["created_at"]
        verbose_name_plural = "Tournament Entries"

    def __str__(self):
        return f"{self.team.name} (Rank: {self.rank}, Id: {self.id})"


class Round(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = "NOT STARTED"
        STARTED = "STARTED"
        SIMULATING_GAMES = "SIMULATING GAMES"
        FINISHED = "FINISHED"

    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.PROTECT,
    )
    stage = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.NOT_STARTED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["stage", "created_at"]

    def __str__(self):
        teams_in_round = int(self.tournament.size / int(2**self.stage))
        if self.tournament:
            return f"{self.tournament.name} - Round {self.stage + 1} - Teams { teams_in_round }"  # noqa: E501

        return f"{self.id} - Round {self.stage + 1} - Teams { teams_in_round }"


class Series(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = "NOT STARTED"
        STARTED = "STARTED"
        FINISHED = "FINISHED"
        ERRORED = "ERRORED"

    status = models.CharField(
        max_length=14, choices=Status.choices, default=Status.NOT_STARTED
    )
    round = models.ForeignKey(
        Round,
        on_delete=models.PROTECT,
    )
    order = models.PositiveIntegerField(default=0)
    games = models.ManyToManyField(Game, related_name="series")
    entry_1 = models.ForeignKey(
        TournamentEntry,
        on_delete=models.PROTECT,
        related_name="series_entry_1",
        blank=True,
        null=True,
    )
    entry_2 = models.ForeignKey(
        TournamentEntry,
        on_delete=models.PROTECT,
        related_name="series_entry_2",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]
        verbose_name_plural = "Series"

    def clean(self):
        invalid_ids = []
        for game_id in self.games.all().values_list("id", flat=True):
            if not Game.objects.filter(id=game_id).exists():
                invalid_ids.append(game_id)
        if invalid_ids:
            raise ValidationError("Invalid game ID(s): {}".format(invalid_ids))

    def __str__(self):
        return f"{ self.round.tournament.name} - Round: { self.round.stage + 1 } - Series: {self.order + 1}"  # noqa: E501


class HeadToHeadMatchMakeQueue(models.Model):
    lineup = models.ForeignKey(Lineup, on_delete=models.PROTECT)
    score = models.FloatField(
        help_text=(
            "A score, between 0-1, that tells you what skill level this ",
            "team is in. We use to match teams with like scores.",
        )
    )
    team = models.ForeignKey(
        Team,
        on_delete=models.PROTECT,
        help_text="The submitting team. They own the attached lineup.",
    )
    paired_with = models.ForeignKey(
        Team,
        on_delete=models.PROTECT,
        null=True,
        help_text=(
            "This is the team the submitting team got matched with. ",
            "Initially null.",
        ),
        related_name="headtoheadmatchmake",
    )

    game = models.ForeignKey(
        Game,
        on_delete=models.PROTECT,
        null=True,
        help_text="The game that the pair got put into for simulation.",
    )

    max_tokens_allowed = models.PositiveIntegerField(blank=True, null=True)
    sent_to_simulator_at = models.DateTimeField(
        null=True,
        help_text=(
            "The time the pairing was done and ",
            "dispatched to the simulator (in the form of a game)",
        ),
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)


class PayoutStatus(models.TextChoices):
    INITIATED = "INITIATED"
    CONFIRMED = "CONFIRMED"
    SUPERSEDED = "SUPERSEDED"
    ERRORED = "ERRORED"


class Payout(models.Model):
    class Meta:
        indexes = (
            models.Index(
                fields=["status"],
                condition=Q(status__exact=PayoutStatus.INITIATED),
                name="game_payout_status_partial_idx",
            ),
        )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(auto_now=True)

    amount_wei = models.BigIntegerField()
    amount_usd = models.DecimalField(max_digits=20, decimal_places=10)
    usd_to_eth_conversion_rate = models.DecimalField(
        decimal_places=10, default=0, max_digits=12
    )

    team = models.ForeignKey(Team, on_delete=models.PROTECT, related_name="+")
    to_address = models.CharField(max_length=42)
    status = models.CharField(
        max_length=10, choices=PayoutStatus.choices, default=PayoutStatus.INITIATED
    )
    transaction_hash = models.CharField(max_length=66)
    nonce = models.IntegerField()

    def __str__(self):
        return f"Payout{{status={self.status}, ${self.amount_usd}/{self.amount_wei}wei (conversion rate: {self.usd_to_eth_conversion_rate}) sent to {self.to_address} aka team_id={self.team.id} with txhash={self.transaction_hash}, nonce={self.nonce}}}"  # noqa: E501


class TournamentPayout(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.PROTECT, blank=True)
    payout = models.OneToOneField(
        Payout, on_delete=models.PROTECT, related_name="tournamentpayouts", blank=True
    )

    def __str__(self):
        return f"TournamentPayout{{tournament_id={self.tournament.id}, payout_id={self.payout.id}}}"  # noqa: E501

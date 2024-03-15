from uuid import uuid4

from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import F, Q
from django.utils import timezone


class BoxScore(models.Model):
    ast = models.IntegerField(help_text="Assists")
    blk = models.IntegerField(help_text="Blocks")
    drb = models.IntegerField(help_text="Defensive rebounds")
    fg = models.IntegerField(help_text="Field goals")
    fg_pct = models.FloatField(help_text="Field goal percentage")
    fga = models.IntegerField(help_text="Field goal attempts")
    ft = models.IntegerField(help_text="Free throws")
    ft_pct = models.FloatField(help_text="Free throw percentage")
    fta = models.IntegerField(help_text="Free throw attempts")
    orb = models.IntegerField(help_text="Offensive rebounds")
    pf = models.IntegerField(help_text="Personal fouls")
    pts = models.IntegerField(help_text="Points")
    stl = models.IntegerField(help_text="Steals")
    three_p = models.IntegerField(help_text="Three pointers")
    three_p_pct = models.FloatField(help_text="Three point percentage")
    three_pa = models.IntegerField(help_text="Three point attempts")
    tov = models.IntegerField(help_text="Turnovers")
    trb = models.IntegerField(help_text="Total rebounds")
    two_p = models.IntegerField(help_text="Two pointers")
    two_p_pct = models.FloatField(help_text="Two point percentage")
    two_pa = models.IntegerField(help_text="Two point attempts")


class Result(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    lineup_1_score = models.IntegerField()
    lineup_2_score = models.IntegerField()
    lineup_1_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )
    lineup_1_player_1_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )
    lineup_1_player_2_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )
    lineup_1_player_3_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )
    lineup_1_player_4_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )
    lineup_1_player_5_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )

    lineup_2_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )
    lineup_2_player_1_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )
    lineup_2_player_2_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )
    lineup_2_player_3_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )
    lineup_2_player_4_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )
    lineup_2_player_5_box_score = models.OneToOneField(
        BoxScore, on_delete=models.CASCADE, related_name="+"
    )

    def __str__(self):
        return f"Lineup 1: {self.lineup_1_score}, Lineup 2: {self.lineup_2_score}"


class PlayerPosition(models.TextChoices):
    GUARD = "G"
    FORWARD = "F"
    CENTER = "C"


class Attribute(models.TextChoices):
    NONE = "", ""
    THREE_PT_RATING = "three_pt_rating", "Three Point Shooting"
    INTERIOR_2PT_RATING = "interior_2pt_rating", "Interior Two Point Shooting"
    MIDRANGE_2PT_RATING = "midrange_2pt_rating", "Midrange Two Point Shooting"
    FT_RATING = "ft_rating", "Free Throw Shooting"
    DRB_RATING = "drb_rating", "Defensive Rebound"
    ORB_RATING = "orb_rating", "Offensive Rebound"
    AST_RATING = "ast_rating", "Passing"
    PHSICALITY_RATING = "physicality_rating", "Physicality"
    INTERIOR_DEFENSE_RATING = "interior_defense_rating", "Interior Defense"
    PERIMETER_DEFENSE_RATING = "perimeter_defense_rating", "Perimeter Defense"
    LONGEVITY_RATING = "longevity_rating", "Longevity"
    HUSTLE_RATING = "hustle_rating", "Hustle"
    BBALL_IQ_RATING = "bball_iq_rating", "Basketball IQ"
    LEADERSHIP_RATING = "leadership_rating", "Leadership"
    COACHABILITY_RATING = "coachability_rating", "Coachability"


class PlayerManager(models.Manager):
    def free_agents(self):
        return (
            self.select_related("player")
            .filter(token__lt=0, is_playable=True)
            .order_by("-player__id")
        )

    def by_team(self, team_id):
        return (
            self.select_related("player")
            .filter(player__team_id=team_id)
            .order_by("-player__id")
        )


class PlayerProgression(models.Model):
    player = models.ForeignKey(
        "simulator.Player",
        to_field="uuid",
        on_delete=models.CASCADE,
        null=False,
    )
    season = models.CharField(max_length=7, blank=False, null=False)
    # Deltas
    three_pt_delta = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    interior_2pt_delta = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )
    midrange_2pt_delta = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )
    ft_delta = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    drb_delta = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    orb_delta = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    ast_delta = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    physicality_delta = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    interior_defense_delta = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )
    perimeter_defense_delta = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )
    longevity_delta = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    hustle_delta = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    bball_iq_delta = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    leadership_delta = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    coachability_delta = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )

    newly_revealed_ratings = ArrayField(models.CharField(max_length=128), default=list)

    created_at = models.DateTimeField("date created", auto_now_add=True)
    updated_at = models.DateTimeField("date updated", default=timezone.now)

    class Meta:
        unique_together = ("season", "player")

    def __str__(self):
        return (
            f"{self.player.full_name} "
            f"({self.player.position_1} "
            f"{self.player.position_2 if self.player.position_2 else ''})"
        )


class Player(models.Model):
    class Kind(models.TextChoices):
        ON_CHAIN = "ON_CHAIN"
        OFF_CHAIN = "OFF_CHAIN"

    is_playable = models.BooleanField(default=True)
    uuid = models.UUIDField(primary_key=True)
    kind = models.CharField(max_length=32, choices=Kind.choices, default=Kind.ON_CHAIN)
    token = models.IntegerField(null=True, unique=True)
    prior_tokens = ArrayField(models.IntegerField(), default=list)
    full_name = models.CharField(max_length=128, blank=True, default="")
    canonical = models.CharField(max_length=128, blank=True, default="")
    age = models.IntegerField()
    star_rating = models.IntegerField()

    # stats
    g = models.DecimalField(
        help_text="Games played", max_digits=20, decimal_places=10, null=True
    )
    fg = models.DecimalField(
        help_text="Field goals per game", max_digits=20, decimal_places=10, null=True
    )
    fga = models.DecimalField(
        help_text="Field goal attempts per game",
        max_digits=20,
        decimal_places=10,
        null=True,
    )
    fg_pct = models.DecimalField(
        help_text="Field goal percentage", max_digits=20, decimal_places=10, null=True
    )
    three_p = models.DecimalField(
        help_text="Three pointers per game", max_digits=20, decimal_places=10, null=True
    )
    three_pa = models.DecimalField(
        help_text="Three pointer attempts per game",
        max_digits=20,
        decimal_places=10,
        null=True,
    )
    three_p_pct = models.DecimalField(
        help_text="Three point percentage", max_digits=20, decimal_places=10, null=True
    )
    two_p = models.DecimalField(
        help_text="Two pointers per game", max_digits=20, decimal_places=10, null=True
    )
    two_pa = models.DecimalField(
        help_text="Two pointer attempts per game",
        max_digits=20,
        decimal_places=10,
        null=True,
    )
    two_p_pct = models.DecimalField(
        help_text="Two point percentage", max_digits=20, decimal_places=10, null=True
    )
    ft = models.DecimalField(
        help_text="Free throws per game", max_digits=20, decimal_places=10, null=True
    )
    fta = models.DecimalField(
        help_text="Free throw attempts per game",
        max_digits=20,
        decimal_places=10,
        null=True,
    )
    ft_pct = models.DecimalField(
        help_text="Free throw percentage", max_digits=20, decimal_places=10, null=True
    )
    orpg = models.DecimalField(
        help_text="Offensive rebounds per game",
        max_digits=20,
        decimal_places=10,
        null=True,
    )
    drpg = models.DecimalField(
        help_text="Defensive rebounds per game",
        max_digits=20,
        decimal_places=10,
        null=True,
    )
    rpg = models.DecimalField(
        help_text="Rebounds per game", max_digits=20, decimal_places=10, null=True
    )
    apg = models.DecimalField(
        help_text="Assists per game", max_digits=20, decimal_places=10, null=True
    )
    spg = models.DecimalField(
        help_text="Steals per game", max_digits=20, decimal_places=10, null=True
    )
    bpg = models.DecimalField(
        help_text="Blocks per game", max_digits=20, decimal_places=10, null=True
    )
    tpg = models.DecimalField(
        help_text="Turnovers per game", max_digits=20, decimal_places=10, null=True
    )
    fpg = models.DecimalField(
        help_text="Fouls per game", max_digits=20, decimal_places=10, null=True
    )
    ppg = models.DecimalField(
        help_text="Points per game", max_digits=20, decimal_places=10, null=True
    )

    # player visual aspects
    accessory = models.CharField(max_length=128, null=True)
    balls = models.CharField(max_length=128, null=True)
    exo_shell = models.CharField(max_length=128, null=True)
    finger_tips = models.CharField(max_length=128, null=True)
    hair = models.CharField(max_length=128, null=True)
    jersey_trim = models.CharField(max_length=128, null=True)
    background = models.CharField(max_length=128, null=True)
    ear_plate = models.CharField(max_length=128, null=True)
    face = models.CharField(max_length=128, null=True)
    guts = models.CharField(max_length=128, null=True)
    jersey = models.CharField(max_length=128, null=True)
    ensemble = models.CharField(max_length=128, null=True)

    # Attributes
    three_pt_rating = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    interior_2pt_rating = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )
    midrange_2pt_rating = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )
    ft_rating = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    drb_rating = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    orb_rating = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    ast_rating = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    physicality_rating = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )
    interior_defense_rating = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )
    perimeter_defense_rating = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )
    longevity_rating = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    hustle_rating = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    bball_iq_rating = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    leadership_rating = models.DecimalField(max_digits=20, decimal_places=10, null=True)
    coachability_rating = models.DecimalField(
        max_digits=20, decimal_places=10, null=True
    )

    top_attribute_1 = models.CharField(
        max_length=35, choices=Attribute.choices, default=Attribute.NONE
    )
    top_attribute_2 = models.CharField(
        max_length=35, choices=Attribute.choices, default=Attribute.NONE
    )
    top_attribute_3 = models.CharField(
        max_length=35, choices=Attribute.choices, default=Attribute.NONE
    )

    position_1 = models.CharField(
        max_length=20, choices=PlayerPosition.choices, null=True
    )
    position_2 = models.CharField(
        max_length=20, choices=PlayerPosition.choices, null=True
    )

    created_at = models.DateTimeField("date created", auto_now_add=True)
    updated_at = models.DateTimeField("date updated", default=timezone.now)

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_position_should_not_equal",
                check=~Q(Q(position_1=F("position_2")) & Q(position_2=F("position_1"))),
            ),
        ]

    def __str__(self):
        return (
            f"{self.full_name} "
            f"({self.position_1} "
            f"{self.position_2 if self.position_2 else ''})"
        )

    @property
    def is_free_agent(self):
        if self.token is None:
            return True
        return False

    @property
    def is_ft_rating_revealed(self):
        if self.ft_rating:
            return True
        return False

    @property
    def is_three_pt_rating_revealed(self):
        if self.three_pt_rating:
            return True

        return False

    @property
    def is_interior_2pt_rating_revealed(self):
        if self.interior_2pt_rating:
            return True

        return False

    @property
    def is_midrange_2pt_rating_revealed(self):
        if self.midrange_2pt_rating:
            return True
        return False

    @property
    def is_drb_rating_revealed(self):
        if self.drb_rating:
            return True
        return False

    @property
    def is_orb_rating_revealed(self):
        if self.orb_rating:
            return True
        return False

    @property
    def is_ast_rating_revealed(self):
        if self.ast_rating:
            return True

        return False

    @property
    def is_physicality_rating_revealed(self):
        if self.physicality_rating:
            return True
        return False

    @property
    def is_interior_defense_rating_revealed(self):
        if self.interior_defense_rating:
            return True
        return False

    @property
    def is_perimeter_defense_rating_revealed(self):
        if self.perimeter_defense_rating:
            return True
        return False

    @property
    def is_longevity_rating_revealed(self):
        if self.longevity_rating:
            return True

        return False

    @property
    def is_hustle_rating_revealed(self):
        if self.hustle_rating:
            return True

        return False

    @property
    def is_bball_iq_rating_revealed(self):
        if self.bball_iq_rating:
            return True

        return False

    @property
    def is_leadership_rating_revealed(self):
        if self.leadership_rating:
            return True

        return False

    @property
    def is_coachability_rating_revealed(self):
        if self.coachability_rating:
            return True

        return False

    objects = PlayerManager()


class Simulation(models.Model):
    """Models a game submission to the simulator and tracks progress"""

    class Status(models.TextChoices):
        NOT_CREATED = "NOT CREATED"
        PENDING = "PENDING"
        STARTED = "STARTED"
        FINISHED = "FINISHED"
        ERRORED = "ERRORED"
        TERMINAL_ERROR = "TERMINAL ERROR"
        TIMED_OUT = "TIMED OUT"

    lineup_1_uuids = ArrayField(models.UUIDField(), size=5)
    lineup_2_uuids = ArrayField(models.UUIDField(), size=5)

    uuid = models.UUIDField(
        null=True, unique=True, help_text="The simulator UUID if successfully created"
    )
    status = models.CharField(
        max_length=14, choices=Status.choices, default=Status.NOT_CREATED
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    error_msg = models.TextField(
        default="", blank=True, help_text="The error message if one occurred"
    )
    num_retries = models.IntegerField(
        default=0, help_text="The number of times we have retried"
    )
    next_retry_at = models.DateTimeField(default=timezone.now)
    result = models.OneToOneField(Result, null=True, on_delete=models.PROTECT)

    class Meta:
        index_together = [("status", "num_retries")]

    def __str__(self):
        if self.uuid:
            return f"{self.status} - {self.uuid}"
        else:
            return f"{self.status}"


class PlayByPlay(models.Model):
    simulation = models.OneToOneField(
        Simulation, on_delete=models.PROTECT, related_name="play_by_play"
    )
    feed = models.TextField(null=True)


class BaseGameStats(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid4)
    simulation = models.ForeignKey(
        "simulator.Simulation",
        to_field="uuid",
        on_delete=models.CASCADE,
        null=False,
    )
    won = models.BooleanField(blank=False, null=False)
    fg = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Field goals"
    )
    ft = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Free throws"
    )
    pf = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Pf"
    )
    ast = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Assists"
    )
    blk = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Blocks"
    )
    drb = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Defensive rebounds"
    )
    fga = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Field goal attempts"
    )
    fta = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Free throw attempts"
    )
    orb = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Offensive rebounds"
    )
    pts = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Points"
    )
    stl = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Steals"
    )
    tov = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Turnovers"
    )
    trb = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Total rebounds"
    )
    two_p = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Two pointers"
    )
    fg_pct = models.DecimalField(
        max_digits=20,
        decimal_places=10,
        null=True,
        verbose_name="Fielg goals percentage",
    )
    ft_pct = models.DecimalField(
        max_digits=20,
        decimal_places=10,
        null=True,
        verbose_name="Free throws percentage",
    )
    two_pa = models.DecimalField(
        max_digits=20,
        decimal_places=10,
        null=True,
        verbose_name="Two pointers attempts",
    )
    three_p = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, verbose_name="Three pointers"
    )
    three_pa = models.DecimalField(
        max_digits=20,
        decimal_places=10,
        null=True,
        verbose_name="Three pointers attempts",
    )
    two_p_pct = models.DecimalField(
        max_digits=20,
        decimal_places=10,
        null=True,
        verbose_name="Two pointers percentage",
    )
    three_p_pct = models.DecimalField(
        max_digits=20,
        decimal_places=10,
        null=True,
        verbose_name="Three pointers percentage",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class PlayerGameStats(BaseGameStats):
    player = models.ForeignKey(
        "simulator.Player",
        to_field="uuid",
        on_delete=models.CASCADE,
        null=False,
    )


class TeamGameStats(BaseGameStats):
    team = models.ForeignKey(
        "game.Team",
        on_delete=models.CASCADE,
        null=False,
    )


class HistoricalPlayerStats(models.Model):
    season = models.CharField(max_length=7, blank=False, null=False)
    player_token = models.IntegerField(unique=False, blank=False, null=False)
    player_canonical = models.CharField(
        max_length=128, unique=False, blank=False, null=False
    )
    player_uuid = models.UUIDField(unique=False, blank=False, null=False)
    player = player = models.ForeignKey(
        "simulator.Player",
        to_field="uuid",
        on_delete=models.CASCADE,
        null=False,
    )
    games = models.IntegerField(default=0, blank=False, null=False)
    wins = models.IntegerField(default=0, blank=False, null=False)
    losses = models.IntegerField(default=0, blank=False, null=False)
    fg = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    ft = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    fpg = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    apg = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    bpg = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    drpg = models.DecimalField(
        max_digits=20, decimal_places=10, blank=False, null=False
    )
    fga = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    fta = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    orpg = models.DecimalField(
        max_digits=20, decimal_places=10, blank=False, null=False
    )
    ppg = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    spg = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    tpg = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    rpg = models.DecimalField(max_digits=20, decimal_places=10, blank=False, null=False)
    two_p = models.DecimalField(
        max_digits=20, decimal_places=10, blank=False, null=False
    )
    two_pa = models.DecimalField(
        max_digits=20, decimal_places=10, blank=False, null=False
    )
    three_p = models.DecimalField(
        max_digits=20, decimal_places=10, blank=False, null=False
    )
    three_pa = models.DecimalField(
        max_digits=20, decimal_places=10, blank=False, null=False
    )
    fg_pct = models.DecimalField(
        max_digits=20, decimal_places=10, blank=False, null=True
    )
    ft_pct = models.DecimalField(
        max_digits=20, decimal_places=10, blank=False, null=True
    )
    two_p_pct = models.DecimalField(
        max_digits=20, decimal_places=10, blank=False, null=True
    )
    three_p_pct = models.DecimalField(
        max_digits=20, decimal_places=10, blank=False, null=True
    )

    class Meta:
        unique_together = ("season", "player")

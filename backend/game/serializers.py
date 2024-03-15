import json

from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from django.db import transaction
from django.utils import timezone
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers
from rest_framework.exceptions import ErrorDetail, ValidationError
from rest_framework.validators import UniqueValidator

import game.models
import game.utils
import moderation.models
import moderation.service
import simulator.model_views
import simulator.models
import simulator.serializers
from game.validation.validator import (
    PlayerNameCompositionValidator,
    TeamNameCompositionValidator,
)

numeric = RegexValidator(r"^[0-9+]", "Only digit characters.")


class GameUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField()


class TeamName(serializers.Serializer):
    name = serializers.CharField(
        min_length=2,
        max_length=32,
        validators=[
            UniqueValidator(
                queryset=game.models.Team.objects.all(),
                message="Team names must be unique",
            ),
            TeamNameCompositionValidator(),
        ],
    )

    @property
    def user(self):
        return self.context["request"].user

    def _is_team_name_changed(self, current_name, new_name):
        return current_name != new_name and new_name is not None

    def update(self, instance, validated_data):
        if self._is_team_name_changed(instance.name, validated_data.get("name")):
            moderation.service.ModerationService().submit_team_name_change(
                team_id=instance.id,
                new_name=validated_data["name"],
                requesting_user=get_user_model().objects.get(id=self.user.id),
            )
        return instance


class TeamLogo(serializers.Serializer):
    path = serializers.CharField()

    @property
    def user(self):
        return self.context["request"].user

    def update(self, instance, validated_data):
        moderation.service.ModerationService().submit_team_logo_change(
            team_id=instance.id,
            path=validated_data["path"],
            requesting_user=get_user_model().objects.get(id=self.user.id),
        )

        return instance


class TeamStats(serializers.Serializer):
    wins = serializers.IntegerField()
    losses = serializers.IntegerField()
    played_today = serializers.IntegerField()
    won_this_week = serializers.IntegerField()
    total_sp = serializers.IntegerField()
    mm_games_this_week = serializers.IntegerField()
    played_this_week = serializers.IntegerField()
    rotating_player_points = serializers.IntegerField()
    rotating_team_blocks = serializers.IntegerField()
    rotating_player_rebounds = serializers.IntegerField()
    rotating_team_assists = serializers.IntegerField()
    rotating_player_blocks = serializers.IntegerField()
    rotating_player_assists = serializers.IntegerField()
    rotating_team_steals = serializers.IntegerField()
    rotating_player_three_p = serializers.IntegerField()
    rotating_team_points = serializers.IntegerField()


class TeamSerializer(serializers.ModelSerializer):
    wins = serializers.SerializerMethodField()
    losses = serializers.SerializerMethodField()
    played_today = serializers.SerializerMethodField()
    won_this_week = serializers.SerializerMethodField()
    total_sp = serializers.SerializerMethodField()
    mm_games_this_week = serializers.SerializerMethodField()
    played_this_week = serializers.SerializerMethodField()
    rotating_player_points = serializers.SerializerMethodField()
    rotating_team_blocks = serializers.SerializerMethodField()
    rotating_player_rebounds = serializers.SerializerMethodField()
    rotating_team_assists = serializers.SerializerMethodField()
    rotating_player_blocks = serializers.SerializerMethodField()
    rotating_player_assists = serializers.SerializerMethodField()
    rotating_team_steals = serializers.SerializerMethodField()
    rotating_player_three_p = serializers.SerializerMethodField()
    rotating_team_points = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Team
        fields = [
            "id",
            "name",
            "wins",
            "losses",
            "played_today",
            "won_this_week",
            "total_sp",
            "rotating_player_points",
            "rotating_team_blocks",
            "rotating_player_rebounds",
            "rotating_team_assists",
            "rotating_player_blocks",
            "rotating_player_assists",
            "rotating_team_steals",
            "rotating_player_three_p",
            "rotating_team_points",
            "mm_games_this_week",
            "played_this_week",
            "path",
        ]
        read_only_fields = [
            "id",
            "name",
            "wins",
            "losses",
            "played_today",
            "won_this_week",
            "total_sp",
            "rotating_player_points",
            "rotating_team_blocks",
            "rotating_player_rebounds",
            "rotating_team_assists",
            "rotating_player_blocks",
            "rotating_player_assists",
            "rotating_team_steals",
            "rotating_player_three_p",
            "rotating_team_points",
            "mm_games_this_week",
            "played_this_week",
            "path",
        ]

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_wins(self, team):
        # This will be populated by to_representation method
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_losses(self, team):
        # This will be populated by to_representation method
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_played_today(self, team):
        # This will be populated by to_representation method
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_won_this_week(self, team):
        # This will be populated by to_representation method
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_total_sp(self, team):
        # This will be populated by to_representation method
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_rotating_player_points(self, team):
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_rotating_team_blocks(self, team):
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_rotating_player_rebounds(self, team):
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_rotating_team_assists(self, team):
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_rotating_player_blocks(self, team):
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_rotating_player_assists(self, team):
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_rotating_team_steals(self, team):
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_rotating_player_three_p(self, team):
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_rotating_team_points(self, team):
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_mm_games_this_week(self, team):
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_played_this_week(self, team):
        return 0

    def to_representation(self, team):
        my_model_view = simulator.model_views.CurrentSeasonTeamSPViewProxy
        team_stats = my_model_view.objects.by_team_id(team.id)
        representation = super().to_representation(team)
        if team_stats:
            representation.update(TeamStats(team_stats).data)
        return representation


class FlattenMixin:
    fields_to_flatten = []

    def flatten(self, representation):
        """Move fields from simulated to Player representation."""
        for item in self.fields_to_flatten:
            profile_representation = representation.pop(item)
            if profile_representation:
                for key in profile_representation:
                    representation[key] = profile_representation[key]

        return representation


class Player(serializers.ModelSerializer, FlattenMixin):
    simulated = simulator.serializers.Player(read_only=True)
    fields_to_flatten = ["simulated"]
    wins = serializers.SerializerMethodField()
    losses = serializers.SerializerMethodField()
    historical_stats = serializers.SerializerMethodField()
    career_average = serializers.SerializerMethodField()
    career_average_one_token = serializers.SerializerMethodField()
    career_average_three_tokens = serializers.SerializerMethodField()
    career_average_five_tokens = serializers.SerializerMethodField()
    current_season_stats = serializers.SerializerMethodField()
    current_season_stats_one_token = serializers.SerializerMethodField()
    current_season_stats_three_tokens = serializers.SerializerMethodField()
    current_season_stats_five_tokens = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Player
        fields = [
            "id",
            "team",
            "wins",
            "losses",
            "historical_stats",
            "career_average",
            "career_average_one_token",
            "career_average_three_tokens",
            "career_average_five_tokens",
            "current_season_stats",
            "current_season_stats_one_token",
            "current_season_stats_three_tokens",
            "current_season_stats_five_tokens",
            "simulated",
            "first_named_on",
        ]

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_wins(self, player):
        my_model_view = simulator.model_views.CurrentSeasonPlayerStatsViewProxy
        player_stats = my_model_view.objects.by_player_token(player.simulated.token)

        if player_stats:
            return player_stats.wins

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_losses(self, player):
        my_model_view = simulator.model_views.CurrentSeasonPlayerStatsViewProxy
        player_stats = my_model_view.objects.by_player_token(player.simulated.token)
        if player_stats:
            return player_stats.losses

    @swagger_serializer_method(serializer_or_field=serializers.DictField())
    def get_historical_stats(self, player):
        result = {}
        player_stats = simulator.models.HistoricalPlayerStats.objects.filter(
            player_token=player.simulated.token
        )
        for item in player_stats:
            result[item.season] = simulator.serializers.PlayerStats(item).data
        return result

    @swagger_serializer_method(serializer_or_field=simulator.serializers.PlayerStats())
    def get_career_average(self, player):
        # return self._get_career_average(player)
        my_model_view = simulator.model_views.AllTimePlayerStatsViewProxy
        player_stats = my_model_view.objects.by_player_token(player.simulated.token)

        if player_stats:
            return simulator.serializers.PlayerStats(player_stats).data
        return {}

    @swagger_serializer_method(serializer_or_field=simulator.serializers.PlayerStats())
    def get_career_average_one_token(self, player):
        return self._get_career_average(player, tokens="one")

    @swagger_serializer_method(serializer_or_field=simulator.serializers.PlayerStats())
    def get_career_average_three_tokens(self, player):
        return self._get_career_average(player, tokens="three")

    @swagger_serializer_method(serializer_or_field=simulator.serializers.PlayerStats())
    def get_career_average_five_tokens(self, player):
        return self._get_career_average(player, tokens="five")

    def _get_career_average(self, player, tokens=None):
        my_model_view = {
            "one": simulator.model_views.AllTimePlayerStatsViewProxyOneToken,
            "three": simulator.model_views.AllTimePlayerStatsViewProxyThreeTokens,
            "five": simulator.model_views.AllTimePlayerStatsViewProxyFiveTokens,
        }.get(tokens, simulator.model_views.AllTimePlayerStatsViewProxy)
        player_stats = my_model_view.objects.by_player_token(player.simulated.token)

        if player_stats:
            return simulator.serializers.PlayerStats(player_stats).data
        return {}

    @swagger_serializer_method(serializer_or_field=simulator.serializers.PlayerStats())
    def get_current_season_stats(self, player):
        # return self._get_current_season_stats(player)
        my_model_view = simulator.model_views.CurrentSeasonPlayerStatsViewProxy
        player_stats = my_model_view.objects.by_player_token(player.simulated.token)
        if player_stats:
            return simulator.serializers.PlayerStats(player_stats).data
        return {}

    @swagger_serializer_method(serializer_or_field=simulator.serializers.PlayerStats())
    def get_current_season_stats_one_token(self, player):
        return self._get_current_season_stats(player, "one")

    @swagger_serializer_method(serializer_or_field=simulator.serializers.PlayerStats())
    def get_current_season_stats_three_tokens(self, player):
        return self._get_current_season_stats(player, "three")

    @swagger_serializer_method(serializer_or_field=simulator.serializers.PlayerStats())
    def get_current_season_stats_five_tokens(self, player):
        return self._get_current_season_stats(player, "five")

    def _get_current_season_stats(self, player, tokens=None):
        my_model_view = {
            "one": simulator.model_views.CurrentSeasonPlayerStatsViewProxyOneToken,
            "three": simulator.model_views.CurrentSeasonPlayerStatsViewProxyThreeTokens,
            "five": simulator.model_views.CurrentSeasonPlayerStatsViewProxyFiveTokens,
        }.get(tokens, simulator.model_views.CurrentSeasonPlayerStatsViewProxy)
        player_stats = my_model_view.objects.by_player_token(player.simulated.token)

        if player_stats:
            return simulator.serializers.PlayerStats(player_stats).data
        return {}

    def to_representation(self, obj):
        return super().flatten(super().to_representation(obj))


class PlayerV2(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    positions = serializers.SerializerMethodField()
    top_attributes = serializers.SerializerMethodField()
    team = serializers.SerializerMethodField()
    first_named_on = serializers.SerializerMethodField()
    wins = serializers.SerializerMethodField()
    losses = serializers.SerializerMethodField()

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_id(self, simulated_player):
        return simulated_player.player.id

    @swagger_serializer_method(
        serializer_or_field=serializers.MultipleChoiceField(
            choices=[c[0] for c in simulator.models.PlayerPosition.choices]
        )
    )
    def get_positions(self, obj):
        positions = []

        if obj.position_1:
            positions.append(obj.position_1)

        if obj.position_2:
            positions.append(obj.position_2)

        return positions

    @swagger_serializer_method(serializer_or_field=serializers.ListField())
    def get_top_attributes(self, obj):
        top_attributes = []

        if obj.top_attribute_1:
            top_attributes.append(obj.top_attribute_1)

        if obj.top_attribute_2:
            top_attributes.append(obj.top_attribute_2)

        if obj.top_attribute_3:
            top_attributes.append(obj.top_attribute_3)

        return top_attributes

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_team(self, simulated_player):
        return simulated_player.player.team_id

    @swagger_serializer_method(serializer_or_field=serializers.CharField())
    def get_first_named_on(self, simulated_player):
        return simulated_player.player.first_named_on

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_wins(self, simulated_player):
        # This will be populated by to_representation method
        return 0

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_losses(self, simulated_player):
        # This will be populated by to_representation method
        return 0

    def to_representation(self, simulated_player):
        my_model_view = simulator.model_views.CurrentSeasonPlayerStatsViewProxy
        player_stats = my_model_view.objects.by_player_token(simulated_player.token)
        representation = super().to_representation(simulated_player)
        representation.update(simulator.serializers.PlayerStats(player_stats).data)
        return representation

    class Meta:
        model = simulator.models.Player
        fields = [
            "id",
            "token",
            "kind",
            "full_name",
            "age",
            "star_rating",
            "g",
            "fg",
            "fga",
            "fg_pct",
            "three_p",
            "three_pa",
            "three_p_pct",
            "two_p",
            "two_pa",
            "two_p_pct",
            "ft",
            "fta",
            "ft_pct",
            "orpg",
            "drpg",
            "rpg",
            "apg",
            "spg",
            "bpg",
            "tpg",
            "fpg",
            "ppg",
            "wins",
            "losses",
            "accessory",
            "balls",
            "exo_shell",
            "finger_tips",
            "hair",
            "jersey_trim",
            "background",
            "ear_plate",
            "face",
            "guts",
            "jersey",
            "ensemble",
            "three_pt_rating",
            "interior_2pt_rating",
            "midrange_2pt_rating",
            "ft_rating",
            "drb_rating",
            "orb_rating",
            "ast_rating",
            "physicality_rating",
            "interior_defense_rating",
            "perimeter_defense_rating",
            "longevity_rating",
            "hustle_rating",
            "bball_iq_rating",
            "leadership_rating",
            "coachability_rating",
            "top_attribute_1",
            "top_attribute_2",
            "top_attribute_3",
            "position_1",
            "position_2",
            "positions",
            "top_attributes",
            "team",
            "first_named_on",
        ]


class PlayerProgression(serializers.ModelSerializer):
    player = simulator.serializers.Player(read_only=True)

    class Meta:
        model = simulator.models.PlayerProgression
        exclude = ["id", "season", "created_at", "updated_at"]


class Lineup(serializers.ModelSerializer):
    team = TeamSerializer()
    player_1 = Player()
    player_2 = Player()
    player_3 = Player()
    player_4 = Player()
    player_5 = Player()

    class Meta:
        model = game.models.Lineup
        fields = [
            "id",
            "team",
            "player_1",
            "player_2",
            "player_3",
            "player_4",
            "player_5",
        ]


class Contest(serializers.ModelSerializer):
    class Meta:
        model = game.models.Contest
        fields = ["id", "status", "kind", "played_at"]
        read_only_fields = ["id", "status", "kind", "played_at"]


def _validate_player_positions(player_1, player_2, player_3, player_4, player_5):
    # check player positions correct
    if (
        player_1.simulated.position_1 != simulator.models.PlayerPosition.GUARD
        and player_1.simulated.position_2 != simulator.models.PlayerPosition.GUARD
    ):
        raise ValidationError("Player 1 must be a guard.")

    if (
        player_2.simulated.position_1 != simulator.models.PlayerPosition.GUARD
        and player_2.simulated.position_2 != simulator.models.PlayerPosition.GUARD
    ):
        raise ValidationError("Player 2 must be a guard.")

    if (
        player_3.simulated.position_1 != simulator.models.PlayerPosition.FORWARD
        and player_3.simulated.position_2 != simulator.models.PlayerPosition.FORWARD
    ):
        raise ValidationError("Player 3 must be a forward.")

    if (
        player_4.simulated.position_1 != simulator.models.PlayerPosition.FORWARD
        and player_4.simulated.position_2 != simulator.models.PlayerPosition.FORWARD
    ):
        raise ValidationError("Player 4 must be a forward.")

    if (
        player_5.simulated.position_1 != simulator.models.PlayerPosition.CENTER
        and player_5.simulated.position_2 != simulator.models.PlayerPosition.CENTER
    ):
        raise ValidationError("Player 5 must be a center.")


@transaction.atomic()
def create_lineup(team, player_1, player_2, player_3, player_4, player_5):
    for player in [player_1, player_2, player_3, player_4, player_5]:
        if player.simulated.token < 0:  # player is a free agent skip
            continue

        if player.team_id != team.id:
            raise ValidationError(
                f"Player token={player.id} is not owned by team={team.id}"
            )

    _validate_player_positions(player_1, player_2, player_3, player_4, player_5)

    return game.models.Lineup.objects.create(
        team=team,
        player_1=player_1,
        player_2=player_2,
        player_3=player_3,
        player_4=player_4,
        player_5=player_5,
    )


class CreateLineup(serializers.Serializer):
    player_1 = serializers.IntegerField()
    player_2 = serializers.IntegerField()
    player_3 = serializers.IntegerField()
    player_4 = serializers.IntegerField()
    player_5 = serializers.IntegerField()

    class Meta:
        fields = ("player_1", "player_2", "player_3", "player_4", "player_5")

    def create(self, validated_data):
        # get team
        team = game.models.Team.objects.get(owner=self.context["request"].user.id)

        # get player
        player_1 = game.models.Player.objects.select_related("simulated").get(
            id=validated_data["player_1"]
        )
        player_2 = game.models.Player.objects.select_related("simulated").get(
            id=validated_data["player_2"]
        )
        player_3 = game.models.Player.objects.select_related("simulated").get(
            id=validated_data["player_3"]
        )
        player_4 = game.models.Player.objects.select_related("simulated").get(
            id=validated_data["player_4"]
        )
        player_5 = game.models.Player.objects.select_related("simulated").get(
            id=validated_data["player_5"]
        )

        return create_lineup(team, player_1, player_2, player_3, player_4, player_5)


class Reservation(serializers.ModelSerializer):
    team = TeamSerializer()
    tokens_required = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Reservation
        fields = ("id", "game", "team", "tokens_required", "expires_at")

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_tokens_required(self, obj):
        return obj.game.contest.tokens_required


class GamePlayByPlay(serializers.Serializer):
    feed = serializers.SerializerMethodField()

    def get_feed(self, play_by_play):
        return json.loads(play_by_play.feed)


class GameQuerySerializer(serializers.Serializer):
    team = serializers.IntegerField(required=False)
    status = serializers.ChoiceField(
        choices=game.models.Contest.Status,
        default=game.models.Contest.Status.OPEN,
        required=False,
    )

    @property
    def requesting_user(self):
        return self.context["request"].user

    def _get_team(self, user):
        return game.models.Team.objects.get(owner_id=user.id)

    def _validate_team_request(self):
        error = {}

        if self.data.get("team"):
            if self.requesting_user.is_anonymous:
                # user is anonymous
                if self.data.get("status") != game.models.Contest.Status.COMPLETE:
                    error = {
                        "team": [
                            ErrorDetail(
                                "You cannot request a team's games that are not complete "  # noqa: E501
                                + "unless you own that team."
                            )
                        ]
                    }
            else:
                # user is logged in
                if (
                    self._get_team(self.requesting_user).id != self.data.get("team")
                    and self.data.get("status") != game.models.Contest.Status.COMPLETE
                ):
                    error = {
                        "team": [
                            ErrorDetail(
                                "You cannot request a team's games that are not complete "  # noqa: E501
                                + "unless you own that team."
                            )
                        ]
                    }

        return error

    def is_valid(self, raise_exception=True):
        if not super().is_valid(raise_exception):
            return False

        error = self._validate_team_request()
        if error:
            self._validated_data = {}
            self._errors = error

        if self._errors and raise_exception:
            raise ValidationError(self.errors)

        return not bool(self._errors)


class GameResultListing(serializers.Serializer):
    lineup_1_team_id = serializers.IntegerField()
    lineup_1_team_name = serializers.CharField()
    lineup_1_score = serializers.IntegerField()
    lineup_2_team_id = serializers.IntegerField()
    lineup_2_team_name = serializers.CharField()
    lineup_2_score = serializers.IntegerField()


class BoxScoreListing(serializers.Serializer):
    assists = serializers.SerializerMethodField()
    blocks = serializers.SerializerMethodField()
    defensive_rebounds = serializers.SerializerMethodField()
    field_goals = serializers.SerializerMethodField()
    field_goal_percentage = serializers.SerializerMethodField()
    field_goal_attempts = serializers.SerializerMethodField()
    free_throws = serializers.SerializerMethodField()
    free_throw_percentage = serializers.SerializerMethodField()
    free_throw_attempts = serializers.SerializerMethodField()
    offensive_rebounds = serializers.SerializerMethodField()
    fouls = serializers.SerializerMethodField()
    points = serializers.SerializerMethodField()
    steals = serializers.SerializerMethodField()
    three_pointers = serializers.SerializerMethodField()
    three_point_percentage = serializers.SerializerMethodField()
    three_point_attempts = serializers.SerializerMethodField()
    turnovers = serializers.SerializerMethodField()
    rebounds = serializers.SerializerMethodField()
    two_pointers = serializers.SerializerMethodField()
    two_point_percentage = serializers.SerializerMethodField()
    two_point_attempts = serializers.SerializerMethodField()

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_assists(self, obj):
        return obj.ast

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_blocks(self, obj):
        return obj.blk

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_defensive_rebounds(self, obj):
        return obj.drb

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_field_goals(self, obj):
        return obj.fg

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_field_goal_percentage(self, obj):
        return obj.fg_pct

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_field_goal_attempts(self, obj):
        return obj.fga

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_free_throws(self, obj):
        return obj.ft

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_free_throw_percentage(self, obj):
        return obj.ft_pct

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_free_throw_attempts(self, obj):
        return obj.fta

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_offensive_rebounds(self, obj):
        return obj.orb

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_fouls(self, obj):
        return obj.pf

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_points(self, obj):
        return obj.pts

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_steals(self, obj):
        return obj.stl

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_three_pointers(self, obj):
        return obj.three_p

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_three_point_percentage(self, obj):
        return obj.three_p_pct

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_three_point_attempts(self, obj):
        return obj.three_pa

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_turnovers(self, obj):
        return obj.tov

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_rebounds(self, obj):
        return obj.trb

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_two_pointers(self, obj):
        return obj.two_p

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_two_point_percentage(self, obj):
        return obj.two_p_pct

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_two_point_attempts(self, obj):
        return obj.two_pa


def game_results_summary(game):
    if game.simulation and game.simulation.result:
        results = game.simulation.result
        return {
            "lineup_1_team_id": game.lineup_1.team_id,
            "lineup_1_team_name": game.lineup_1.team.name,
            "lineup_1_score": results.lineup_1_score,
            "lineup_2_team_id": game.lineup_2.team_id,
            "lineup_2_team_name": game.lineup_2.team.name,
            "lineup_2_score": results.lineup_2_score,
        }
    return {}


class TournamentTeamModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = game.models.Team
        fields = ["id", "name", "wins", "losses", "path"]
        read_only_fields = ["id", "name", "wins", "losses", "path"]


class TournamentEntryTeam(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    wins = serializers.SerializerMethodField()
    losses = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()
    seed = serializers.SerializerMethodField()

    class Meta:
        model = game.models.TournamentEntry
        fields = ("name", "id", "wins", "losses", "path", "rank", "seed")

    @swagger_serializer_method(serializer_or_field=serializers.CharField())
    def get_id(self, entry):
        return entry.team.id

    @swagger_serializer_method(serializer_or_field=serializers.CharField())
    def get_name(self, entry):
        return entry.team.name

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_wins(self, entry):
        return entry.team.wins

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_losses(self, entry):
        return entry.team.losses

    @swagger_serializer_method(serializer_or_field=serializers.CharField())
    def get_path(self, entry):
        return entry.team.path

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_seed(self, entry):
        return entry.seed


class TournamentLineupModelSerializer(serializers.ModelSerializer):
    player_1 = Player()
    player_2 = Player()
    player_3 = Player()
    player_4 = Player()
    player_5 = Player()

    class Meta:
        model = game.models.Lineup
        fields = [
            "id",
            "player_1",
            "player_2",
            "player_3",
            "player_4",
            "player_5",
        ]


class TournamentListing(serializers.ModelSerializer):
    entries = serializers.SerializerMethodField()
    results = serializers.SerializerMethodField()
    round_count = serializers.SerializerMethodField()
    tokens_required = serializers.SerializerMethodField()
    is_current_user_enrolled = serializers.SerializerMethodField()
    kind = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Tournament
        fields = (
            "id",
            "name",
            "payout",
            "lineup_submission_start",
            "lineup_submission_cutoff",
            "public_publish_datetime",
            "round_count",
            "visibility_at",
            "start_date",
            "end_date",
            "meta",
            "results",
            "entries",
            "tokens_required",
            "kind",
            "is_current_user_enrolled",
            "created_at",
        )

    @property
    def user(self):
        return self.context["request"].user

    def get_results(self, tournament):
        return []

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_round_count(self, tournament):
        return game.utils.calculate_round_count(tournament.size)

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_entries(self, tournament):
        return game.models.TournamentEntry.objects.filter(tournament=tournament).count()

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_tokens_required(self, tournament):
        return tournament.contest.tokens_required

    @swagger_serializer_method(
        serializer_or_field=serializers.ChoiceField(choices=game.models.Tournament.Kind)
    )
    def get_kind(self, tournament):
        return tournament.kind

    @swagger_serializer_method(serializer_or_field=serializers.BooleanField())
    def get_is_current_user_enrolled(self, tournament):
        if not self.user.is_anonymous:
            return game.models.TournamentEntry.objects.filter(
                tournament=tournament, team__owner__id=self.user.id
            ).exists()
        return False


class TournamentReservation(serializers.ModelSerializer):
    tournament = TournamentListing()
    team = TournamentTeamModelSerializer()
    tokens_required = serializers.SerializerMethodField()

    class Meta:
        model = game.models.TournamentReservation
        fields = ("id", "tournament", "team", "tokens_required", "expires_at")

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_tokens_required(self, reservation):
        return reservation.tournament.contest.tokens_required


class TournamentSeriesGameSummary(serializers.ModelSerializer):
    id = serializers.IntegerField()
    team_1_score = serializers.SerializerMethodField()
    team_2_score = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Game
        fields = ("id", "team_1_score", "team_2_score")

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_team_1_score(self, game):
        if game.simulation.result:
            return game.simulation.result.lineup_1_score
        return None

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_team_2_score(self, game):
        if game.simulation.result:
            return game.simulation.result.lineup_2_score
        return None


class TournamentSeries(serializers.ModelSerializer):
    games = serializers.SerializerMethodField()
    team_1 = serializers.SerializerMethodField()
    team_2 = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Round
        fields = ("id", "games", "status", "team_1", "team_2")

    @property
    def request_user(self):
        return game.utils.get_request_user(self.context["request"])

    @swagger_serializer_method(
        serializer_or_field=serializers.ChoiceField(
            choices=[(s, s.value) for s in game.models.Series.Status],
            default=game.models.Series.Status.NOT_STARTED,
        )
    )
    def get_status(self, series):
        series_games = game.utils.get_series_games(self.request_user, series)
        if series_games.exists():
            return series.status
        return game.models.Series.Status.NOT_STARTED

    @swagger_serializer_method(
        serializer_or_field=TournamentSeriesGameSummary(many=True)
    )
    def get_games(self, series):
        series_games = game.utils.get_series_games(self.request_user, series)
        if series_games.exists():
            return TournamentSeriesGameSummary(
                series_games.select_related("simulation", "simulation__result"),
                many=True,
            ).data
        return []

    @swagger_serializer_method(serializer_or_field=TournamentEntryTeam())
    def get_team_1(self, series):
        series_games = game.utils.get_series_games(self.request_user, series)
        is_first_round = series.round.stage == 0
        if (series_games.exists() or is_first_round) and series.entry_1:
            return TournamentEntryTeam(series.entry_1).data
        return None

    @swagger_serializer_method(serializer_or_field=TournamentEntryTeam())
    def get_team_2(self, series):
        series_games = game.utils.get_series_games(self.request_user, series)
        is_first_round = series.round.stage == 0
        if (series_games.exists() or is_first_round) and series.entry_2:
            return TournamentEntryTeam(series.entry_2).data
        return None


class TournamentRound(serializers.ModelSerializer):
    series = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Round
        fields = (
            "id",
            "series",
        )

    @swagger_serializer_method(serializer_or_field=TournamentSeries(many=True))
    def get_series(self, round):
        if (
            game.models.Series.objects.select_related("entry_1__team", "entry_2__team")
            .filter(round=round)
            .count()
        ):
            return TournamentSeries(
                game.models.Series.objects.filter(round=round).order_by("order"),
                many=True,
                context={"request": self.context["request"]},
            ).data
        return []


class TournamentDetail(serializers.ModelSerializer):
    rounds = serializers.SerializerMethodField()
    meta = serializers.SerializerMethodField()
    round_count = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Tournament
        fields = (
            "id",
            "name",
            "kind",
            "payout",
            "lineup_submission_start",
            "lineup_reveal_date",
            "lineup_submission_cutoff",
            "visibility_at",
            "start_date",
            "meta",
            "end_date",
            "created_at",
            "rounds",
            "round_count",
            "banner_img_url",
        )

    @swagger_serializer_method(serializer_or_field=serializers.JSONField)
    def get_meta(self, tournament):
        return tournament.meta

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_round_count(self, tournament):
        return game.utils.calculate_round_count(tournament.size)

    @swagger_serializer_method(serializer_or_field=TournamentRound(many=True))
    def get_rounds(self, tournament):
        if tournament.visibility_at and tournament.visibility_at >= timezone.now():
            raise ValidationError(f"Tournament {tournament.id} has not been revealed")

        return TournamentRound(
            game.models.Round.objects.filter(tournament=tournament),
            many=True,
            context={"request": self.context["request"]},
        ).data


class TournamentGame(serializers.Serializer):
    id = serializers.SerializerMethodField()
    lineup_1 = serializers.SerializerMethodField()
    lineup_2 = serializers.SerializerMethodField()
    results = serializers.SerializerMethodField()

    def get_id(self, obj):
        return obj.id

    def get_lineup_1(self, obj):
        return TournamentLineupModelSerializer(obj.lineup_1).data

    def get_lineup_2(self, obj):
        return TournamentLineupModelSerializer(obj.lineup_2).data

    @swagger_serializer_method(serializer_or_field=simulator.serializers.Result())
    def get_results(self, obj):
        if obj.simulation is None:
            return {}
        return simulator.serializers.Result(obj.simulation.result).data


class TournamentEntryModelSerializer(serializers.ModelSerializer):
    team = TournamentTeamModelSerializer()
    lineup = TournamentLineupModelSerializer()

    class Meta:
        model = game.models.TournamentEntry
        fields = ["id", "team", "lineup", "rank", "seed"]


class TournamentPlayerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    token = serializers.IntegerField()
    full_name = serializers.CharField()


class TournamentTeamSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    wins = serializers.IntegerField()
    losses = serializers.IntegerField()
    path = serializers.CharField()


class TournamentLineupSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    player_1 = TournamentPlayerSerializer()
    player_2 = TournamentPlayerSerializer()
    player_3 = TournamentPlayerSerializer()
    player_4 = TournamentPlayerSerializer()
    player_5 = TournamentPlayerSerializer()


class TournamentEntrySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    rank = serializers.IntegerField()
    seed = serializers.IntegerField()
    positions = serializers.MultipleChoiceField(
        choices=[c[0] for c in simulator.models.PlayerPosition.choices]
    )
    team = TournamentTeamSerializer()
    lineup = TournamentLineupSerializer()


class PlayerGameListing(serializers.Serializer):
    id = serializers.IntegerField()
    status = serializers.SerializerMethodField()
    played_at = serializers.SerializerMethodField()
    results = serializers.SerializerMethodField()
    box_score = serializers.SerializerMethodField()
    player_lineup_number = serializers.SerializerMethodField()
    player_slot_number = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Game
        fields = [
            "played_at",
        ]

    def get_type(self, obj):
        return obj.contest.kind

    @swagger_serializer_method(
        serializer_or_field=serializers.ChoiceField(choices=game.models.Contest.Status)
    )
    def get_status(self, obj):
        return obj.contest.status

    @swagger_serializer_method(serializer_or_field=serializers.DateTimeField())
    def get_played_at(self, obj):
        return obj.contest.played_at

    @swagger_serializer_method(serializer_or_field=GameResultListing())
    def get_results(self, obj):
        return game_results_summary(obj)

    def _get_player_lineup_location(self, game, token_id):
        for lineup_index, lineup in enumerate([game.lineup_1, game.lineup_2]):
            for player_index, player in enumerate(
                [
                    lineup.player_1,
                    lineup.player_2,
                    lineup.player_3,
                    lineup.player_4,
                    lineup.player_5,
                ]
            ):
                if player.simulated.token == token_id:
                    return lineup_index + 1, player_index + 1

    @swagger_serializer_method(serializer_or_field=BoxScoreListing())
    def get_box_score(self, obj):
        if obj.simulation and obj.simulation.result:
            lineup_number, player_number = self._get_player_lineup_location(
                obj, self.context["token_id"]
            )

            results = obj.simulation.result
            player_box_score = getattr(
                results, f"lineup_{lineup_number}_player_{player_number}_box_score"
            )
            return BoxScoreListing(instance=player_box_score).data
        return {}

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_player_lineup_number(self, obj):
        lineup_number, _ = self._get_player_lineup_location(
            obj, self.context["token_id"]
        )
        return lineup_number

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_player_slot_number(self, obj):
        _, player_number = self._get_player_lineup_location(
            obj, self.context["token_id"]
        )
        return player_number


class GameListing(serializers.ModelSerializer):
    prize_pool = serializers.DecimalField(max_digits=20, decimal_places=10)
    number_enrolled_lineup = serializers.SerializerMethodField()
    number_enrolled_reservation = serializers.SerializerMethodField()
    max_enrollable = serializers.SerializerMethodField()
    is_current_user_enrolled_with_lineup = serializers.SerializerMethodField()
    is_current_user_enrolled_with_reservation = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    results = serializers.SerializerMethodField()
    played_at = serializers.SerializerMethodField()
    revealed = serializers.SerializerMethodField()
    tokens_required = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Game
        fields = [
            "id",
            "number_enrolled_lineup",
            "number_enrolled_reservation",
            "max_enrollable",
            "is_current_user_enrolled_with_lineup",
            "is_current_user_enrolled_with_reservation",
            "status",
            "revealed",
            "results",
            "prize_pool",
            "played_at",
            "tokens_required",
        ]

    @property
    def user(self):
        return self.context["request"].user

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_tokens_required(self, obj):
        return obj.contest.tokens_required

    @swagger_serializer_method(serializer_or_field=GameResultListing())
    def get_results(self, obj):
        return game_results_summary(obj)

    @swagger_serializer_method(serializer_or_field=serializers.BooleanField())
    def get_revealed(self, obj):
        # If the participants of the gaming are viewing their game,
        # return the value of that flag.
        if obj.lineup_1:
            if obj.lineup_1.team.owner == self.user:
                return obj.revealed_to_user_1

        if obj.lineup_2:
            if obj.lineup_2.team.owner == self.user:
                return obj.revealed_to_user_2

        # If the user is not a participant in the game OR an unauthenticated user,
        # always reveal.
        return True

    @swagger_serializer_method(
        serializer_or_field=serializers.ChoiceField(choices=game.models.Contest.Status)
    )
    def get_status(self, obj):
        return obj.contest.status

    @swagger_serializer_method(serializer_or_field=serializers.BooleanField())
    def get_is_current_user_enrolled_with_lineup(self, obj):
        enrolled_lineups = [
            lineup for lineup in [obj.lineup_1, obj.lineup_2] if lineup is not None
        ]

        for lineup in enrolled_lineups:
            if lineup.team.owner_id == self.user.id:
                return True
        return False

    @swagger_serializer_method(serializer_or_field=serializers.BooleanField())
    def get_is_current_user_enrolled_with_reservation(self, game):
        for reservation in game.reservations.filter(
            expires_at__gte=timezone.now(), deleted=False, game=game
        ):
            if reservation.team.owner_id == self.user.id:
                return True

        return False

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_max_enrollable(self, obj):
        # TODO this will change when we have different types of competitions.
        return 2

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_number_enrolled_lineup(self, game):
        enrolled_lineups = [
            lineup for lineup in [game.lineup_1, game.lineup_2] if lineup is not None
        ]

        return len(enrolled_lineups)

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_number_enrolled_reservation(self, game):
        return game.reservations.filter(
            expires_at__gte=timezone.now(), deleted=False, game=game
        ).count()

    @swagger_serializer_method(serializer_or_field=serializers.DateTimeField())
    def get_played_at(self, obj):
        return obj.contest.played_at


class GameStatus(serializers.Serializer):
    enabled = serializers.BooleanField()

    class Meta:
        fields = ["enabled"]


class Game(serializers.ModelSerializer, FlattenMixin):
    lineup_1 = serializers.SerializerMethodField()
    lineup_2 = serializers.SerializerMethodField()
    contest = Contest()
    results = serializers.SerializerMethodField()
    reservations = serializers.SerializerMethodField()
    reveal = serializers.SerializerMethodField()

    class Meta:
        model = game.models.Game
        fields = [
            "id",
            "lineup_1",
            "reveal",
            "reservations",
            "lineup_2",
            "contest",
            "prize_pool",
            "results",
            "transaction_id",
        ]

    @property
    def user(self):
        return self.context["request"].user

    def to_representation(self, obj):
        return super().flatten(super().to_representation(obj))

    @swagger_serializer_method(serializer_or_field=Reservation(many=True))
    def get_reservations(self, obj):
        if self._can_reveal_all_fields(obj.contest.status):
            reservations = [
                reservation
                for reservation in obj.reservations.all()
                if reservation.expires_at.astimezone(timezone.utc) >= timezone.now()
                and reservation.deleted is False
            ]
        else:
            reservations = [
                reservation
                for reservation in obj.reservations.all()
                if reservation.expires_at.astimezone(timezone.utc) >= timezone.now()
                and reservation.deleted is False
                and reservation.team.owner_id == self.user.id
            ]

        return Reservation(instance=reservations, many=True).data

    def get_reveal(self, obj):
        # returns the reveal flag of the user who partipacted within that game
        if obj.lineup_1:
            if obj.lineup_1.team.owner == self.user:
                return obj.revealed_to_user_1

        if obj.lineup_2:
            if obj.lineup_2.team.owner == self.user:
                return obj.revealed_to_user_2

        # defaults as reveal true for any other user
        return True

    @swagger_serializer_method(serializer_or_field=simulator.serializers.Result())
    def get_results(self, obj):
        if obj.simulation is None:
            return None
        return simulator.serializers.Result(obj.simulation.result).data

    def _can_reveal_all_fields(self, status):
        return status in [
            game.models.Contest.Status.OPEN,
            game.models.Contest.Status.IN_PROGRESS,
            game.models.Contest.Status.COMPLETE,
        ]

    def _requester_owns_current_lineup(self, lineup):
        return lineup and lineup.team.owner_id == self.user.id

    @swagger_serializer_method(serializer_or_field=Lineup())
    def get_lineup_1(self, obj):
        if (obj.lineup_1 and obj.lineup_1.team.owner == self.user) or (
            obj.lineup_1 and obj.lineup_2
        ):
            return self._return_lineup_view(obj.contest.status, obj.lineup_1)
        return None

    @swagger_serializer_method(serializer_or_field=Lineup())
    def get_lineup_2(self, obj):
        if (obj.lineup_2 and obj.lineup_2.team.owner == self.user) or (
            obj.lineup_2 and obj.lineup_2
        ):
            return self._return_lineup_view(obj.contest.status, obj.lineup_2)
        return None

    def _return_lineup_view(self, game_status, lineup):
        if self._can_reveal_all_fields(
            game_status
        ) or self._requester_owns_current_lineup(lineup):
            return Lineup(lineup).data

        return None


class PlayerNameChangeRequest(serializers.ModelSerializer):
    def validate_name(self, value):
        if simulator.models.Player.objects.filter(full_name__iexact=value).exists():
            raise ValidationError("Player name must be unique.")
        return value

    class Meta:
        model = moderation.models.PlayerNameChangeRequest
        fields = ["status", "name", "reject_reason", "create_date", "reviewed_on"]
        read_only_fields = ["status", "reject_reason", "create_date", "reviewed_on"]
        validators = [
            PlayerNameCompositionValidator(),
        ]


class AWSUploadFieldsSerializer(serializers.Serializer):
    key = serializers.CharField()
    AWSAccessKeyId = serializers.CharField()
    policy = serializers.CharField()
    signature = serializers.CharField()


class AWSUploadSerializer(serializers.Serializer):
    url = serializers.URLField()
    fields = AWSUploadFieldsSerializer()


class PlayerLeaderboardListing(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    percentage_wins = serializers.SerializerMethodField()
    percentage_losses = serializers.SerializerMethodField()
    wins = serializers.SerializerMethodField()
    losses = serializers.SerializerMethodField()
    positions = serializers.SerializerMethodField()
    opensea_price_usd = serializers.SerializerMethodField()

    class Meta:
        model = simulator.models.Player
        fields = [
            "id",
            "full_name",
            "token",
            "positions",
            "age",
            "star_rating",
            "ppg",
            "fg_pct",
            "three_p_pct",
            "ft_pct",
            "orpg",
            "drpg",
            "rpg",
            "apg",
            "spg",
            "bpg",
            "tpg",
            "fpg",
            "wins",
            "losses",
            "percentage_wins",
            "percentage_losses",
            "opensea_price_usd",
        ]

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_id(self, simulated_player):
        return simulated_player.player.id

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_wins(self, simulated_player):
        return simulated_player.player.wins

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_losses(self, simulated_player):
        return simulated_player.player.losses

    @swagger_serializer_method(serializer_or_field=serializers.FloatField())
    def get_percentage_wins(self, simulated_player):
        if simulated_player.player.simulated.g:
            return (
                simulated_player.player.wins / simulated_player.player.simulated.g
            ) * 100

        return None

    @swagger_serializer_method(serializer_or_field=serializers.FloatField())
    def get_percentage_losses(self, simulated_player):
        if simulated_player.player.simulated.g:
            return (
                simulated_player.player.losses / simulated_player.player.simulated.g
            ) * 100

        return None

    @swagger_serializer_method(
        serializer_or_field=serializers.MultipleChoiceField(
            choices=[c[0] for c in simulator.models.PlayerPosition.choices]
        )
    )
    def get_positions(self, obj):
        positions = []

        if obj.position_1:
            positions.append(obj.position_1)

        if obj.position_2:
            positions.append(obj.position_2)

        return positions

    @swagger_serializer_method(serializer_or_field=serializers.FloatField())
    def get_opensea_price_usd(self, simulated_player):
        return simulated_player.player.opensea_price_usd


class TeamLeaderboardListing(serializers.Serializer):
    """
    This class is a standard serializer (as opposed to a
    model serializer) because it is
    populated using raw SQL.
    """

    team_id = serializers.IntegerField()
    name = serializers.CharField()
    wins = serializers.IntegerField()
    losses = serializers.IntegerField()
    win_percentage = serializers.DecimalField(max_digits=20, decimal_places=3)
    ppg = serializers.DecimalField(max_digits=20, decimal_places=3)
    opp_ppg = serializers.DecimalField(max_digits=20, decimal_places=3)
    diff = serializers.DecimalField(max_digits=20, decimal_places=3)
    streak = serializers.CharField()
    l10_wins = serializers.IntegerField()
    l10_losses = serializers.IntegerField()
    player_count = serializers.IntegerField()
    total_sp = serializers.IntegerField()
    mm_games_this_week = serializers.IntegerField()
    played_this_week = serializers.IntegerField()


class TournamentSeriesDetail(serializers.Serializer):
    id = serializers.SerializerMethodField()
    team_1 = serializers.SerializerMethodField()
    team_2 = serializers.SerializerMethodField()
    lineup_1 = serializers.SerializerMethodField()
    lineup_2 = serializers.SerializerMethodField()
    games = serializers.SerializerMethodField()

    def get_series_games(self, series):
        request_user = game.utils.get_request_user(self.context["request"])
        return game.utils.get_series_games(request_user, series)

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField())
    def get_id(self, series):
        return series.id

    @swagger_serializer_method(serializer_or_field=TournamentEntryTeam())
    def get_team_1(self, series):
        if self.get_series_games(series) or (
            series.entry_1 and series.round.stage == 0
        ):
            return TournamentEntryTeam(series.entry_1).data
        return None

    @swagger_serializer_method(serializer_or_field=TournamentEntryTeam())
    def get_team_2(self, series):
        if self.get_series_games(series) or (
            series.entry_2 and series.round.stage == 0
        ):
            return TournamentEntryTeam(series.entry_2).data
        return None

    @swagger_serializer_method(serializer_or_field=TournamentLineupModelSerializer())
    def get_lineup_1(self, series):
        if self.get_series_games(series):
            return TournamentLineupModelSerializer(series.entry_1.lineup).data
        return None

    @swagger_serializer_method(serializer_or_field=TournamentLineupModelSerializer())
    def get_lineup_2(self, series):
        if self.get_series_games(series):
            return TournamentLineupModelSerializer(series.entry_2.lineup).data
        return None

    @swagger_serializer_method(
        serializer_or_field=simulator.serializers.Result(many=True)
    )
    def get_games(self, series):
        results = []
        for game_instance in self.get_series_games(series):
            sim_result = simulator.serializers.Result(
                game_instance.simulation.result
            ).data
            # insert game model id into simulation result
            sim_result["id"] = game_instance.id
            results.append(sim_result)

        return results


class HeadToHeadMatchMakeEnrollSerializer(serializers.Serializer):
    lineup = CreateLineup()

    def create(self, validated_data):
        LineupSerializer = CreateLineup(context={"request": self.context["request"]})
        return LineupSerializer.create(validated_data["lineup"])


class HeadToHeadMatchMakeQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = game.models.HeadToHeadMatchMakeQueue
        fields = "__all__"


class GameDetailQueryParamSerializer(serializers.Serializer):
    player_token_for_overwrite = serializers.IntegerField(
        required=False,
        help_text=(
            "The backend will take this player and "
            "overwrite a similar player in this game."
        ),
    )


class GMNotificationQueryParamSerializer(serializers.Serializer):
    email = serializers.EmailField()
    url = serializers.URLField()
    msg = serializers.CharField()
    key = serializers.CharField()

    def validate_key(self, value):
        if value != "play-swoops-gm":
            raise serializers.ValidationError("Key does not match")

        return value

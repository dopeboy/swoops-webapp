from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers

import simulator.models


class Player(serializers.ModelSerializer):
    positions = serializers.SerializerMethodField()
    top_attributes = serializers.SerializerMethodField()

    class Meta:
        model = simulator.models.Player
        fields = [
            "token",
            "uuid",
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
            "fpg",
            "ppg",
            "tpg",
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
            "positions",
            "top_attributes",
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
        ]
        ref_name = "SimulatedPlayer"

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


class Result(serializers.ModelSerializer):
    class Meta:
        model = simulator.models.Result
        fields = [
            "lineup_1_score",
            "lineup_2_score",
            "lineup_1_box_score",
            "lineup_1_player_1_box_score",
            "lineup_1_player_2_box_score",
            "lineup_1_player_3_box_score",
            "lineup_1_player_4_box_score",
            "lineup_1_player_5_box_score",
            "lineup_2_box_score",
            "lineup_2_player_1_box_score",
            "lineup_2_player_2_box_score",
            "lineup_2_player_3_box_score",
            "lineup_2_player_4_box_score",
            "lineup_2_player_5_box_score",
        ]
        depth = 1


class Simulation(serializers.ModelSerializer):
    result = Result(read_only=True)

    class Meta:
        model = simulator.models.Simulation
        fields = ["created_at", "status", "result"]


class PlayerStats(serializers.Serializer):
    wins = serializers.IntegerField()
    losses = serializers.IntegerField()
    fg = serializers.FloatField()
    ft = serializers.FloatField()
    fpg = serializers.FloatField()
    apg = serializers.FloatField()
    bpg = serializers.FloatField()
    drpg = serializers.FloatField()
    fga = serializers.FloatField()
    fta = serializers.FloatField()
    orpg = serializers.FloatField()
    ppg = serializers.FloatField()
    spg = serializers.FloatField()
    tpg = serializers.FloatField()
    rpg = serializers.FloatField()
    two_p = serializers.FloatField()
    two_pa = serializers.FloatField()
    three_p = serializers.FloatField()
    three_pa = serializers.FloatField()
    fg_pct = serializers.FloatField(allow_null=True)
    ft_pct = serializers.FloatField(allow_null=True)
    two_p_pct = serializers.FloatField(allow_null=True)
    three_p_pct = serializers.FloatField(allow_null=True)
    ts_pct = serializers.FloatField(allow_null=True)

from django.core.exceptions import BadRequest
from django.db.models import Q
from django_filters import rest_framework as filters

import game.models
import simulator.models


class GameFilter(filters.FilterSet):
    team = filters.NumberFilter()
    status = filters.ChoiceFilter(
        choices=game.models.Contest.Status.choices,
        empty_label=game.models.Contest.Status.OPEN,
    )


class PlayerPositionFilter(filters.FilterSet):
    positions = filters.CharFilter(method="filter_positions")

    class Meta:
        model = simulator.models.Player
        fields = []

    def filter_positions(self, qs, name, value):
        positions = set(value.split(","))
        choices = set([choice[0] for choice in simulator.models.PlayerPosition.choices])
        if len(list(positions.intersection(choices))) != len(positions):
            raise BadRequest(f"Invalid position supplied. Must be one of {choices}")

        return qs.filter(Q(position_1__in=positions) | Q(position_2__in=positions))


class TournamentFilter(filters.FilterSet):
    status = filters.ChoiceFilter(
        field_name="contest__status",
        choices=game.models.Contest.Status.choices,
        empty_label=game.models.Contest.Status.OPEN,
    )
    kind = filters.CharFilter(method="filter_kind")

    class Meta:
        model = game.models.Tournament
        fields = []

    def filter_kind(self, qs, name, value):
        kind = value.replace("_", " ").upper()

        choices = [key for key, value in game.models.Tournament.Kind.choices]
        if kind not in choices:
            raise BadRequest(f"{kind} invalid Tournament Kind supplied.")

        return qs.filter(kind__iexact=kind)

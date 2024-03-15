from rest_framework import permissions

import game.models


class PlayerOwnershipPermission(permissions.BasePermission):
    message = "Must own at least one player."

    def has_permission(self, request, view):
        # check user owns a player
        return game.models.Player.objects.players_owned_by_user(
            request.user.id
        ).exists()


class IsStaffPermission(permissions.BasePermission):
    message = "Must be a staff"

    def has_permission(self, request, view):
        return request.user.is_staff


class IsPublishedPermission(permissions.BasePermission):
    message = "Game must be public or staff visible"

    def has_permission(self, request, view):
        game_id = view.kwargs.get("game_id")
        try:
            my_game = game.models.Game.objects.get(id=game_id)
        except game.models.Game.DoesNotExist:
            return False

        if my_game.visibility == game.models.Game.Visibility.HIDDEN:
            return False

        if my_game.visibility == game.models.Game.Visibility.STAFF:
            return request.user.is_staff

        if my_game.visibility == game.models.Game.Visibility.PUBLIC:
            return True

        return False


class IsTeamOwnerOrReadOnlyPermission(permissions.BasePermission):
    """
    A custom permission for restricting updates to
    a team's owner.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # GET, HEAD, and OPTIONS don't require ownership
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.id == obj.owner_id

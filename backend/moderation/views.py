from django.core.exceptions import BadRequest
from django.db.models import Max
from rest_framework import generics, permissions, status
from rest_framework.response import Response

import moderation.models
import moderation.serializers


class CanRetrieveUpdateModerationRequest(permissions.BasePermission):
    """
    A custom permission for restricting updates to
    a given user generated content request.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return request.user.id == obj.requesting_user.id


class TeamNameModeration(generics.RetrieveAPIView, generics.DestroyAPIView):
    permission_classes = [CanRetrieveUpdateModerationRequest]
    serializer_class = moderation.serializers.TeamNameChangeRequestSerializer
    lookup_field = "team_id"

    def get_queryset(self):
        # TODO this would be better done as a subquery instead of one query
        # completing, and feeding the other.
        max_create_date_for_team_id = (
            moderation.models.TeamNameChangeRequest.objects.filter(
                team_id=self.kwargs["team_id"]
            )
            .values("team_id")
            .aggregate(Max("create_date"))
        )

        if max_create_date_for_team_id["create_date__max"] is None:
            return moderation.models.TeamNameChangeRequest.objects.none()

        return moderation.models.TeamNameChangeRequest.objects.filter(
            team_id=self.kwargs["team_id"],
            create_date__gte=max_create_date_for_team_id["create_date__max"],
        )

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        name_change_request = self.get_object()

        if name_change_request.status in [
            moderation.models.Status.CANCELED,
            moderation.models.Status.ACCEPTED,
            moderation.models.Status.REJECTED,
        ]:
            raise BadRequest(
                "Moderation request is in terminal state. Cannot be modified."
            )

        name_change_request.status = moderation.models.Status.CANCELED
        name_change_request.save(update_fields=["status"])

        return Response(
            moderation.serializers.TeamNameChangeRequestSerializer(
                name_change_request
            ).data,
            status=status.HTTP_200_OK,
        )


class TeamLogoModeration(generics.RetrieveAPIView, generics.DestroyAPIView):
    permission_classes = [CanRetrieveUpdateModerationRequest]
    serializer_class = moderation.serializers.TeamLogoChangeRequestSerializer
    lookup_field = "team_id"

    def get_queryset(self):
        # TODO this would be better done as a subquery instead of one query
        # completing, and feeding the other.
        max_create_date_for_team_id = (
            moderation.models.TeamLogoChangeRequest.objects.filter(
                team_id=self.kwargs["team_id"]
            )
            .values("team_id")
            .aggregate(Max("create_date"))
        )

        if max_create_date_for_team_id["create_date__max"] is None:
            return moderation.models.TeamLogoChangeRequest.objects.none()

        return moderation.models.TeamLogoChangeRequest.objects.filter(
            team_id=self.kwargs["team_id"],
            create_date__gte=max_create_date_for_team_id["create_date__max"],
        )

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        logo_change_request = self.get_object()

        if logo_change_request.status in [
            moderation.models.Status.CANCELED,
            moderation.models.Status.ACCEPTED,
            moderation.models.Status.REJECTED,
        ]:
            raise BadRequest(
                "Moderation request is in terminal state. Cannot be modified."
            )

        logo_change_request.status = moderation.models.Status.CANCELED
        logo_change_request.save(update_fields=["status"])

        return Response(
            moderation.serializers.TeamLogoChangeRequestSerializer(
                logo_change_request
            ).data,
            status=status.HTTP_200_OK,
        )

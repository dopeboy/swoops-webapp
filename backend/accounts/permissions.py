from django.contrib.auth import get_user_model
from rest_framework import permissions


class UserEmailVerifiedPermission(permissions.BasePermission):
    message = "Email must be verified."

    def has_permission(self, request, view):
        user = get_user_model().objects.get(id=request.user.id)
        return user.is_verified


class IsSelf(permissions.BasePermission):
    message = "You are not allowed to read or update someone else"

    def has_object_permission(self, request, view, obj):
        return obj == request.user

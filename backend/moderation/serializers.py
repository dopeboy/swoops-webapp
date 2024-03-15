from rest_framework import serializers

import moderation.models


class TeamNameChangeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = moderation.models.TeamNameChangeRequest
        fields = ["create_date", "name", "status", "reject_reason"]
        read_only_fields = ["__all__"]


class TeamLogoChangeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = moderation.models.TeamLogoChangeRequest
        fields = ["create_date", "path", "status", "reject_reason"]
        read_only_fields = ["__all__"]

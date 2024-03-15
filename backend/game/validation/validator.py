from rest_framework import serializers

from game.validation import rules


class PlayerNameCompositionValidator:
    def __call__(self, request_fields):
        if request_fields is None or request_fields.get("name") is None:
            return

        value = request_fields["name"]

        if not rules.is_english_uppercase_chracters_only(value):
            raise serializers.ValidationError(
                "{} must only contain english, uppercase alphabet characters.".format(
                    value
                )
            )

        if not len(value) > 2:
            raise serializers.ValidationError(
                "{} character length must be greater than 2.".format(value)
            )

        if not len(value) <= 16:
            raise serializers.ValidationError(
                "{} character length must be less than or equal to 16.".format(value)
            )

        if not rules.no_consecutive_spaces(value):
            raise serializers.ValidationError(
                "{} must not have consecutive spaces.".format(value)
            )

        if not rules.has_whitespace_trimmed(value):
            raise serializers.ValidationError(
                "{} must have leading and trailing whitespace trimmed.".format(value)
            )


class TeamNameCompositionValidator:
    def __call__(self, value):
        if value is None:
            return

        if not rules.is_english_uppercase_chracters_only(value):
            raise serializers.ValidationError(
                "{} must only contain english, uppercase alphabet characters.".format(
                    value
                )
            )

        if not len(value) >= 2:
            raise serializers.ValidationError(
                "{} character length must be greater than or equal to 2.".format(value)
            )

        if not len(value) <= 32:
            raise serializers.ValidationError(
                "{} character length must be less than or equal to 32.".format(value)
            )

        if not rules.no_consecutive_spaces(value):
            raise serializers.ValidationError(
                "{} must not have consecutive spaces.".format(value)
            )

        if not rules.has_whitespace_trimmed(value):
            raise serializers.ValidationError(
                "{} must have leading and trailing whitespace trimmed.".format(value)
            )

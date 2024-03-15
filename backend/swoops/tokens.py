from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import Token


class SwoopsPayloadToken(Token):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @property
    def payload(self):
        payload = super().payload
        try:
            user_id = payload["user_id"]
        except KeyError:
            raise ValueError("Token generation failed as user_id not found")
        user_model = get_user_model()
        try:
            user = user_model.objects.get(pk=user_id)
        except user_model.DoesNotExist:
            raise ValueError(
                f"Token generation failed as user with {user_id} not found"
            )
        if user.email is None:
            raise ValueError(
                f"Token generation failed as user with {user_id} does not have an email"
            )
        payload["user_email"] = user.email
        return payload

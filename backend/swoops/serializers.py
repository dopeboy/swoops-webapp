from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class SwoopsTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        user_id = token["user_id"]
        user_model = get_user_model()
        user = user_model.objects.get(pk=user_id)
        token["user_email"] = user.email
        return token

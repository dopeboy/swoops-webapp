from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

UserModel = get_user_model()


class SuperuserAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(UserModel.SUPERUSER_USERNAME_FIELD)
        if username is None or password is None:
            return
        try:
            user = UserModel.objects.get(email=username)
        except UserModel.DoesNotExist:
            pass
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user

    def user_can_authenticate(self, user):
        """
        Reject users with is_active=False and is_superuser=False. Custom user models
        that don't have that attribute are allowed.
        """
        is_active = getattr(user, "is_active", None)
        is_superuser = getattr(user, "is_superuser", None)
        return is_active and is_superuser

from django.urls import path
from rest_framework_simplejwt import views as jwt_views

import accounts.views

app_name = "accounts"
urlpatterns = [
    path("logout", accounts.views.LogoutView.as_view(), name="user-logout"),
    path(
        "nonce",
        accounts.views.NonceCreationView.as_view(),
        name="login-nonce-generation",
    ),
    path(
        "nonce-verify",
        accounts.views.NonceVerificationView.as_view(),
        name="login-nonce-verify",
    ),
    path("token/refresh/", jwt_views.TokenRefreshView.as_view(), name="token-refresh"),
    path(
        "verify-email",
        accounts.views.VerifyEmailView.as_view(),
        name="verify-email",
    ),
    path(
        "send-verification-email",
        accounts.views.SendVerificationEmailView.as_view(),
        name="send-verification-email",
    ),
    path(
        "<int:id>/",
        accounts.views.UserDetail.as_view(),
        name="user-detail",
    ),
    path(
        "refresh/",
        accounts.views.TokenRefreshView.as_view(),
        name="user-token-refresh",
    ),
    path("users-internal", accounts.views.index, name="users-internal"),
]

from django.urls import include, path

from . import views

app_name = "api"
urlpatterns = [
    path("health", views.HealthView.as_view(), name="health"),
    path("baller/<int:id>", views.BallerView.as_view(), name="baller-detail"),
    path("game/", include("game.urls", namespace="game")),
    path("moderation/", include("moderation.urls", namespace="moderation")),
    path("eth/", include("eth.urls", namespace="eth")),
]

from django.urls import path

import moderation.views

app_name = "moderation"
urlpatterns = [
    path(
        "team/<int:team_id>/name/",
        moderation.views.TeamNameModeration.as_view(),
        name="team-name-moderation",
    ),
    path(
        "team/<int:team_id>/logo/",
        moderation.views.TeamLogoModeration.as_view(),
        name="team-logo-moderation",
    ),
]

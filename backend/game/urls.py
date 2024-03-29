from django.urls import path, register_converter

import game.views
from game import converters

register_converter(converters.SignedIntConverter, "signed_int")

app_name = "game"
urlpatterns = [
    path(
        "<int:id>/reservation/",
        game.views.GameReservation.as_view(),
        name="game-reservation",
    ),
    path(
        "<int:game_id>/reservation/<int:reservation_id>/",
        game.views.GameReservationDetail.as_view(),
        name="game-reservation-detail",
    ),
    path(
        "<int:id>/enrollment/",
        game.views.GameEnrollment.as_view(),
        name="game-enrollment",
    ),
    path(
        "<int:id>/",
        game.views.GameDetail.as_view(),
        name="game-detail",
    ),
    path(
        "<int:id>/play-by-play/",
        game.views.GamePlayByPlay.as_view(),
        name="game-play-by-play",
    ),
    path(
        "status",
        game.views.GameStatus.as_view(),
        name="game-status",
    ),
    path(
        "",
        game.views.GameList.as_view(),
        name="game",
    ),
    path(
        "player/<signed_int:token_id>/games",
        game.views.PlayerGameList.as_view(),
        name="player-games",
    ),
    path(
        "player/leaderboard",
        game.views.PlayerLeaderboard.as_view(),
        name="player-leaderboard",
    ),
    path(
        "player/freeagent",
        game.views.FreeAgentList.as_view(),
        name="freeagents",
    ),
    path(
        "player/<signed_int:id>/",
        game.views.PlayerDetail.as_view(),
        name="player-detail",
    ),
    path(
        "player/token/<signed_int:token_id>/progression",
        game.views.PlayerProgression.as_view(),
        name="player-progression",
    ),
    path(
        "player/token/<signed_int:token_id>/name",
        game.views.PlayerDetailByTokenUpdateName.as_view(),
        name="player-detail-by-token-name",
    ),
    path(
        "player/token/<signed_int:token_id>/",
        game.views.PlayerDetailByToken.as_view(),
        name="player-detail-by-token",
    ),
    path(
        "player/",
        game.views.PlayerList.as_view(),
        name="player-list",
    ),
    path(
        "team/<int:team_id>/players/",
        game.views.TeamRoster.as_view(),
        name="team-roster",
    ),
    path(
        "team/<int:team_id>/tournaments/",
        game.views.TeamTournaments.as_view(),
        name="team-tournaments",
    ),
    path(
        "team/leaderboard",
        game.views.TeamLeaderboard.as_view(),
        name="team-leaderboard",
    ),
    path("team/<int:id>/", game.views.TeamDetail.as_view(), name="team-detail"),
    path("team/", game.views.TeamList.as_view(), name="team-list"),
    path("team/<int:id>/name/", game.views.TeamName.as_view(), name="team-name"),
    path("team/<int:id>/logo/", game.views.TeamLogo.as_view(), name="team-logo"),
    path(
        "team/<int:id>/logo/upload/",
        game.views.TeamLogoUpload.as_view(),
        name="team-logo-upload",
    ),
    path(
        "tournament/<int:tournament_id>/reservation/",
        game.views.TournamentReservation.as_view(),
        name="tournament-reservation",
    ),
    path(
        "tournament/<int:tournament_id>/reservation/<int:reservation_id>/",
        game.views.TournamentReservationDetail.as_view(),
        name="tournament-reservation-detail",
    ),
    path(
        "tournament/<int:tournament_id>/lineup/",
        game.views.TournamentTeamLineup.as_view(),
        name="tournament-team-lineup",
    ),
    path(
        "tournament/<int:tournament_id>/lineups/",
        game.views.TournamentLineups.as_view(),
        name="tournament-lineups",
    ),
    path(
        "tournament/<int:tournament_id>/teams/",
        game.views.TournamentTeam.as_view(),
        name="tournament-teams",
    ),
    path(
        "tournament/<int:tournament_id>/game/<int:game_id>/",
        game.views.TournamentGame.as_view(),
        name="tournament-game",
    ),
    path(
        "tournament/<int:tournament_id>/round/<int:round_id>/series/<int:series_id>/",
        game.views.TournamentTeamSeries.as_view(),
        name="tournament-series-detail",
    ),
    path(
        "tournament/<int:tournament_id>/",
        game.views.TournamentDetail.as_view(),
        name="tournament-detail",
    ),
    path(
        "headtohead/<int:id>/",
        game.views.GameDetail.as_view(),
        name="headtohead-detail",
    ),
    path(
        "headtohead/",
        game.views.GameList.as_view(),
        name="headtohead-list",
    ),
    path(
        "tournament/",
        game.views.TournamentList.as_view(),
        name="tournament-list",
    ),
    path(
        "headtoheadmatchmake-enroll/",
        game.views.HeadToHeadMatchMakeEnrollView.as_view(),
        name="headtohead-matchmake-enroll",
    ),
    path(
        "gm/notifiction/results",
        game.views.GMNotificationResults.as_view(),
        name="gm-notification-results",
    ),
    path("mm-internal", game.views.index, name="mm"),
]

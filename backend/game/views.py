import datetime
import logging
import logging.config
import time

import boto3
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import BadRequest, PermissionDenied
from django.db.models import F, Q
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.utils.log import DEFAULT_LOGGING
from django.views.decorators.cache import cache_page
from django_pglocks import advisory_lock
from drf_yasg.utils import no_body, swagger_auto_schema
from rest_framework import generics, permissions, response, serializers, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

import accounts.permissions
import comm.handlers
import game.filters
import game.models
import game.permissions
import game.serializers
import game.throttling
import moderation.models
import moderation.tasks
import simulator.models
from moderation.service import ModerationService
from utils.db import load_data_from_sql

logging.config.dictConfig(DEFAULT_LOGGING)
logger = logging.getLogger("django.server")


class GameAPIMixin:
    """For core code common to Game endpoints"""

    def get_serializer_class(self):
        return game.serializers.Game

    def get_queryset(self):
        queryset = game.models.Game.objects.select_related(
            "lineup_1__team",
            "lineup_1__player_1__simulated",
            "lineup_1__player_2__simulated",
            "lineup_1__player_3__simulated",
            "lineup_1__player_4__simulated",
            "lineup_1__player_5__simulated",
            "lineup_2__team",
            "lineup_2__player_1__simulated",
            "lineup_2__player_2__simulated",
            "lineup_2__player_3__simulated",
            "lineup_2__player_4__simulated",
            "lineup_2__player_5__simulated",
            "contest",
            "simulation",
            "simulation__result",
        ).filter(~Q(visibility=game.models.Game.Visibility.HIDDEN))

        return queryset.order_by("-id")


class GMNotificationResults(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # if self.request.META['HTTP_REFERER']

        query_serializer = game.serializers.GMNotificationQueryParamSerializer(
            data=request.data
        )

        if query_serializer.is_valid():
            try:
                user = get_user_model().objects.get(
                    email=query_serializer.validated_data["email"]
                )
            except get_user_model().DoesNotExist:
                logger.error(f"{query_serializer.validated_data['email']} not found")
                return response.Response(
                    status=status.HTTP_400_BAD_REQUEST,
                )

            comm.handlers.gm_game_results(
                user=user,
                url=query_serializer.validated_data["url"],
                message=query_serializer.validated_data["msg"],
            )

        else:
            logger.error(f"{query_serializer.errors} serializer errors")
            return response.Response(
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=status.HTTP_202_ACCEPTED)


class GameDetail(GameAPIMixin, generics.RetrieveAPIView):
    """Retrieves details of an individual game based on the ID in the URL"""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "id"
    throttle_classes = (
        game.throttling.AnonBurstRateThrottle,
        game.throttling.AnonSustainedRateThrottle,
        game.throttling.UserBurstRateThrottle,
        game.throttling.UserSustainedRateThrottle,
    )

    @swagger_auto_schema(
        query_serializer=game.serializers.GameDetailQueryParamSerializer,
    )
    def get(self, request, *args, **kwargs):
        game_id = self.kwargs["id"]
        query_serializer = game.serializers.GameDetailQueryParamSerializer(
            data=request.query_params
        )

        # If get param supplied and it's a specific game ID,
        # pull the player in the param and then overwrite
        # a specific player in the game data. Used
        # for tutorial, to mock simulate a game.
        if (
            query_serializer.is_valid()
            and "player_token_for_overwrite" in query_serializer.validated_data
            and game_id in (244726, 302629, 146946)
        ):
            game_obj = self.get_queryset().get(id=game_id)
            serializer = self.get_serializer_class()
            modified_game_data = serializer(
                game_obj, context=self.get_serializer_context()
            ).data

            # Get player
            token = query_serializer.validated_data["player_token_for_overwrite"]
            player = game.models.Player.objects.get(simulated__token=token)
            player_serializer = game.serializers.Player(player)

            modified_game_data["lineup_1"]["team"]["name"] = "Your team"
            modified_game_data["lineup_1"]["team"][
                "path"
            ] = "media/tutorial-your-team-logo.png"

            modified_game_data["lineup_2"]["team"]["name"] = "Opposing team"
            modified_game_data["lineup_2"]["team"][
                "path"
            ] = "media/tutorial-opposing-team-logo.png"

            # 244726 - THE BIG CHEESE (Guard 1) (lineup1, player1)
            if game_id == 244726:
                original_player_uuid = modified_game_data["lineup_1"]["player_1"][
                    "uuid"
                ]
                modified_game_data["lineup_1"]["player_1"] = player_serializer.data
                modified_game_data["lineup_1"]["player_1"][
                    "uuid"
                ] = original_player_uuid

            # SKYWALKER (Forward 1) (lineup1, player3)
            elif game_id == 302629:
                original_player_uuid = modified_game_data["lineup_1"]["player_3"][
                    "uuid"
                ]
                modified_game_data["lineup_1"]["player_3"] = player_serializer.data
                modified_game_data["lineup_1"]["player_3"][
                    "uuid"
                ] = original_player_uuid

            # THE MOZ (Center) (lineup1, player5)
            elif game_id == 146946:
                original_player_uuid = modified_game_data["lineup_1"]["player_5"][
                    "uuid"
                ]
                modified_game_data["lineup_1"]["player_5"] = player_serializer.data
                modified_game_data["lineup_1"]["player_5"][
                    "uuid"
                ] = original_player_uuid

            return Response(modified_game_data)

        return super().get(request, *args, **kwargs)


class PlayerGameList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = game.serializers.PlayerGameListing
    pagination_class = None

    def get_serializer_context(self):
        return super().get_serializer_context() | {"token_id": self.kwargs["token_id"]}

    def get_queryset(self):
        return game.models.Game.objects.games_by_player(self.kwargs["token_id"])

    # NOTE: This swagger_auto_schema is incorrect as it doesn't take pagination into
    # account. The response appears to be an array of `PlayerGameListing` objects, but
    # it's actually a pagination payload that contains an array called `results` that
    # contains a list of `PlayerGameListing`s.
    #
    # I settled for this because I thought it would be helpful for the typescript
    # library to have a definition of the underlying list type, and work around the
    # overall incorrect response, since I can't make drf-yasg communicate the actual
    # endpoint's response.
    @swagger_auto_schema(responses={200: game.serializers.PlayerGameListing(many=True)})
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class GameStatus(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(responses={200: game.serializers.GameStatus})
    def get(self, request):
        return response.Response(
            game.serializers.GameStatus({"enabled": settings.GAMES_ENABLED}).data,
            status=status.HTTP_200_OK,
        )


class GameList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        return game.serializers.GameListing

    def validate_ids(self, data, field="id", unique=True):
        if isinstance(data, list):
            id_list = [int(x[field]) for x in data]

            if unique and len(id_list) != len(set(id_list)):
                raise ValidationError(
                    "Multiple updates to a single {} found".format(field)
                )

            return id_list

        return [data]

    def get_queryset(self):
        # This is a weird place to serialize the params. It would be better to do it in
        # the get entrypoint, but there isn't a way to pass the serialized input to the
        # get_queryset method as context, so there isn't another choice of where to do
        # the serialization.
        serializer = game.serializers.GameQuerySerializer(
            data=self.request.query_params, context={"request": self.request}
        )
        serializer.is_valid(raise_exception=True)
        query_params = serializer.validated_data

        if (
            not settings.GAMES_ENABLED
            and query_params.get("status", "") == game.models.Contest.Status.OPEN
        ):
            return game.models.Game.objects.none()

        return game.models.Game.objects.get_games(**query_params)

    @swagger_auto_schema(query_serializer=game.serializers.GameQuerySerializer)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        request_body=game.serializers.GameUpdateSerializer(many=True),
        responses={200: ""},
    )
    def patch(self, request):
        ids = self.validate_ids(request.data)
        instances = game.models.Game.objects.select_related(
            "lineup_1__team",
            "lineup_2__team",
        ).filter(id__in=ids)
        serializer = game.serializers.GameUpdateSerializer(
            instances, data=request.data, many=True
        )
        serializer.is_valid(raise_exception=True)
        self.perform_reveal_player_update(request, serializer)

        return Response(status=status.HTTP_200_OK)

    def perform_reveal_player_update(self, request, serializer):
        user = get_user_model().objects.get(id=request.user.id)
        for instance in serializer.instance:
            if instance.lineup_1:
                if instance.lineup_1.team.owner == user:
                    instance.revealed_to_user_1 = True

            if instance.lineup_2:
                if instance.lineup_2.team.owner == user:
                    instance.revealed_to_user_2 = True

            instance.save()


class GamePlayByPlay(generics.RetrieveAPIView):
    """Lists and filters games"""

    lookup_field = "simulation__game__id"
    lookup_url_kwarg = "id"

    serializer_class = game.serializers.GamePlayByPlay
    queryset = simulator.models.PlayByPlay.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class PlayerAPIMixin:
    """For core code common to Player endpoints"""

    serializer_class = game.serializers.Player
    queryset = game.models.Player.objects.select_related("simulated").order_by("-id")


class FreeAgentList(generics.ListAPIView):
    """Lists and filters players"""

    serializer_class = game.serializers.PlayerV2
    filterset_class = game.filters.PlayerPositionFilter
    queryset = simulator.models.Player.objects.free_agents()

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class PlayerDetail(PlayerAPIMixin, generics.RetrieveAPIView):
    """Retrieves individual players players"""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "id"

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class PlayerList(PlayerAPIMixin, generics.ListAPIView):
    """Lists all players"""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    swagger_schema = None


class PlayerDetailByToken(PlayerAPIMixin, generics.RetrieveAPIView):
    """Retrieves individual players players"""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = []

    def get_object(self):
        return (
            self.get_queryset().filter(simulated__token=self.kwargs["token_id"]).get()
        )

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class PlayerProgression(generics.RetrieveAPIView):
    """Retrieves individual player progession stats"""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = []
    serializer_class = game.serializers.PlayerProgression
    queryset = simulator.models.PlayerProgression.objects.select_related("player")

    def get_object(self):
        return self.get_queryset().filter(player__token=self.kwargs["token_id"]).get()

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class TeamRoster(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = game.serializers.PlayerV2
    filterset_class = game.filters.PlayerPositionFilter

    def get_queryset(self):
        return simulator.models.Player.objects.by_team(self.kwargs["team_id"])
        # player = simulator.models.Player.objects.by_team(self.kwargs["team_id"])
        # my_model_view = simulator.model_views.CurrentSeasonPlayerStatsViewProxy
        # player_stats = my_model_view.by_player_token(player.token)
        # player.player_stats = player_stats
        # return player

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class TeamDetail(generics.RetrieveAPIView):
    """Gets or updates an individual team"""

    lookup_field = "id"
    serializer_class = game.serializers.TeamSerializer
    queryset = game.models.Team.objects.all()
    permission_classes = [game.permissions.IsTeamOwnerOrReadOnlyPermission]

    def get(self, request, *args, **kwargs):
        return Response(
            game.serializers.TeamSerializer(self.get_object()).data,
            status=status.HTTP_200_OK,
        )


class TeamList(generics.ListAPIView):
    """Lists all teams"""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = game.serializers.TeamSerializer
    swagger_schema = None

    def get_queryset(self):
        return game.models.Team.objects.order_by("id")


class TeamName(generics.UpdateAPIView):
    """Gets or updates an individual team name"""

    lookup_field = "id"
    serializer_class = game.serializers.TeamName
    permission_classes = [
        game.permissions.IsTeamOwnerOrReadOnlyPermission,
        accounts.permissions.UserEmailVerifiedPermission,
    ]
    queryset = game.models.Team.objects.all()

    @swagger_auto_schema(
        responses={
            202: "",
        },
    )
    def put(self, request, *args, **kwargs):
        super().put(request, context={"owner": request.user}, *args, **kwargs)
        return Response(status=status.HTTP_202_ACCEPTED)

    @swagger_auto_schema(
        responses={
            202: "",
        },
    )
    def patch(self, request, *args, **kwargs):
        super().patch(request, context={"owner": request.user}, *args, **kwargs)
        return Response(status=status.HTTP_202_ACCEPTED)


class TeamLogo(generics.UpdateAPIView):
    """Gets or updates an individual team logo"""

    lookup_field = "id"
    serializer_class = game.serializers.TeamLogo
    permission_classes = [
        game.permissions.IsTeamOwnerOrReadOnlyPermission,
        accounts.permissions.UserEmailVerifiedPermission,
    ]
    queryset = game.models.Team.objects.all()

    @swagger_auto_schema(
        responses={
            202: "",
        },
    )
    def put(self, request, *args, **kwargs):
        super().put(request, context={"owner": request.user}, *args, **kwargs)
        return Response(status=status.HTTP_202_ACCEPTED)

    @swagger_auto_schema(
        responses={
            202: "",
        },
    )
    def patch(self, request, *args, **kwargs):
        super().patch(request, context={"owner": request.user}, *args, **kwargs)
        return Response(status=status.HTTP_202_ACCEPTED)


class TeamLogoUpload(generics.CreateAPIView):
    """Create a url a user can use to upload a logo"""

    permission_classes = [
        permissions.IsAuthenticated,
        accounts.permissions.UserEmailVerifiedPermission,
    ]

    @swagger_auto_schema(responses={200: game.serializers.AWSUploadSerializer})
    def post(self, request, *args, **kwargs):
        ModerationService().validate_no_open_or_accepted_team_logo_change_requests(
            kwargs["id"]
        )

        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_UGC_BUCKET_ACCESS_KEY,
            aws_secret_access_key=settings.AWS_UGC_BUCKET_SECRET,
        )

        randomfilename = time.strftime("%Y%m%d-%H:%M:%S")
        key = f'__tmp__/{kwargs["id"]}/{randomfilename}.png'
        s = game.serializers.AWSUploadSerializer(
            s3.generate_presigned_post(settings.AWS_UGC_BUCKET_NAME, key)
        )
        return Response(s.data)


class GameReservationDetail(generics.RetrieveAPIView):
    lookup_field = "id"
    lookup_url_kwarg = "reservation_id"

    serializer_class = game.serializers.Reservation
    queryset = game.models.Reservation.objects.filter(deleted=False)

    def get(self, request, *args, **kwargs):
        reservation = self.get_object()
        expires_at = reservation.expires_at.astimezone(timezone.utc)

        if expires_at < timezone.now():
            return response.Response(
                {
                    "detail": [
                        (
                            f"Reservation {reservation.id} has already expired. ",
                            f"reservation expire time: {expires_at}, ",
                            f"current time: {timezone.now()}",
                        )
                    ]
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            game.serializers.Reservation(reservation).data,
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        responses={
            204: "",
        },
    )
    def delete(self, request, *args, **kwargs):
        reservation = self.get_object()
        if reservation.team.owner_id != request.user.id:
            raise PermissionDenied("You do not have access to this reservation.")

        reservation.deleted = True
        reservation.save()

        return response.Response(status=status.HTTP_204_NO_CONTENT)


class GameReservation(GameAPIMixin, generics.CreateAPIView):
    lookup_field = "id"
    permission_classes = [
        game.permissions.PlayerOwnershipPermission,
        accounts.permissions.UserEmailVerifiedPermission,
    ]

    def create(self, request, *args, **kwargs):
        game_obj = self.get_object()

        try:
            team = game.models.Team.objects.get(owner=request.user.id)
        except game.models.Game.DoesNotExist:
            raise serializers.ValidationError("Team not found.")

        if game.models.Reservation.objects.reservation_exists(game_obj.id, team.id):
            raise BadRequest(
                f"Team={team.id} already has a reservation for game={game_obj.id}"
            )

        # check if game full
        with advisory_lock(f"create-game-reservation-{ game_obj.id }"):
            if game_obj.is_fully_reserved:
                # Game is actually reserved fully
                raise ValidationError("Game is fully reserved.")

            reservation, created = game.models.Reservation.objects.update_or_create(
                team=team,
                game=game_obj,
                deleted=False,
                defaults={
                    "expires_at": timezone.now()
                    + datetime.timedelta(minutes=settings.RESERVATION_WINDOW_TIME_MIN),
                    "deleted": False,
                },
            )

        return response.Response(
            game.serializers.Reservation(reservation).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_202_ACCEPTED,
        )

    @swagger_auto_schema(
        request_body=no_body,
        responses={
            201: game.serializers.Reservation,
            202: game.serializers.Reservation,
        },
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


def _validate_same_player_not_submitted_to_opposing_team(game, player_ids):
    if not game.lineup_1 and not game.lineup_2:
        return
    elif game.lineup_1 and not game.lineup_2:
        lineup = game.lineup_1
    elif game.lineup_2 and not game.lineup_1:
        lineup = game.lineup_2

    for player in [
        lineup.player_1,
        lineup.player_2,
        lineup.player_3,
        lineup.player_4,
        lineup.player_5,
    ]:
        if player.simulated.token >= 0 and player.id in player_ids:
            raise ValidationError(
                f"Player {player.simulated.token} cannot be submitted to opposing team."
            )


def _validate_team_is_not_already_part_of_game(game, team):
    if (game.lineup_1 and team == game.lineup_1.team) or (
        game.lineup_2 and team == game.lineup_2.team
    ):
        raise ValidationError(f"Team {team.id} cannot submit lineup to itself.")


# We want to prevent users/teams from spam joining a bunch of
# open (0/2) games. We do this by placing a cap on the maximum
# number of games a user can join at a time.
#
# PART I
# We count the number of games this team is the first entrant in.
# We know they're the first entrant because the contest
# status changes to "IN_PROGRESS" and the simulation object
# is populated (and made non-null) when this happens.
#
# PART II
# Additionally, we want to prevent a user from joining
# a bunch of matchmake games. So compute this too.
def _validate_team_has_not_exceeded_open_game_cap(team):
    # This is how many h2h games this team is the first
    # entrant in.
    h2h_non_matchmake_count = game.models.Game.objects.filter(
        Q(Q(lineup_1__team=team) | Q(lineup_2__team=team)),
        contest__status=game.models.Contest.Status.OPEN,
        simulation__isnull=True,
        visibility=game.models.Game.Visibility.PUBLIC,
    ).count()

    # This is how many matchmake games this team is in
    # and still waiting for an opponent
    h2h_matchmake_count = game.models.HeadToHeadMatchMakeQueue.objects.filter(
        team=team, sent_to_simulator_at=None
    ).count()

    if h2h_non_matchmake_count + h2h_matchmake_count >= int(
        settings.OPEN_GAME_ENTRY_CAP
    ):
        raise ValidationError(
            f"You have exceeded the open game cap per "
            f"team of {settings.OPEN_GAME_ENTRY_CAP}"
        )


class GameEnrollment(GameAPIMixin, generics.CreateAPIView):
    lookup_field = "id"
    permission_classes = [
        game.permissions.PlayerOwnershipPermission,
        accounts.permissions.UserEmailVerifiedPermission,
    ]

    def create(self, request, *args, **kwargs):
        # get game object
        game_obj = self.get_object()

        try:
            team = game.models.Team.objects.get(owner=request.user.id)
        except game.models.Team.DoesNotExist:
            raise serializers.ValidationError("Team not found.")

        try:
            reservation = game.models.Reservation.objects.get(
                team=team, game=game_obj, deleted=False
            )
        except game.models.Reservation.DoesNotExist:
            raise ValidationError("Game has not been reserved by user.")

        if reservation.has_expired:
            raise ValidationError("Team Reservation has expired.")

        if game_obj.lineup_1 and game_obj.lineup_2:
            raise ValidationError("Game lineup is completely filled.")

        _validate_team_is_not_already_part_of_game(game_obj, team)

        _validate_same_player_not_submitted_to_opposing_team(
            game_obj, list(request.data.values())
        )

        _validate_team_has_not_exceeded_open_game_cap(team)

        serializer = game.serializers.CreateLineup(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        if not game.utils.is_pass_token_gate_requirement(
            game_obj.contest.tokens_required, team, serializer.data
        ):
            raise ValidationError(
                (
                    f"Team must submit atleast {game_obj.contest.tokens_required}"
                    " swoopsters to enter this game."
                )
            )

        user_lineup = serializer.create(serializer.data)

        user = get_user_model().objects.get(id=request.user.id)
        with advisory_lock(f"insert-lineup-to-game-{ game_obj.id }"):
            # add lineup to game
            if not game_obj.lineup_1:
                game_obj.lineup_1 = user_lineup
                game_obj.revealed_to_user_1 = user.reveal_games_by_default
            elif not game_obj.lineup_2:
                game_obj.lineup_2 = user_lineup
                game_obj.revealed_to_user_2 = user.reveal_games_by_default
            else:
                # Game is actually reserved fully
                raise ValidationError("Game lineup is completely filled.")

            # save game
            game_obj.save()

        return response.Response(
            game.serializers.Game(game_obj, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        request_body=game.serializers.CreateLineup,
        responses={201: game.serializers.Game},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class PlayerDetailByTokenUpdateName(
    PlayerAPIMixin, generics.CreateAPIView, generics.DestroyAPIView
):
    permission_classes = [
        accounts.permissions.UserEmailVerifiedPermission,
    ]

    def get_object(self):
        return (
            self.get_queryset().filter(simulated__token=self.kwargs["token_id"]).get()
        )

    @swagger_auto_schema(
        request_body=game.serializers.PlayerNameChangeRequest,
        responses={201: game.serializers.PlayerNameChangeRequest},
    )
    def post(self, request, *args, **kwargs):
        player = self.get_object()
        user = get_user_model().objects.get(id=request.user.id)

        if not game.models.Player.objects.players_owned_by_user(user.id).exists():
            return response.Response(
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = game.serializers.PlayerNameChangeRequest(data=request.data)

        if serializer.is_valid():
            proposed_name = request.data["name"]

            if moderation.models.PlayerNameChangeRequest.objects.filter(
                player=player,
                status=moderation.models.Status.ACCEPTED,
            ).exists():
                return response.Response(
                    {
                        "name": [
                            "Player name cannot be created, name has already been approved."  # noqa: E501
                        ],
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            elif moderation.models.PlayerNameChangeRequest.objects.filter(
                player=player, status=moderation.models.Status.PENDING
            ).exists():
                return response.Response(
                    {
                        "name": [
                            "Player name cannot be changed, name is pending to be approved."  # noqa: E501
                        ],
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            player_name_change_request = (
                moderation.models.PlayerNameChangeRequest.objects.create(
                    player=player,
                    requesting_user=user,
                    name=proposed_name,
                )
            )

            return response.Response(
                game.serializers.PlayerNameChangeRequest(
                    player_name_change_request
                ).data,
                status=status.HTTP_201_CREATED,
            )

        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        responses={200: game.serializers.PlayerNameChangeRequest},
    )
    def get(self, request, *args, **kwargs):
        player = self.get_object()

        try:
            player_name_change_request = (
                moderation.models.PlayerNameChangeRequest.objects.get(
                    status__in=[
                        moderation.models.Status.PENDING,
                        moderation.models.Status.ACCEPTED,
                    ],  # noqa: E501
                    requesting_user=get_user_model().objects.get(id=request.user.id),
                    player=player,
                )
            )
        except moderation.models.PlayerNameChangeRequest.DoesNotExist:
            return response.Response(
                {
                    "name": [
                        "Player name change request has not been submitted."  # noqa: E501
                    ],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return response.Response(
            game.serializers.PlayerNameChangeRequest(player_name_change_request).data,
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        responses={200: game.serializers.PlayerNameChangeRequest},
    )
    def delete(self, request, *args, **kwargs):
        player = self.get_object()

        if not game.models.Player.objects.players_owned_by_user(
            request.user.id
        ).exists():
            return response.Response(
                status=status.HTTP_400_BAD_REQUEST,
            )

        player_name_change_request = get_object_or_404(
            moderation.models.PlayerNameChangeRequest,
            status=moderation.models.Status.PENDING,
            player=player,
        )

        player_name_change_request.status = moderation.models.Status.CANCELED
        player_name_change_request.save()

        return response.Response(
            game.serializers.PlayerNameChangeRequest(player_name_change_request).data,
            status=status.HTTP_200_OK,
        )


class TeamLeaderboard(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = game.serializers.TeamLeaderboardListing
    pagination_class = None

    def get_queryset(self):
        return load_data_from_sql("game/sql/leaderboard_team_query.sql")

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class PlayerLeaderboard(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = game.serializers.PlayerLeaderboardListing
    queryset = (
        simulator.models.Player.objects.select_related("player")
        .filter(token__gte=0)
        .order_by(F("ppg").desc(nulls_last=True))
    )
    filterset_class = game.filters.PlayerPositionFilter
    pagination_class = None

    # Cache and expire every two minutes
    @method_decorator(cache_page(60 * 2))
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class TournamentAPIMixin:
    def get_queryset(self):
        now = timezone.now()
        qs = game.models.Tournament.objects.filter(
            Q(visibility_at__lte=now) | Q(visibility_at=None)
        )

        if self.request.query_params.get("status") in [game.models.Contest.Status.OPEN]:
            return qs.filter(start_date__gte=now).order_by("start_date")
        return qs.order_by("-start_date")

    def get_serializer_class(self):
        return game.serializers.TournamentListing


class TournamentList(TournamentAPIMixin, generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_class = game.filters.TournamentFilter


class TournamentDetail(generics.RetrieveAPIView):
    serializer_class = game.serializers.TournamentDetail
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = game.models.Tournament.objects.all()
    lookup_field = "id"
    lookup_url_kwarg = "tournament_id"

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class TournamentReservation(TournamentAPIMixin, generics.CreateAPIView):
    lookup_field = "id"
    lookup_url_kwarg = "tournament_id"
    permission_classes = [
        accounts.permissions.UserEmailVerifiedPermission,
        game.permissions.PlayerOwnershipPermission,
    ]
    serializer_class = game.serializers.TournamentReservation

    def create(self, request, *args, **kwargs):
        tournament_obj = self.get_object()

        if tournament_obj.kind not in [
            game.models.Tournament.Kind.IN_SEASON,
            game.models.Tournament.Kind.PARTNER,
        ]:
            raise BadRequest(
                (
                    f"Tournament={tournament_obj.id} is "
                    "not an In-Season, Partner tournament."
                    " Reservations are not allowed."
                )
            )

        try:
            team = game.models.Team.objects.get(owner=request.user.id)
        except game.models.Game.DoesNotExist:
            raise serializers.ValidationError("Team not found.")

        user = get_user_model().objects.get(id=request.user.id)
        if (
            not game.models.TournamentEntry.objects.allowed_tournament_entry(
                team.id, tournament_obj.id
            )
            and not user.is_staff
        ):
            raise BadRequest(
                (
                    f"Team={team.id} already has an entry submitted "
                    "for another in-season tournament today."
                )
            )

        with advisory_lock(f"tournament-reservation-{ tournament_obj.id }"):
            # check if sum of reservation and entry
            # count is less than the total tournament size
            active_reservation_count = game.models.TournamentReservation.objects.filter(
                tournament=tournament_obj,
                expires_at__gte=timezone.now(),
                deleted=False,
            ).count()

            entry_count = game.models.TournamentEntry.objects.filter(
                tournament=tournament_obj
            ).count()

            if active_reservation_count + entry_count >= tournament_obj.size:
                raise BadRequest(
                    (
                        f"Tournament={tournament_obj.id} "
                        "reservations are no longer "
                        "available. Tournament entries are filled."
                    )
                )

            (
                reservation,
                created,
            ) = game.models.TournamentReservation.objects.update_or_create(
                tournament=tournament_obj,
                team=team,
                defaults={
                    "deleted": False,
                    "expires_at": timezone.now()
                    + datetime.timedelta(minutes=settings.RESERVATION_WINDOW_TIME_MIN),
                },
            )

        return response.Response(
            game.serializers.TournamentReservation(
                reservation, context={"request": request}
            ).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_202_ACCEPTED,
        )

    @swagger_auto_schema(
        request_body=no_body,
        responses={
            201: game.serializers.TournamentReservation,
            202: game.serializers.TournamentReservation,
        },
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class TournamentReservationDetail(generics.RetrieveAPIView):
    lookup_field = "id"
    lookup_url_kwarg = "reservation_id"

    serializer_class = game.serializers.TournamentReservation
    queryset = game.models.TournamentReservation.objects.filter(deleted=False)

    def get(self, request, *args, **kwargs):
        reservation = self.get_object()
        expires_at = reservation.expires_at.astimezone(timezone.utc)

        if expires_at < timezone.now():
            return response.Response(
                {
                    "detail": [
                        (
                            f"Reservation {reservation.id} has already expired. ",
                            f"reservation expire time: {expires_at}, ",
                            f"current time: {timezone.now()}",
                        )
                    ]
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            game.serializers.TournamentReservation(
                reservation, context={"request": request}
            ).data,
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        responses={
            204: "",
        },
    )
    def delete(self, request, *args, **kwargs):
        reservation = self.get_object()
        if reservation.team.owner_id != request.user.id:
            raise PermissionDenied("You do not have access to this reservation.")

        reservation.deleted = True
        reservation.save()

        return response.Response(status=status.HTTP_204_NO_CONTENT)


class TournamentGame(generics.GenericAPIView):
    serializer_class = game.serializers.TournamentGame
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(responses={200: game.serializers.TournamentGame})
    def get(self, request, tournament_id, game_id):
        my_game = game.models.Game.objects.select_related(
            "lineup_1__team",
            "lineup_1__player_1__simulated",
            "lineup_1__player_2__simulated",
            "lineup_1__player_3__simulated",
            "lineup_1__player_4__simulated",
            "lineup_1__player_5__simulated",
            "lineup_2__team",
            "lineup_2__player_1__simulated",
            "lineup_2__player_2__simulated",
            "lineup_2__player_3__simulated",
            "lineup_2__player_4__simulated",
            "lineup_2__player_5__simulated",
            "simulation",
            "simulation__result",
        ).get(id=game_id)
        # Do not add public visibility filter as we are using permission class
        return Response(game.serializers.TournamentGame(my_game).data)


class TournamentTeam(generics.RetrieveAPIView):
    serializer_class = game.serializers.TournamentEntryTeam
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "id"
    lookup_url_kwarg = "tournament_id"
    pagination_class = None

    @swagger_auto_schema(
        responses={200: game.serializers.TournamentEntryTeam(many=True)}
    )
    def get(self, request, tournament_id):
        entries = game.models.TournamentEntry.objects.select_related("team").filter(
            tournament__id=tournament_id
        )

        return Response(game.serializers.TournamentEntryTeam(entries, many=True).data)


class TournamentTeamLineup(generics.RetrieveAPIView, generics.CreateAPIView):
    serializer_class = game.serializers.Lineup

    def _validate_tournament_submission_date(self, tournament):
        now = timezone.now()

        if tournament.lineup_submission_start >= now:
            raise ValidationError(
                "Tournament entry must be submitted after lineup start date."
            )

        if tournament.lineup_submission_cutoff <= now:
            raise ValidationError(
                "Tournament entry must be submitted before lineup cutoff date."
            )

    def _validate_team_has_not_already_entered_lineup_into_tournament(
        self, tournament, team
    ):
        if game.models.TournamentEntry.objects.filter(
            ~Q(lineup=None),
            tournament=tournament,
            team=team,
        ).exists():
            raise ValidationError("Tournament entry lineup is completely filled.")

    def create(self, request, tournament_id):
        tournament_obj = get_object_or_404(game.models.Tournament, id=tournament_id)

        try:
            team_obj = game.models.Team.objects.get(owner=request.user.id)
        except game.models.Game.DoesNotExist:
            raise serializers.ValidationError("Team not found.")

        self._validate_tournament_submission_date(tournament_obj)

        self._validate_team_has_not_already_entered_lineup_into_tournament(
            tournament_obj, team_obj
        )

        # team has played less than or equal tournaments
        if tournament_obj.kind == game.models.Tournament.Kind.PARTNER:
            completed_games_count = game.models.Game.objects.filter(
                Q(
                    Q(
                        lineup_1__team=team_obj,
                    )
                    | Q(lineup_2__team=team_obj)
                ),
                simulation__status=simulator.models.Simulation.Status.FINISHED,
            ).count()

            if completed_games_count >= settings.MAX_PARTNER_GAMES_ALLOWED:
                raise BadRequest(
                    (
                        f"Team={team_obj.id} cannot enter this partner "
                        f"Tournament={tournament_obj.id}. They have "
                        f"completed {completed_games_count} games "
                        "more than the maximum allowable games "
                        f"of {settings.MAX_PARTNER_GAMES_ALLOWED}."
                    )
                )

        # validate tournament lineup
        serializer = game.serializers.CreateLineup(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        if not game.utils.is_pass_token_gate_requirement(
            tournament_obj.contest.tokens_required, team_obj, serializer.data
        ):
            raise ValidationError(
                (
                    f"Team must own less than {tournament_obj.contest.tokens_required}"
                    " players to enter this game."
                )
            )

        with advisory_lock(f"in-season-tournament-entry-{ tournament_obj.id }"):
            # If in-season tournament, check if user has a
            # reservation and allowed entry in tournament
            if tournament_obj.kind == game.models.Tournament.Kind.IN_SEASON:
                if not game.models.TournamentReservation.objects.reservation_exists(
                    tournament_id, team_obj.id
                ):
                    raise ValidationError(
                        f"Tournament={tournament_obj.id} reservation doesn't exist."
                    )

                user = get_user_model().objects.get(id=request.user.id)
                if (
                    not game.models.TournamentEntry.objects.allowed_tournament_entry(  # noqa: E501
                        team_obj.id, tournament_obj.id
                    )
                    and not user.is_staff
                ):
                    raise BadRequest(
                        (
                            f"Team={team_obj.id} already has an entry submitted "
                            "for another in-season tournament today."
                        )
                    )

            # create a touranemnt entry object or update existign wtih lineup
            tournament_entry_lineup = serializer.create(serializer.data)

            (
                tournament_entry,
                created,
            ) = game.models.TournamentEntry.objects.update_or_create(
                tournament=tournament_obj,
                team=team_obj,
                defaults={"lineup": tournament_entry_lineup},
            )

        return response.Response(
            self.serializer_class(tournament_entry.lineup).data,
            status=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        request_body=game.serializers.CreateLineup,
        responses={201: game.serializers.TournamentEntryModelSerializer},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    @swagger_auto_schema(responses={200: game.serializers.Lineup})
    def get(self, request, tournament_id):
        try:
            team_obj = game.models.Team.objects.get(owner=request.user.id)
        except game.models.Game.DoesNotExist:
            raise serializers.ValidationError("Team not found.")

        if not game.models.Team.objects.filter(
            id=team_obj.id, owner__id=request.user.id
        ).exists():
            raise ValidationError("Must own team to view this lineup.")

        tournament_entry = get_object_or_404(
            game.models.TournamentEntry,
            tournament__id=tournament_id,
            team__id=team_obj.id,
        )
        return response.Response(
            game.serializers.Lineup(tournament_entry.lineup).data,
            status=status.HTTP_200_OK,
        )


class TournamentTeamSeries(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(responses={200: game.serializers.TournamentSeriesDetail})
    def get(self, request, tournament_id, round_id, series_id):
        series = get_object_or_404(game.models.Series, id=series_id, round__id=round_id)
        return response.Response(
            game.serializers.TournamentSeriesDetail(
                series, context={"request": request}
            ).data,
            status=status.HTTP_200_OK,
        )


class TeamTournaments(generics.ListAPIView):
    serializer_class = game.serializers.TournamentListing

    def get_queryset(self):
        team = get_object_or_404(game.models.Team, id=self.kwargs["team_id"])

        tournament_ids = (
            game.models.TournamentEntry.objects.filter(team=team)
            .values_list("tournament_id")
            .distinct()
        )

        return game.models.Tournament.objects.filter(id__in=tournament_ids).order_by(
            "-start_date"
        )


class TournamentLineups(generics.GenericAPIView):
    pagination_class = None
    serializer_class = game.serializers.TournamentEntrySerializer
    queryset = game.models.Tournament
    lookup_url_kwarg = "tournament_id"

    @swagger_auto_schema(
        responses={200: game.serializers.TournamentEntrySerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        tournament = self.get_object()

        now = timezone.now()

        if tournament.lineup_reveal_date >= now:
            raise ValidationError(
                "Tournament lineups cannot be returned before reveal date."
            )

        return response.Response(
            game.utils.get_tournament_entry_lineup(tournament),
            status=status.HTTP_200_OK,
        )


class HeadToHeadMatchMakeEnrollView(generics.CreateAPIView):
    pagination_class = None
    serializer_class = game.serializers.HeadToHeadMatchMakeEnrollSerializer

    @swagger_auto_schema(
        responses={200: game.serializers.HeadToHeadMatchMakeEnrollSerializer}
    )
    def create(self, request, *args, **kwargs):
        # Check if team exists
        try:
            team = game.models.Team.objects.get(owner=request.user.id)
        except game.models.Team.DoesNotExist:
            raise serializers.ValidationError("Team not found.")

        # Check that total of below >= the open game entry cap set in settings.py
        # * number of h2h non matchmake games this team is the first entrant in
        # * number of matchmake games where the team is still waiting to be matched
        _validate_team_has_not_exceeded_open_game_cap(team)

        # Check that payload serializes correctly (checks if players exist and if
        # max_tokens_allowed submitted, it is either 1, 3, or 5)
        serializer = game.serializers.HeadToHeadMatchMakeEnrollSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        # Hardcoded for now. Might be an input in future
        max_tokens_allowed = 5

        # Checks that max_tokens_allowed matches
        # number of swoopsters in lineup (and also checks that the
        # team owns that swoopster)
        if not game.utils.is_pass_token_gate_requirement(
            max_tokens_allowed, team, serializer.data["lineup"]
        ):
            raise ValidationError(
                (
                    f"Team must submit atleast {max_tokens_allowed}"
                    " swoopsters to enter this game."
                )
            )

        # This runs a check to see that the team owns any swoopsters
        # submitted and then creates the lineup in the db and returns it
        lineup = serializer.create(serializer.data)

        # Get the win percentage of the last 50 games for this user
        score = game.utils.calc_team_score_for_matchmaking(team)
        hthmmq = game.models.HeadToHeadMatchMakeQueue.objects.create(
            lineup=lineup, team=team, score=score, max_tokens_allowed=max_tokens_allowed
        )

        return response.Response(
            game.serializers.HeadToHeadMatchMakeQueueSerializer(hthmmq).data,
            status=status.HTTP_201_CREATED,
        )


# This is an internal view for watching the progress of
# matchmaking. Should be decomissioned at some point.
def index(request):
    h2hmmq = game.models.HeadToHeadMatchMakeQueue.objects.all().order_by("-created_at")[
        :100
    ][::-1]

    context = {
        "mmq": h2hmmq,
    }

    # Render the HTML template index.html with the data in the context variable
    return render(request, "mm.html", context=context)

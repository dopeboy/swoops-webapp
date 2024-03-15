from urllib.parse import urljoin

from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions, response, status, views

import simulator.models
from utils.helpers import round_if_not_null


@swagger_auto_schema(auto_schema=None)
class HealthView(views.APIView):
    permission_classes = [permissions.AllowAny]
    swagger_schema = None

    def get(self, request):
        return response.Response(data={}, status=status.HTTP_200_OK)


@swagger_auto_schema(auto_schema=None)
class BallerView(views.APIView):
    permission_classes = [permissions.AllowAny]
    swagger_schema = None

    def get(self, request, id):
        image_base_url = settings.SWOOPS_IMAGE_BASEURL
        if image_base_url[-1] != "/":
            image_base_url += "/"

        if (
            id >= settings.PLAYER_MIN_TOKEN_ID_ACCESSIBLE
            and id <= settings.PLAYER_MAX_TOKEN_ID_ACCESSIBLE
        ):
            player = simulator.models.Player.objects.get(token=id)

            # Purposely initializing season to -1 so that if the
            # 'if' condition below fails, easy to spot in OpenSea
            # the problem childs
            season = -1
            if id >= 0 and id <= 1499:
                season = 0
            elif id >= 1500 and id <= 2999:
                season = 1
            elif id >= 3000 and id <= 3556:
                season = 2

            return response.Response(
                data={
                    "name": player.full_name,
                    "description": player.full_name,
                    "image": urljoin(image_base_url, str(id) + ".png"),
                    "external_url": (
                        settings.SWOOPS_APP_BASEURL + "player-detail/" + str(id)
                    ),
                    "attributes": [
                        {
                            "trait_type": "Age",
                            "display_type": "number",
                            "value": player.age,
                        },
                        {
                            "trait_type": "Season Introduced",
                            "display_type": "number",
                            "value": season,
                        },
                        {
                            "trait_type": "Prospect",
                            "display_type": "number",
                            "value": player.star_rating,
                        },
                        {
                            "trait_type": "Position 1",
                            "value": player.position_1,
                        },
                        {
                            "trait_type": "Position 2",
                            "value": player.position_2,
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Three Point Shooting",
                            "value": round_if_not_null(player.three_pt_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Interior Two Point Shooting",
                            "value": round_if_not_null(player.interior_2pt_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Midrange Two Point Shooting",
                            "value": round_if_not_null(player.midrange_2pt_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Free Throw",
                            "value": round_if_not_null(player.ft_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Defensive Rebound",
                            "value": round_if_not_null(player.drb_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Offensive Rebound",
                            "value": round_if_not_null(player.orb_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Assist",
                            "value": round_if_not_null(player.ast_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Physicality",
                            "value": round_if_not_null(player.physicality_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Interior Defense",
                            "value": round_if_not_null(player.interior_defense_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Perimeter Defense",
                            "value": round_if_not_null(player.perimeter_defense_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Longevity",
                            "value": round_if_not_null(player.longevity_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Hustle",
                            "value": round_if_not_null(player.hustle_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Basketball IQ",
                            "value": round_if_not_null(player.bball_iq_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Leadership",
                            "value": round_if_not_null(player.leadership_rating),
                        },
                        {
                            "display_type": "boost_percentage",
                            "trait_type": "Coachability",
                            "value": round_if_not_null(player.coachability_rating),
                        },
                        {
                            "trait_type": "1 Top Skill",
                            "value": simulator.models.Attribute(
                                player.top_attribute_1
                            ).label,
                        },
                        {
                            "trait_type": "2 Top Skill",
                            "value": simulator.models.Attribute(
                                player.top_attribute_2
                            ).label,
                        },
                        {
                            "trait_type": "3 Top Skill",
                            "value": simulator.models.Attribute(
                                player.top_attribute_3
                            ).label,
                        },
                    ],
                },
                status=status.HTTP_200_OK,
            )

        else:
            return response.Response(
                data={
                    "name": "Swoops player #" + str(id),
                    "description": "A cool baller.",
                    "image": "https://playswoops.com/img/" + str(id),
                },
                status=status.HTTP_200_OK,
            )

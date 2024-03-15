from decimal import Decimal

import moderation.models
import simulator.client
import simulator.models


def map_swoops_factory_player_payload(simulated_player, proposed_name):

    positions = simulated_player.position_1

    if simulated_player.position_2:
        positions = f"{positions}-{simulated_player.position_2}"

    payload = {
        "three_pt_rating": simulated_player.three_pt_rating,
        "interior_2pt_rating": simulated_player.interior_2pt_rating,
        "midrange_2pt_rating": simulated_player.midrange_2pt_rating,
        "ft_rating": simulated_player.ft_rating,
        "ast_rating": simulated_player.ast_rating,
        "orb_rating": simulated_player.orb_rating,
        "drb_rating": simulated_player.drb_rating,
        "interior_defense_rating": simulated_player.interior_defense_rating,
        "perimeter_defense_rating": simulated_player.perimeter_defense_rating,
        "physicality_rating": simulated_player.physicality_rating,
        "longevity_rating": simulated_player.longevity_rating,
        "hustle_rating": simulated_player.hustle_rating,
        "bball_iq_rating": simulated_player.bball_iq_rating,
        "leadership_rating": simulated_player.leadership_rating,
        "coachability_rating": simulated_player.coachability_rating,
        "age": simulated_player.age,
        "star_rating": simulated_player.star_rating,
        "position": positions,
        "name": proposed_name,
        "three_pt_rating_revealed": simulated_player.is_three_pt_rating_revealed,
        "interior_2pt_rating_revealed": simulated_player.is_interior_2pt_rating_revealed,  # noqa: E501
        "midrange_2pt_rating_revealed": simulated_player.is_midrange_2pt_rating_revealed,  # noqa: E501
        "ft_rating_revealed": simulated_player.is_ft_rating_revealed,
        "drb_rating_revealed": simulated_player.is_drb_rating_revealed,
        "orb_rating_revealed": simulated_player.is_orb_rating_revealed,
        "ast_rating_revealed": simulated_player.is_ast_rating_revealed,
        "physicality_rating_revealed": simulated_player.is_physicality_rating_revealed,
        "interior_defense_rating_revealed": simulated_player.is_interior_defense_rating_revealed,  # noqa: E501
        "perimeter_defense_rating_revealed": simulated_player.is_perimeter_defense_rating_revealed,  # noqa: E501
        "longevity_rating_revealed": simulated_player.is_longevity_rating_revealed,
        "hustle_rating_revealed": simulated_player.is_hustle_rating_revealed,
        "bball_iq_rating_revealed": simulated_player.is_bball_iq_rating_revealed,
        "leadership_rating_revealed": simulated_player.is_leadership_rating_revealed,
        "coachability_rating_revealed": simulated_player.is_coachability_rating_revealed,  # noqa: E501
        "top_attribute_1": simulated_player.top_attribute_1,
        "top_attribute_2": simulated_player.top_attribute_2,
        "top_attribute_3": simulated_player.top_attribute_3,
        "id": simulated_player.token,
    }

    for k, v in payload.items():
        if type(payload[k]) == Decimal:
            payload[k] = float(v)

    return payload


# Called when admin approves request to change player name
def update_current_player_card_and_name(player_token_id):
    simulated_player = simulator.models.Player.objects.get(token=player_token_id)

    try:
        player_name_change_request = (
            moderation.models.PlayerNameChangeRequest.objects.get(
                player__simulated=simulated_player,
                status=moderation.models.Status.PENDING,
            )
        )
    except moderation.models.PlayerNameChangeRequest.DoesNotExist:
        raise Exception(
            f"Player name change request for {player_token_id} has not either been ACCEPTED or doesn't exist"  # noqa: E501
        )

    # update current player name
    simulator_client = simulator.client.get()
    simulator_client.update_player_name(
        simulated_player.token, player_name_change_request.name
    )

    # update simulator player full name
    simulated_player.full_name = player_name_change_request.name
    simulated_player.save()

from services.swoops_factory_client import SwoopsFactoryClient


def test_generate_front_face_card(mocker):
    mock_requests = mocker.patch("services.swoops_factory_client.requests.post")
    mock_requests.return_value.content = bytes("TEST123", "utf-8")

    sf = SwoopsFactoryClient(host="swoops-factory.vercel.app")
    kwargs = {
        "three_pt_rating": 76.3234948029,
        "interior_2pt_rating": 67.1967952981,
        "midrange_2pt_rating": 57.3623684255,
        "ft_rating": 50.7830095949,
        "ast_rating": 80.1831055806,
        "orb_rating": 48.3834725502,
        "drb_rating": 34.5899493553,
        "interior_defense_rating": 51.0411193498,
        "perimeter_defense_rating": 70.523682286,
        "physicality_rating": None,
        "longevity_rating": None,
        "hustle_rating": None,
        "bball_iq_rating": None,
        "leadership_rating": None,
        "coachability_rating": None,
        "age": 7.0,
        "star_rating": 2.0,
        "position": "G",
        "name": "Warren G",
        "three_pt_rating_revealed": True,
        "interior_2pt_rating_revealed": True,
        "midrange_2pt_rating_revealed": True,
        "ft_rating_revealed": True,
        "drb_rating_revealed": True,
        "orb_rating_revealed": False,
        "ast_rating_revealed": False,
        "physicality_rating_revealed": False,
        "interior_defense_rating_revealed": True,
        "perimeter_defense_rating_revealed": True,
        "longevity_rating_revealed": False,
        "hustle_rating_revealed": False,
        "bball_iq_rating_revealed": False,
        "leadership_rating_revealed": False,
        "coachability_rating_revealed": False,
        "top_attribute_1": "IQ",
        "top_attribute_2": "LONG",
        "top_attribute_3": "OREB",
        "id": 0,
    }

    sf.generate_frontface_card(**kwargs)
    mock_requests.assert_called_once_with(
        "https://swoops-factory.vercel.app/api/createFrontCard?rename=true", json=kwargs
    )


def test_generate_backface_card(mocker):
    mock_requests = mocker.patch("services.swoops_factory_client.requests.post")
    mock_requests.return_value.content = bytes("TEST123", "utf-8")

    kwargs = {
        "three_pt_rating": 76.3234948029,
        "interior_2pt_rating": 67.1967952981,
        "midrange_2pt_rating": 57.3623684255,
        "ft_rating": 50.7830095949,
        "ast_rating": 80.1831055806,
        "orb_rating": 48.3834725502,
        "drb_rating": 34.5899493553,
        "interior_defense_rating": 51.0411193498,
        "perimeter_defense_rating": 70.523682286,
        "physicality_rating": None,
        "longevity_rating": None,
        "hustle_rating": None,
        "bball_iq_rating": None,
        "leadership_rating": None,
        "coachability_rating": None,
        "age": 7.0,
        "star_rating": 2.0,
        "position": "G",
        "name": "Warren G",
        "three_pt_rating_revealed": True,
        "interior_2pt_rating_revealed": True,
        "midrange_2pt_rating_revealed": True,
        "ft_rating_revealed": True,
        "drb_rating_revealed": True,
        "orb_rating_revealed": False,
        "ast_rating_revealed": False,
        "physicality_rating_revealed": False,
        "interior_defense_rating_revealed": True,
        "perimeter_defense_rating_revealed": True,
        "longevity_rating_revealed": False,
        "hustle_rating_revealed": False,
        "bball_iq_rating_revealed": False,
        "leadership_rating_revealed": False,
        "coachability_rating_revealed": False,
        "top_attribute_1": "IQ",
        "top_attribute_2": "LONG",
        "top_attribute_3": "OREB",
        "id": 0,
    }

    sf = SwoopsFactoryClient(host="swoops-factory.vercel.app")
    sf.generate_backface_card(**kwargs)
    mock_requests.assert_called_once_with(
        "https://swoops-factory.vercel.app/api/createBackCard?rename=true", json=kwargs
    )

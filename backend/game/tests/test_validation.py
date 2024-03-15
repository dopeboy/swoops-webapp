import json

import ddf
import pytest
from django import urls
from rest_framework.serializers import ValidationError

from game.validation.validator import TeamNameCompositionValidator


def test_team_name_validator_too_short():
    with pytest.raises(ValidationError, match="must be greater than"):
        TeamNameCompositionValidator()("A")


def test_team_name_validator_too_long():
    with pytest.raises(ValidationError, match="must be less than or equal to"):
        TeamNameCompositionValidator()("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")


def test_team_name_validator_special_characters():
    with pytest.raises(
        ValidationError,
        match="must only contain english, uppercase alphabet characters.",
    ):
        TeamNameCompositionValidator()("A.I. North 67's")


def test_team_name_validator_not_uppercase():
    with pytest.raises(ValidationError, match="english, uppercase alphabet characters"):
        TeamNameCompositionValidator()("Some Crazy Stuff")


def test_team_name_validator_non_english_char():
    with pytest.raises(ValidationError, match="english, uppercase alphabet characters"):
        TeamNameCompositionValidator()("CRÂZY")

    with pytest.raises(ValidationError, match="english, uppercase alphabet characters"):
        TeamNameCompositionValidator()("ИИИИ И")


def test_team_name_validator_consecutive_spaces():
    with pytest.raises(ValidationError, match="must not have consecutive spaces"):
        TeamNameCompositionValidator()("HAPPY  DAYS")


def test_team_name_validator_whitesapce_not_trimmed():
    errortext = "must have leading and trailing whitespace trimmed"

    with pytest.raises(ValidationError, match=errortext):
        TeamNameCompositionValidator()(" GREATEST EVER")
    with pytest.raises(ValidationError, match=errortext):
        TeamNameCompositionValidator()("GREATEST EVER ")
    with pytest.raises(ValidationError, match=errortext):
        TeamNameCompositionValidator()(" GREATEST EVER ")


@pytest.mark.django_db
def test_team_name_validator_name_not_unique(authed_client, client_user):
    ddf.G("game.Team", name="MONTREAL MATTS")

    team = ddf.G("game.Team", name="")
    team.owner = client_user
    team.save()
    resp = authed_client.put(
        urls.reverse("api:game:team-name", kwargs={"id": team.id}),
        data=json.dumps({"name": "MONTREAL MATTS"}),
        content_type="application/json",
    )

    assert resp.status_code == 400
    assert "Team names must be unique" in resp.json()["name"]


def test_team_name_validator_happy_path():
    assert TeamNameCompositionValidator()("THE GREAT ONES") is None


def test_team_name_validator_happy_path_numbers_space():
    assert TeamNameCompositionValidator()("THE GREAT ONES 64") is None


def test_team_name_validator_happy_path_numbers_no_space():
    assert TeamNameCompositionValidator()("THE GREAT ONES64") is None


def test_team_name_validator_happy_path_full_length():
    assert TeamNameCompositionValidator()("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA") is None


def test_team_name_validator_happy_path_real_sample_1():
    assert TeamNameCompositionValidator()("THE CLICKS") is None


def test_team_name_validator_happy_path_real_sample_2():
    assert TeamNameCompositionValidator()("THEBROTHERSBALL") is None


def test_team_name_validator_happy_path_real_sample_3():
    assert TeamNameCompositionValidator()("AI NORTH 67S") is None

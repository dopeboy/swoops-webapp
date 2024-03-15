from collections import namedtuple

import game.models
from game.serializers import TeamName

MockRequestContext = namedtuple("MockRequestContext", "user")
User = namedtuple("User", "id")


def already_named_team():
    return game.models.Team(name="Montreal Matts")


def team_with_no_name():
    # default names are empty strings
    return game.models.Team(name="")


def team_name_payload(name):
    return {"name": name}


def init_serializer_and_mocks(mocker):
    signal_mock = mocker.patch(
        "moderation.service.ModerationService.submit_team_name_change"
    )
    mocker.patch("accounts.models.User.objects")
    serializer = TeamName(context={"request": MockRequestContext(User(0))})

    return (signal_mock, serializer)


def assert_signal_emitted(mock):
    assert mock.called


def assert_no_signal_emitted(mock):
    assert not mock.called


def test_team_name_serializer_change_unnamed_team_to_valid(mocker):
    signal_mock, serializer = init_serializer_and_mocks(mocker)

    serializer.update(team_with_no_name(), team_name_payload("some new cool name"))
    assert_signal_emitted(signal_mock)


def test_team_name_serializer_named_team_to_another_valid(mocker):
    signal_mock, serializer = init_serializer_and_mocks(mocker)

    serializer.update(already_named_team(), team_name_payload("some new cool name"))
    assert_signal_emitted(signal_mock)


def test_team_name_serializer_unnamed_team_to_null(mocker):
    signal_mock, serializer = init_serializer_and_mocks(mocker)

    serializer.update(already_named_team(), team_name_payload(None))
    assert_no_signal_emitted(signal_mock)


def test_team_name_serializer_named_team_to_same_name(mocker):
    signal_mock, serializer = init_serializer_and_mocks(mocker)

    serializer.update(
        already_named_team(), team_name_payload(already_named_team().name)
    )
    assert_no_signal_emitted(signal_mock)

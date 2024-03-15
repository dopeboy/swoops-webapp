import game.models
import simulator.models
from game.mappers import map_simulator_status_to_game_status


def test_map_simulator_status_to_game_status_not_created():
    assert (
        map_simulator_status_to_game_status(
            simulator.models.Simulation.Status.NOT_CREATED
        )
        == game.models.Contest.Status.OPEN
    )


def test_map_simulator_status_to_game_status_pending():
    assert (
        map_simulator_status_to_game_status(simulator.models.Simulation.Status.PENDING)
        == game.models.Contest.Status.IN_PROGRESS
    )


def test_map_simulator_status_to_game_status_started():
    assert (
        map_simulator_status_to_game_status(simulator.models.Simulation.Status.STARTED)
        == game.models.Contest.Status.IN_PROGRESS
    )


def test_map_simulator_status_to_game_status_finished():
    assert (
        map_simulator_status_to_game_status(simulator.models.Simulation.Status.FINISHED)
        == game.models.Contest.Status.COMPLETE
    )


def test_map_simulator_status_to_game_status_errored():
    assert (
        map_simulator_status_to_game_status(simulator.models.Simulation.Status.ERRORED)
        == game.models.Contest.Status.IN_PROGRESS
    )


def test_map_simulator_status_to_game_status_terminal_error():
    assert (
        map_simulator_status_to_game_status(
            simulator.models.Simulation.Status.TERMINAL_ERROR
        )
        == game.models.Contest.Status.ERROR
    )


def test_map_simulator_status_to_game_status_timed_out():
    assert (
        map_simulator_status_to_game_status(
            simulator.models.Simulation.Status.TIMED_OUT
        )
        == game.models.Contest.Status.ERROR
    )

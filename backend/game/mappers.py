import game.models
import simulator.models


def map_simulator_status_to_game_status(simulator_status):
    if simulator_status in (simulator.models.Simulation.Status.NOT_CREATED):
        contest_status = game.models.Contest.Status.OPEN
    elif simulator_status in (
        simulator.models.Simulation.Status.PENDING,
        simulator.models.Simulation.Status.STARTED,
        simulator.models.Simulation.Status.ERRORED,
    ):
        contest_status = game.models.Contest.Status.IN_PROGRESS
    elif simulator_status in (
        simulator.models.Simulation.Status.TIMED_OUT,
        simulator.models.Simulation.Status.TERMINAL_ERROR,
    ):
        contest_status = game.models.Contest.Status.ERROR
    elif simulator_status in (simulator.models.Simulation.Status.FINISHED):
        contest_status = game.models.Contest.Status.COMPLETE
    else:
        raise Exception(
            "Unable to map simulator status {} to contest status.".format(
                simulator_status
            )
        )

    return contest_status

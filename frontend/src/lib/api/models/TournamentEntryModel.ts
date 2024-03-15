/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentLineupModel } from './TournamentLineupModel';
import type { TournamentTeamModel } from './TournamentTeamModel';

export type TournamentEntryModel = {
    readonly id?: number;
    team: TournamentTeamModel;
    lineup: TournamentLineupModel;
    rank?: number;
    seed?: number;
};

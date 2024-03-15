/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Result } from './Result';
import type { TournamentEntryTeam } from './TournamentEntryTeam';
import type { TournamentLineupModel } from './TournamentLineupModel';

export type TournamentSeriesDetail = {
    readonly id?: number;
    team_1?: TournamentEntryTeam;
    team_2?: TournamentEntryTeam;
    lineup_1?: TournamentLineupModel;
    lineup_2?: TournamentLineupModel;
    readonly games?: Array<Result>;
};

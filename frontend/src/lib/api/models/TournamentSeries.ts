/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentEntryTeam } from './TournamentEntryTeam';
import type { TournamentSeriesGameSummary } from './TournamentSeriesGameSummary';

export type TournamentSeries = {
    readonly id?: number;
    readonly games?: Array<TournamentSeriesGameSummary>;
    readonly status?: TournamentSeries.status;
    team_1?: TournamentEntryTeam;
    team_2?: TournamentEntryTeam;
};

export namespace TournamentSeries {

    export enum status {
        NOT_STARTED = 'NOT STARTED',
        STARTED = 'STARTED',
        FINISHED = 'FINISHED',
        ERRORED = 'ERRORED',
    }


}

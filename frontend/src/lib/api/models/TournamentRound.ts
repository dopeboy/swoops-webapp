/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentSeries } from './TournamentSeries';

export type TournamentRound = {
    readonly id?: number;
    readonly series?: Array<TournamentSeries>;
};

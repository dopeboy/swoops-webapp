/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Result } from './Result';

export type TournamentGame = {
    readonly id?: string;
    readonly lineup_1?: string;
    readonly lineup_2?: string;
    results?: Result;
};

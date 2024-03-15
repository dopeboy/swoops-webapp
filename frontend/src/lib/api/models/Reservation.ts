/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Team } from './Team';

export type Reservation = {
    readonly id?: number;
    game: number;
    team: Team;
    readonly tokens_required?: number;
    expires_at: string;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Contest } from './Contest';
import type { Lineup } from './Lineup';
import type { Reservation } from './Reservation';
import type { Result } from './Result';

export type Game = {
    readonly id?: number;
    lineup_1?: Lineup;
    readonly reveal?: string;
    readonly reservations?: Array<Reservation>;
    lineup_2?: Lineup;
    contest: Contest;
    /**
     * Prize Pool
     */
    prize_pool?: string | null;
    results?: Result;
    /**
     * Transaction Id.
     */
    transaction_id?: string;
};

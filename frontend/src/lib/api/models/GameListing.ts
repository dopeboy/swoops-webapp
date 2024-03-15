/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GameResultListing } from './GameResultListing';

export type GameListing = {
    readonly id?: number;
    readonly number_enrolled_lineup?: number;
    readonly number_enrolled_reservation?: number;
    readonly max_enrollable?: number;
    readonly is_current_user_enrolled_with_lineup?: boolean;
    readonly is_current_user_enrolled_with_reservation?: boolean;
    readonly status?: GameListing.status;
    readonly revealed?: boolean;
    results?: GameResultListing;
    prize_pool: string;
    readonly played_at?: string;
    readonly tokens_required?: number;
};

export namespace GameListing {

    export enum status {
        OPEN = 'OPEN',
        COMPLETE = 'COMPLETE',
        IN_PROGRESS = 'IN_PROGRESS',
        VOIDED = 'VOIDED',
        ERROR = 'ERROR',
    }


}

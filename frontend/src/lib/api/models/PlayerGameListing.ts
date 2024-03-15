/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BoxScoreListing } from './BoxScoreListing';
import type { GameResultListing } from './GameResultListing';

export type PlayerGameListing = {
    id: number;
    readonly status?: PlayerGameListing.status;
    readonly played_at?: string;
    results?: GameResultListing;
    box_score?: BoxScoreListing;
    readonly player_lineup_number?: number;
    readonly player_slot_number?: number;
    readonly type?: string;
};

export namespace PlayerGameListing {

    export enum status {
        OPEN = 'OPEN',
        COMPLETE = 'COMPLETE',
        IN_PROGRESS = 'IN_PROGRESS',
        VOIDED = 'VOIDED',
        ERROR = 'ERROR',
    }


}

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentRound } from './TournamentRound';

export type TournamentDetail = {
    readonly id?: number;
    name: string;
    kind?: TournamentDetail.kind;
    /**
     * Payout
     */
    payout?: string | null;
    lineup_submission_start?: string | null;
    lineup_reveal_date?: string | null;
    lineup_submission_cutoff?: string | null;
    visibility_at?: string | null;
    start_date: string;
    readonly meta?: any;
    end_date: string;
    readonly created_at?: string;
    readonly rounds?: Array<TournamentRound>;
    readonly round_count?: number;
    /**
     * Image URL for tournament
     */
    banner_img_url?: string;
};

export namespace TournamentDetail {

    export enum kind {
        IN_SEASON = 'IN SEASON',
        END_OF_SEASON = 'END OF SEASON',
        PARTNER = 'PARTNER',
    }


}

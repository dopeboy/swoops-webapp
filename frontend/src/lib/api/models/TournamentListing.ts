/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TournamentListing = {
    readonly id?: number;
    name: string;
    /**
     * Payout
     */
    payout?: string | null;
    lineup_submission_start?: string | null;
    lineup_submission_cutoff?: string | null;
    public_publish_datetime?: string | null;
    readonly round_count?: number;
    visibility_at?: string | null;
    start_date: string;
    end_date: string;
    meta?: string | null;
    readonly results?: string;
    readonly entries?: number;
    readonly tokens_required?: number;
    readonly kind?: TournamentListing.kind;
    readonly is_current_user_enrolled?: boolean;
    readonly created_at?: string;
};

export namespace TournamentListing {

    export enum kind {
        IN_SEASON = 'IN SEASON',
        END_OF_SEASON = 'END OF SEASON',
        PARTNER = 'PARTNER',
    }


}

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Tutorial = {
    skip_tutorial?: boolean;
    completed_step_number?: number;
    readonly next_step_number?: number;
    /**
     * The datetime at which the user has completed the entire tutorial.
     */
    readonly completed_at?: string | null;
};

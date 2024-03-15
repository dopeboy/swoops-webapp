/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TournamentTeamModel = {
    readonly id?: number;
    /**
     * The official team name.
     */
    readonly name?: string;
    /**
     * The all-time wins.
     */
    readonly wins?: number;
    /**
     * The all-time losses.
     */
    readonly losses?: number;
    /**
     * The official team logo
     */
    readonly path?: string;
};

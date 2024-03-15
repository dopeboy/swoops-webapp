/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Team = {
    readonly id?: number;
    /**
     * The official team name.
     */
    readonly name?: string;
    readonly wins?: number;
    readonly losses?: number;
    readonly played_today?: number;
    readonly won_this_week?: number;
    readonly total_sp?: number;
    readonly rotating_player_points?: number;
    readonly rotating_team_blocks?: number;
    readonly rotating_player_rebounds?: number;
    readonly rotating_team_assists?: number;
    readonly rotating_player_blocks?: number;
    readonly rotating_player_assists?: number;
    readonly rotating_team_steals?: number;
    readonly rotating_player_three_p?: number;
    readonly rotating_team_points?: number;
    readonly mm_games_this_week?: number;
    readonly played_this_week?: number;
    /**
     * The official team logo
     */
    readonly path?: string;
};

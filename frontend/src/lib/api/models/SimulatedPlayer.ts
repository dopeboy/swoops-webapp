/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SimulatedPlayer = {
    token?: number | null;
    uuid: string;
    kind?: SimulatedPlayer.kind;
    full_name?: string;
    age: number;
    star_rating: number;
    /**
     * Games played
     */
    'g'?: string | null;
    /**
     * Field goals per game
     */
    fg?: string | null;
    /**
     * Field goal attempts per game
     */
    fga?: string | null;
    /**
     * Field goal percentage
     */
    fg_pct?: string | null;
    /**
     * Three pointers per game
     */
    three_p?: string | null;
    /**
     * Three pointer attempts per game
     */
    three_pa?: string | null;
    /**
     * Three point percentage
     */
    three_p_pct?: string | null;
    /**
     * Two pointers per game
     */
    two_p?: string | null;
    /**
     * Two pointer attempts per game
     */
    two_pa?: string | null;
    /**
     * Two point percentage
     */
    two_p_pct?: string | null;
    /**
     * Free throws per game
     */
    ft?: string | null;
    /**
     * Free throw attempts per game
     */
    fta?: string | null;
    /**
     * Free throw percentage
     */
    ft_pct?: string | null;
    /**
     * Offensive rebounds per game
     */
    orpg?: string | null;
    /**
     * Defensive rebounds per game
     */
    drpg?: string | null;
    /**
     * Rebounds per game
     */
    rpg?: string | null;
    /**
     * Assists per game
     */
    apg?: string | null;
    /**
     * Steals per game
     */
    spg?: string | null;
    /**
     * Blocks per game
     */
    bpg?: string | null;
    /**
     * Fouls per game
     */
    fpg?: string | null;
    /**
     * Points per game
     */
    ppg?: string | null;
    /**
     * Turnovers per game
     */
    tpg?: string | null;
    three_pt_rating?: string | null;
    interior_2pt_rating?: string | null;
    midrange_2pt_rating?: string | null;
    ft_rating?: string | null;
    drb_rating?: string | null;
    orb_rating?: string | null;
    ast_rating?: string | null;
    physicality_rating?: string | null;
    interior_defense_rating?: string | null;
    perimeter_defense_rating?: string | null;
    longevity_rating?: string | null;
    hustle_rating?: string | null;
    bball_iq_rating?: string | null;
    leadership_rating?: string | null;
    coachability_rating?: string | null;
    readonly positions?: Array<'G' | 'F' | 'C'>;
    readonly top_attributes?: Array<string | null>;
    accessory?: string | null;
    balls?: string | null;
    exo_shell?: string | null;
    finger_tips?: string | null;
    hair?: string | null;
    jersey_trim?: string | null;
    background?: string | null;
    ear_plate?: string | null;
    face?: string | null;
    guts?: string | null;
    jersey?: string | null;
};

export namespace SimulatedPlayer {

    export enum kind {
        ON_CHAIN = 'ON_CHAIN',
        OFF_CHAIN = 'OFF_CHAIN',
    }


}

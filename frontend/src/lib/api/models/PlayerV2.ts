/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PlayerV2 = {
    readonly id?: number;
    token?: number | null;
    kind?: PlayerV2.kind;
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
     * Turnovers per game
     */
    tpg?: string | null;
    /**
     * Fouls per game
     */
    fpg?: string | null;
    /**
     * Points per game
     */
    ppg?: string | null;
    readonly wins?: number;
    readonly losses?: number;
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
    ensemble?: string | null;
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
    top_attribute_1?: PlayerV2.top_attribute_1;
    top_attribute_2?: PlayerV2.top_attribute_2;
    top_attribute_3?: PlayerV2.top_attribute_3;
    position_1?: PlayerV2.position_1 | null;
    position_2?: PlayerV2.position_2 | null;
    readonly positions?: Array<'G' | 'F' | 'C'>;
    readonly top_attributes?: Array<string | null>;
    readonly team?: number;
    readonly first_named_on?: string;
};

export namespace PlayerV2 {

    export enum kind {
        ON_CHAIN = 'ON_CHAIN',
        OFF_CHAIN = 'OFF_CHAIN',
    }

    export enum top_attribute_1 {
        THREE_PT_RATING = 'three_pt_rating',
        INTERIOR_2PT_RATING = 'interior_2pt_rating',
        MIDRANGE_2PT_RATING = 'midrange_2pt_rating',
        FT_RATING = 'ft_rating',
        DRB_RATING = 'drb_rating',
        ORB_RATING = 'orb_rating',
        AST_RATING = 'ast_rating',
        PHYSICALITY_RATING = 'physicality_rating',
        INTERIOR_DEFENSE_RATING = 'interior_defense_rating',
        PERIMETER_DEFENSE_RATING = 'perimeter_defense_rating',
        LONGEVITY_RATING = 'longevity_rating',
        HUSTLE_RATING = 'hustle_rating',
        BBALL_IQ_RATING = 'bball_iq_rating',
        LEADERSHIP_RATING = 'leadership_rating',
        COACHABILITY_RATING = 'coachability_rating',
    }

    export enum top_attribute_2 {
        THREE_PT_RATING = 'three_pt_rating',
        INTERIOR_2PT_RATING = 'interior_2pt_rating',
        MIDRANGE_2PT_RATING = 'midrange_2pt_rating',
        FT_RATING = 'ft_rating',
        DRB_RATING = 'drb_rating',
        ORB_RATING = 'orb_rating',
        AST_RATING = 'ast_rating',
        PHYSICALITY_RATING = 'physicality_rating',
        INTERIOR_DEFENSE_RATING = 'interior_defense_rating',
        PERIMETER_DEFENSE_RATING = 'perimeter_defense_rating',
        LONGEVITY_RATING = 'longevity_rating',
        HUSTLE_RATING = 'hustle_rating',
        BBALL_IQ_RATING = 'bball_iq_rating',
        LEADERSHIP_RATING = 'leadership_rating',
        COACHABILITY_RATING = 'coachability_rating',
    }

    export enum top_attribute_3 {
        THREE_PT_RATING = 'three_pt_rating',
        INTERIOR_2PT_RATING = 'interior_2pt_rating',
        MIDRANGE_2PT_RATING = 'midrange_2pt_rating',
        FT_RATING = 'ft_rating',
        DRB_RATING = 'drb_rating',
        ORB_RATING = 'orb_rating',
        AST_RATING = 'ast_rating',
        PHYSICALITY_RATING = 'physicality_rating',
        INTERIOR_DEFENSE_RATING = 'interior_defense_rating',
        PERIMETER_DEFENSE_RATING = 'perimeter_defense_rating',
        LONGEVITY_RATING = 'longevity_rating',
        HUSTLE_RATING = 'hustle_rating',
        BBALL_IQ_RATING = 'bball_iq_rating',
        LEADERSHIP_RATING = 'leadership_rating',
        COACHABILITY_RATING = 'coachability_rating',
    }

    export enum position_1 {
        G = 'G',
        F = 'F',
        C = 'C',
    }

    export enum position_2 {
        G = 'G',
        F = 'F',
        C = 'C',
    }


}

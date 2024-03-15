/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SimulatedPlayer } from './SimulatedPlayer';

export type PlayerProgression = {
    player?: SimulatedPlayer;
    three_pt_delta?: string | null;
    interior_2pt_delta?: string | null;
    midrange_2pt_delta?: string | null;
    ft_delta?: string | null;
    drb_delta?: string | null;
    orb_delta?: string | null;
    ast_delta?: string | null;
    physicality_delta?: string | null;
    interior_defense_delta?: string | null;
    perimeter_defense_delta?: string | null;
    longevity_delta?: string | null;
    hustle_delta?: string | null;
    bball_iq_delta?: string | null;
    leadership_delta?: string | null;
    coachability_delta?: string | null;
    newly_revealed_ratings?: Array<string>;
};

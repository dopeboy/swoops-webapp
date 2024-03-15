/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlayerStats } from './PlayerStats';
import type { SimulatedPlayer } from './SimulatedPlayer';

export type Player = {
    readonly id?: number;
    /**
     * The current team.
     */
    team?: number | null;
    readonly wins?: number;
    readonly losses?: number;
    readonly historical_stats?: Record<string, string | null>;
    career_average?: PlayerStats;
    career_average_one_token?: PlayerStats;
    career_average_three_tokens?: PlayerStats;
    career_average_five_tokens?: PlayerStats;
    current_season_stats?: PlayerStats;
    current_season_stats_one_token?: PlayerStats;
    current_season_stats_three_tokens?: PlayerStats;
    current_season_stats_five_tokens?: PlayerStats;
    simulated?: SimulatedPlayer;
    first_named_on?: string | null;
};

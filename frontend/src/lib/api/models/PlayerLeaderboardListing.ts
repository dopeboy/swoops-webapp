/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PlayerLeaderboardListing = {
    readonly id?: number;
    full_name?: string;
    token?: number | null;
    readonly positions?: Array<'G' | 'F' | 'C'>;
    age: number;
    star_rating: number;
    /**
     * Points per game
     */
    ppg?: string | null;
    /**
     * Field goal percentage
     */
    fg_pct?: string | null;
    /**
     * Three point percentage
     */
    three_p_pct?: string | null;
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
    readonly wins?: number;
    readonly losses?: number;
    readonly percentage_wins?: number;
    readonly percentage_losses?: number;
    readonly opensea_price_usd?: number;
};

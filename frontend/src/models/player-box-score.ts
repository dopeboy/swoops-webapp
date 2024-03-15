export interface PlayerBoxScore {
    readonly id?: number;
    /**
     * Assists
     */
    ast: number;
    /**
     * Blocks
     */
    blk: number;
    /**
     * Defensive rebounds
     */
    drb: number;
    /**
     * Field goals
     */
    fg: number;
    /**
     * Field goal percentage
     */
    fg_pct: number;
    /**
     * Field goal attempts
     */
    fga: number;
    /**
     * Free throws
     */
    ft: number;
    /**
     * Free throw percentage
     */
    ft_pct: number;
    /**
     * Free throw attempts
     */
    fta: number;
    /**
     * Offensive rebounds
     */
    orb: number;
    /**
     * Personal fouls
     */
    pf: number;
    /**
     * Points
     */
    pts: number;
    /**
     * Steals
     */
    stl: number;
    /**
     * Three pointers
     */
    three_p: number;
    /**
     * Three point percentage
     */
    three_p_pct: number;
    /**
     * Three point attempts
     */
    three_pa: number;
    /**
     * Turnovers
     */
    tov: number;
    /**
     * Total rebounds
     */
    trb: number;
    /**
     * Two pointers
     */
    two_p: number;
    /**
     * Two point percentage
     */
    two_p_pct: number;
    /**
     * Two point attempts
     */
    two_pa: number;
}

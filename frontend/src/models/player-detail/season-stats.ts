export interface SeasonStats {
    wins?: number;
    losses?: number;
    fg?: number;
    ft?: number;
    fpg?: number;
    apg?: number;
    bpg?: number;
    drpg?: number;
    fga?: number;
    fta?: number;
    orpg?: number;
    ppg?: number;
    spg?: number;
    tpg?: number;
    rpg?: number;
    two_p?: number;
    two_pa?: number;
    three_p?: number;
    three_pa?: number;
    fg_pct?: number;
    ft_pct?: number;
    two_p_pct?: number;
    three_p_pct?: number;
}

export interface SeasonStatsWithSeason extends SeasonStats {
    season?: string;
}

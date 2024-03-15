import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';

const stats = {
    playerDetail: [
        { title: 'PLAYER', value: 'name' },
        { title: 'POS', value: 'positions' },
        { title: 'SZN', value: 'age' },
        { title: 'STAR', value: 'star_rating' },
    ],
    playerStats: [
        { title: 'PTS', value: 'ppg' },
        { title: 'FG%', value: 'fg_pct' },
        { title: '3PT%', value: 'three_p_pct' },
        { title: 'FT%', value: 'ft_pct' },
        { title: 'ORB', value: 'orpg' },
        { title: 'DRB', value: 'drpg' },
        { title: 'REB', value: 'rpg' },
        { title: 'AST', value: 'apg' },
        { title: 'STL', value: 'spg' },
        { title: 'BLK', value: 'bpg' },
        { title: 'TO', value: 'tpg' },
        { title: 'PF', value: 'fpg' },
        { title: 'W/L', value: 'wl' },
    ],
    leaderboardPlayerDetail: [
        { title: 'RANK', value: 'rank' },
        { title: 'PLAYER', value: 'name' },
        { title: 'POS', value: 'positions' },
        { title: 'SZN', value: 'age' },
        { title: 'STAR', value: 'star_rating' },
    ],
    leaderboardPlayerStats: [
        { title: 'PTS', value: 'ppg' },
        { title: 'FG%', value: 'fg_pct' },
        { title: '3PT%', value: 'three_p_pct' },
        { title: 'FT%', value: 'ft_pct' },
        { title: 'ORB', value: 'orpg' },
        { title: 'DRB', value: 'drpg' },
        { title: 'REB', value: 'rpg' },
        { title: 'AST', value: 'apg' },
        { title: 'STL', value: 'spg' },
        { title: 'BLK', value: 'bpg' },
        { title: 'TO', value: 'tpg' },
        { title: 'PF', value: 'fpg' },
        { title: 'W/L', value: 'wl' },
        { title: 'WIN%', value: 'percentage_wins' },
        { title: 'PRICE', value: 'opensea_price_usd' },
    ],
    playerBoxScoreStats: [
        { title: 'PTS', value: 'pts' },
        { title: 'DRB', value: 'drb' },
        { title: 'ORB', value: 'orb' },
        { title: 'TRB', value: 'trb' },
        { title: 'AST', value: 'ast' },
        { title: 'STL', value: 'stl' },
        { title: 'BLK', value: 'blk' },
        { title: 'TO', value: 'tov' },
        { title: 'PF', value: 'pf' },
        { title: 'FG', value: 'fg' },
        { title: '3PT', value: 'three_p' },
        { title: 'FT', value: 'ft' },
    ],
};

export const playerGameStatGrid = [
    { title: 'PTS', value: 'points' },
    { title: 'DRB', value: 'defensive_rebounds' },
    { title: 'ORB', value: 'offensive_rebounds' },
    { title: 'TRB', value: 'rebounds' },
    { title: 'AST', value: 'assists' },
    { title: 'STL', value: 'steals' },
    { title: 'BLK', value: 'blocks' },
    { title: 'TO', value: 'turnovers' },
    { title: 'PF', value: 'fouls' },
    { title: 'FGM/FGA', value: 'field_goals' },
    { title: '3PM/3PA', value: 'three_pointers' },
    { title: 'FTM/FTA', value: 'free_throws' },
];

export const playerTableHeaders: SortableHeader[] = [
    ...stats.playerDetail.map((header) => ({ ...header, sortDirection: SortDirection.NONE })),
    ...stats.playerStats.map((header) => ({ ...header, sortDirection: SortDirection.NONE })),
];

export const leaderboardPlayersTableHeaders: SortableHeader[] = [
    ...stats.leaderboardPlayerDetail.map((header) => ({ ...header, sortDirection: SortDirection.NONE })),
    ...stats.leaderboardPlayerStats.map((header) => ({ ...header, sortDirection: SortDirection.NONE })),
];

export const playerStatGrid = stats.playerStats;
export const playerBoxScoreStatGrid = stats.playerBoxScoreStats;
export const rosterTableStatGrid = stats.playerStats.slice(1, stats.playerStats.length - 2);

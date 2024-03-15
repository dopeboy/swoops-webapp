/* eslint-disable @typescript-eslint/ban-ts-comment */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { ApiService, Player, PlayerGameListing, PlayerStats } from 'src/lib/api';
import { stringifyPositions } from 'src/lib/utils';
import { Position } from 'src/models/position.type';

// TODO - update depending components to make better use of current Player model
// right now field .Simulated has a lot of data, so we should either map/unwrap it at the service layer
// or have the components depend on the model directly

export type ReadonlyPlayer = {
    readonly id?: number;
    /**
     * The current team.
     */
    team?: number | null;
    /**
     * The all-time wins.
     */
    wins?: number;
    /**
     * The all-time losses.
     */
    losses?: number;
    first_named_on?: string | null;
    readonly historical_stats?: Record<string, string | null>;
    career_average?: PlayerStats;
    career_average_one_token?: PlayerStats;
    career_average_three_tokens?: PlayerStats;
    career_average_five_tokens?: PlayerStats;
    current_season_stats?: PlayerStats;
    current_season_stats_one_token?: PlayerStats;
    current_season_stats_three_tokens?: PlayerStats;
    current_season_stats_five_tokens?: PlayerStats;
    full_name?: string;
    token?: number | null;
    age: number;
    star_rating: number;
    uuid?: string;
    kind?: ReadonlyPlayer.kind;
    /**
     * Games played
     */
    g?: string | null;
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
    dna?: string | null;
};

export namespace ReadonlyPlayer {
    export enum kind {
        ON_CHAIN = 'ON_CHAIN',
        OFF_CHAIN = 'OFF_CHAIN',
    }
}
export default class PlayerService {
    static async getPlayerRoster(teamId: number): Promise<Array<ReadonlyPlayer>> {
        const returnedPlayers = await ApiService.apiGameTeamPlayersList(teamId.toString());
        // @ts-ignore
        return returnedPlayers.results.map((player) => player as ReadonlyPlayer);
    }

    static async getPlayerGames(tokenId: string): Promise<PlayerGameListing[]> {
        const paginatedGames = await ApiService.apiGamePlayerGamesList(tokenId);
        return paginatedGames;
    }

    static async getFilteredPlayers(teamId: number, positions?: Array<Position>): Promise<Array<ReadonlyPlayer>> {
        const returnedPlayers = await ApiService.apiGameTeamPlayersList(
            teamId.toString(),
            positions?.some((position) => position === null) || !positions ? 'C,F,G' : stringifyPositions(positions)
        );
        // @ts-ignore
        return returnedPlayers.results.map((player) => player as ReadonlyPlayer);
    }

    static async getPlayerByTokenId(tokenId: string): Promise<ReadonlyPlayer> {
        const player = await ApiService.apiGamePlayerTokenRead(tokenId);
        return this.fromBackend(player);
    }

    static async getPlayer(playerId: number): Promise<ReadonlyPlayer> {
        const player = await ApiService.apiGamePlayerRead(playerId);
        return this.fromBackend(player);
    }

    static async getFreeAgents(positions?: Array<Position>): Promise<Array<ReadonlyPlayer>> {
        const returnedPlayers = await ApiService.apiGamePlayerFreeagentList(
            positions?.some((position) => position === null) ? null : stringifyPositions(positions)
        );
        return returnedPlayers.results.map((player) => player as ReadonlyPlayer);
    }

    static fromBackend(player: Player): ReadonlyPlayer {
        return {
            ...player,
            ...player.simulated,
        };
    }
}

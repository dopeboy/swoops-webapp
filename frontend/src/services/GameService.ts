import { Game, ApiService, GameListing } from 'src/lib/api';

export interface GameReadOnly {
    id?: number;
    prizepool: string;
    buyIn: string;
    createdTime: Date;
    type: string;
    numSlots: number;
    numJoined: number;
    currency: string;
}

export default class GameService {
    static async getGames(teamId: number, status: GameListing.status, page = 1): Promise<Array<GameListing>> {
        const gamesByStatus = await ApiService.apiGameList(page, teamId, status);
        return gamesByStatus.results;
    }

    /*
    static async getGamesWithEnabled(teamId: number, status: GameListing.status): Promise<GameListing> {
        const page = null;
        const gamesByStatus = await ApiService.apiGameList(page, teamId, status);
        return gamesByStatus;
    }
    */

    /*
    static async submitGameLineup(gameId: string, playerIds: number[]): Promise<void> {
        const players: LineupSubmission = {
            players: playerIds.map((id) => ({
                id,
            })),
        };
        await ApiService.apiGameLineupCreate(gameId, players);
    }
    */

    static async getGame(gameId: string): Promise<Game> {
        return ApiService.apiGameRead(gameId);
    }

    static fromBackend(id, starts_at): GameReadOnly {
        return {
            id,
            prizepool: '0',
            buyIn: '0',
            type: 'Head to head',
            numSlots: 2, // hardcoded for now since no property in API -- update once added to Game APIwith SWP-530
            numJoined: 0,
            createdTime: starts_at,
            currency: 'USD',
        };
    }
}

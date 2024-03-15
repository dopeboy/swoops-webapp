/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AWSUpload } from '../models/AWSUpload';
import type { CreateLineup } from '../models/CreateLineup';
import type { Game } from '../models/Game';
import type { GameListing } from '../models/GameListing';
import type { GamePlayByPlay } from '../models/GamePlayByPlay';
import type { GameStatus } from '../models/GameStatus';
import type { GameUpdate } from '../models/GameUpdate';
import type { HeadToHeadMatchMakeEnroll } from '../models/HeadToHeadMatchMakeEnroll';
import type { Lineup } from '../models/Lineup';
import type { Player } from '../models/Player';
import type { PlayerGameListing } from '../models/PlayerGameListing';
import type { PlayerLeaderboardListing } from '../models/PlayerLeaderboardListing';
import type { PlayerNameChangeRequest } from '../models/PlayerNameChangeRequest';
import type { PlayerProgression } from '../models/PlayerProgression';
import type { PlayerV2 } from '../models/PlayerV2';
import type { Reservation } from '../models/Reservation';
import type { Team } from '../models/Team';
import type { TeamLeaderboardListing } from '../models/TeamLeaderboardListing';
import type { TeamLogo } from '../models/TeamLogo';
import type { TeamLogoChangeRequest } from '../models/TeamLogoChangeRequest';
import type { TeamName } from '../models/TeamName';
import type { TeamNameChangeRequest } from '../models/TeamNameChangeRequest';
import type { TokenPurchaseIntent } from '../models/TokenPurchaseIntent';
import type { TournamentDetail } from '../models/TournamentDetail';
import type { TournamentEntry } from '../models/TournamentEntry';
import type { TournamentEntryModel } from '../models/TournamentEntryModel';
import type { TournamentEntryTeam } from '../models/TournamentEntryTeam';
import type { TournamentGame } from '../models/TournamentGame';
import type { TournamentListing } from '../models/TournamentListing';
import type { TournamentReservation } from '../models/TournamentReservation';
import type { TournamentSeriesDetail } from '../models/TournamentSeriesDetail';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ApiService {

    /**
     * @param walletAddress
     * @param page A page number within the paginated result set.
     * @returns TokenPurchaseIntent
     * @throws ApiError
     */
    public static apiEthTokensRead(
        walletAddress: string,
        page?: number,
    ): CancelablePromise<TokenPurchaseIntent> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/eth/tokens/{wallet_address}/',
            path: {
                'wallet_address': walletAddress,
            },
            query: {
                'page': page,
            },
        });
    }

    /**
     * @param walletAddress
     * @param data
     * @returns TokenPurchaseIntent
     * @throws ApiError
     */
    public static apiEthTokensCreate(
        walletAddress: string,
        data: TokenPurchaseIntent,
    ): CancelablePromise<Array<TokenPurchaseIntent>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/eth/tokens/{wallet_address}/',
            path: {
                'wallet_address': walletAddress,
            },
            body: data,
        });
    }

    /**
     * @param page A page number within the paginated result set.
     * @param team
     * @param status
     * @returns any
     * @throws ApiError
     */
    public static apiGameList(
        page?: number,
        team?: number,
        status: 'OPEN' | 'COMPLETE' | 'IN_PROGRESS' | 'VOIDED' | 'ERROR' = 'OPEN',
    ): CancelablePromise<{
        count: number;
        next?: string | null;
        previous?: string | null;
        results: Array<GameListing>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/',
            query: {
                'page': page,
                'team': team,
                'status': status,
            },
        });
    }

    /**
     * @param data
     * @returns any
     * @throws ApiError
     */
    public static apiGamePartialUpdate(
        data: Array<GameUpdate>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/game/',
            body: data,
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static apiGameGmNotifictionResultsCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/gm/notifiction/results',
        });
    }

    /**
     * @param page A page number within the paginated result set.
     * @param team
     * @param status
     * @returns any
     * @throws ApiError
     */
    public static apiGameHeadtoheadList(
        page?: number,
        team?: number,
        status: 'OPEN' | 'COMPLETE' | 'IN_PROGRESS' | 'VOIDED' | 'ERROR' = 'OPEN',
    ): CancelablePromise<{
        count: number;
        next?: string | null;
        previous?: string | null;
        results: Array<GameListing>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/headtohead/',
            query: {
                'page': page,
                'team': team,
                'status': status,
            },
        });
    }

    /**
     * @param data
     * @returns any
     * @throws ApiError
     */
    public static apiGameHeadtoheadPartialUpdate(
        data: Array<GameUpdate>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/game/headtohead/',
            body: data,
        });
    }

    /**
     * Retrieves details of an individual game based on the ID in the URL
     * @param id
     * @param playerTokenForOverwrite The backend will take this player and overwrite a similar player in this game.
     * @returns Game
     * @throws ApiError
     */
    public static apiGameHeadtoheadRead(
        id: string,
        playerTokenForOverwrite?: number,
    ): CancelablePromise<Game> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/headtohead/{id}/',
            path: {
                'id': id,
            },
            query: {
                'player_token_for_overwrite': playerTokenForOverwrite,
            },
        });
    }

    /**
     * @param data
     * @returns HeadToHeadMatchMakeEnroll
     * @throws ApiError
     */
    public static apiGameHeadtoheadmatchmakeEnrollCreate(
        data: HeadToHeadMatchMakeEnroll,
    ): CancelablePromise<HeadToHeadMatchMakeEnroll> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/headtoheadmatchmake-enroll/',
            body: data,
        });
    }

    /**
     * Lists and filters players
     * @param positions
     * @param page A page number within the paginated result set.
     * @returns any
     * @throws ApiError
     */
    public static apiGamePlayerFreeagentList(
        positions?: string,
        page?: number,
    ): CancelablePromise<{
        count: number;
        next?: string | null;
        previous?: string | null;
        results: Array<PlayerV2>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/player/freeagent',
            query: {
                'positions': positions,
                'page': page,
            },
        });
    }

    /**
     * @param positions
     * @returns PlayerLeaderboardListing
     * @throws ApiError
     */
    public static apiGamePlayerLeaderboardList(
        positions?: string,
    ): CancelablePromise<Array<PlayerLeaderboardListing>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/player/leaderboard',
            query: {
                'positions': positions,
            },
        });
    }

    /**
     * Retrieves individual players players
     * @param tokenId
     * @returns Player
     * @throws ApiError
     */
    public static apiGamePlayerTokenRead(
        tokenId: string,
    ): CancelablePromise<Player> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/player/token/{token_id}/',
            path: {
                'token_id': tokenId,
            },
        });
    }

    /**
     * @param tokenId
     * @returns PlayerNameChangeRequest
     * @throws ApiError
     */
    public static apiGamePlayerTokenNameList(
        tokenId: string,
    ): CancelablePromise<PlayerNameChangeRequest> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/player/token/{token_id}/name',
            path: {
                'token_id': tokenId,
            },
        });
    }

    /**
     * @param tokenId
     * @param data
     * @returns PlayerNameChangeRequest
     * @throws ApiError
     */
    public static apiGamePlayerTokenNameCreate(
        tokenId: string,
        data: PlayerNameChangeRequest,
    ): CancelablePromise<PlayerNameChangeRequest> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/player/token/{token_id}/name',
            path: {
                'token_id': tokenId,
            },
            body: data,
        });
    }

    /**
     * @param tokenId
     * @returns PlayerNameChangeRequest
     * @throws ApiError
     */
    public static apiGamePlayerTokenNameDelete(
        tokenId: string,
    ): CancelablePromise<PlayerNameChangeRequest> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/game/player/token/{token_id}/name',
            path: {
                'token_id': tokenId,
            },
        });
    }

    /**
     * Retrieves individual player progession stats
     * @param tokenId
     * @returns PlayerProgression
     * @throws ApiError
     */
    public static apiGamePlayerTokenProgressionRead(
        tokenId: string,
    ): CancelablePromise<PlayerProgression> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/player/token/{token_id}/progression',
            path: {
                'token_id': tokenId,
            },
        });
    }

    /**
     * Retrieves individual players players
     * @param id A unique integer value identifying this player.
     * @returns Player
     * @throws ApiError
     */
    public static apiGamePlayerRead(
        id: number,
    ): CancelablePromise<Player> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/player/{id}/',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param tokenId
     * @returns PlayerGameListing
     * @throws ApiError
     */
    public static apiGamePlayerGamesList(
        tokenId: string,
    ): CancelablePromise<Array<PlayerGameListing>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/player/{token_id}/games',
            path: {
                'token_id': tokenId,
            },
        });
    }

    /**
     * @param page A page number within the paginated result set.
     * @returns GameStatus
     * @throws ApiError
     */
    public static apiGameStatusList(
        page?: number,
    ): CancelablePromise<GameStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/status',
            query: {
                'page': page,
            },
        });
    }

    /**
     * @returns TeamLeaderboardListing
     * @throws ApiError
     */
    public static apiGameTeamLeaderboardList(): CancelablePromise<Array<TeamLeaderboardListing>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/team/leaderboard',
        });
    }

    /**
     * Gets or updates an individual team
     * @param id A unique integer value identifying this team.
     * @returns Team
     * @throws ApiError
     */
    public static apiGameTeamRead(
        id: number,
    ): CancelablePromise<Team> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/team/{id}/',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Gets or updates an individual team logo
     * @param id A unique integer value identifying this team.
     * @param data
     * @returns any
     * @throws ApiError
     */
    public static apiGameTeamLogoUpdate(
        id: number,
        data: TeamLogo,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/game/team/{id}/logo/',
            path: {
                'id': id,
            },
            body: data,
        });
    }

    /**
     * Gets or updates an individual team logo
     * @param id A unique integer value identifying this team.
     * @param data
     * @returns any
     * @throws ApiError
     */
    public static apiGameTeamLogoPartialUpdate(
        id: number,
        data: TeamLogo,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/game/team/{id}/logo/',
            path: {
                'id': id,
            },
            body: data,
        });
    }

    /**
     * Create a url a user can use to upload a logo
     * @param id
     * @returns AWSUpload
     * @throws ApiError
     */
    public static apiGameTeamLogoUploadCreate(
        id: string,
    ): CancelablePromise<AWSUpload> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/team/{id}/logo/upload/',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Gets or updates an individual team name
     * @param id A unique integer value identifying this team.
     * @param data
     * @returns any
     * @throws ApiError
     */
    public static apiGameTeamNameUpdate(
        id: number,
        data: TeamName,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/game/team/{id}/name/',
            path: {
                'id': id,
            },
            body: data,
        });
    }

    /**
     * Gets or updates an individual team name
     * @param id A unique integer value identifying this team.
     * @param data
     * @returns any
     * @throws ApiError
     */
    public static apiGameTeamNamePartialUpdate(
        id: number,
        data: TeamName,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/game/team/{id}/name/',
            path: {
                'id': id,
            },
            body: data,
        });
    }

    /**
     * @param teamId
     * @param positions
     * @param page A page number within the paginated result set.
     * @returns any
     * @throws ApiError
     */
    public static apiGameTeamPlayersList(
        teamId: string,
        positions?: string,
        page?: number,
    ): CancelablePromise<{
        count: number;
        next?: string | null;
        previous?: string | null;
        results: Array<PlayerV2>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/team/{team_id}/players/',
            path: {
                'team_id': teamId,
            },
            query: {
                'positions': positions,
                'page': page,
            },
        });
    }

    /**
     * @param teamId
     * @param page A page number within the paginated result set.
     * @returns any
     * @throws ApiError
     */
    public static apiGameTeamTournamentsList(
        teamId: string,
        page?: number,
    ): CancelablePromise<{
        count: number;
        next?: string | null;
        previous?: string | null;
        results: Array<TournamentListing>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/team/{team_id}/tournaments/',
            path: {
                'team_id': teamId,
            },
            query: {
                'page': page,
            },
        });
    }

    /**
     * @param status
     * @param kind
     * @param page A page number within the paginated result set.
     * @returns any
     * @throws ApiError
     */
    public static apiGameTournamentList(
        status?: string,
        kind?: string,
        page?: number,
    ): CancelablePromise<{
        count: number;
        next?: string | null;
        previous?: string | null;
        results: Array<TournamentListing>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/tournament/',
            query: {
                'status': status,
                'kind': kind,
                'page': page,
            },
        });
    }

    /**
     * @param tournamentId
     * @returns TournamentDetail
     * @throws ApiError
     */
    public static apiGameTournamentRead(
        tournamentId: string,
    ): CancelablePromise<TournamentDetail> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/tournament/{tournament_id}/',
            path: {
                'tournament_id': tournamentId,
            },
        });
    }

    /**
     * @param gameId
     * @param tournamentId
     * @returns TournamentGame
     * @throws ApiError
     */
    public static apiGameTournamentGameRead(
        gameId: string,
        tournamentId: string,
    ): CancelablePromise<TournamentGame> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/tournament/{tournament_id}/game/{game_id}/',
            path: {
                'game_id': gameId,
                'tournament_id': tournamentId,
            },
        });
    }

    /**
     * @param tournamentId
     * @returns Lineup
     * @throws ApiError
     */
    public static apiGameTournamentLineupRead(
        tournamentId: string,
    ): CancelablePromise<Lineup> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/tournament/{tournament_id}/lineup/',
            path: {
                'tournament_id': tournamentId,
            },
        });
    }

    /**
     * @param tournamentId
     * @param data
     * @returns TournamentEntryModel
     * @throws ApiError
     */
    public static apiGameTournamentLineupCreate(
        tournamentId: string,
        data: CreateLineup,
    ): CancelablePromise<TournamentEntryModel> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/tournament/{tournament_id}/lineup/',
            path: {
                'tournament_id': tournamentId,
            },
            body: data,
        });
    }

    /**
     * @param tournamentId
     * @returns TournamentEntry
     * @throws ApiError
     */
    public static apiGameTournamentLineupsList(
        tournamentId: string,
    ): CancelablePromise<Array<TournamentEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/tournament/{tournament_id}/lineups/',
            path: {
                'tournament_id': tournamentId,
            },
        });
    }

    /**
     * @param tournamentId
     * @returns TournamentReservation
     * @throws ApiError
     */
    public static apiGameTournamentReservationCreate(
        tournamentId: string,
    ): CancelablePromise<TournamentReservation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/tournament/{tournament_id}/reservation/',
            path: {
                'tournament_id': tournamentId,
            },
        });
    }

    /**
     * @param reservationId
     * @param tournamentId
     * @returns TournamentReservation
     * @throws ApiError
     */
    public static apiGameTournamentReservationRead(
        reservationId: string,
        tournamentId: string,
    ): CancelablePromise<TournamentReservation> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/tournament/{tournament_id}/reservation/{reservation_id}/',
            path: {
                'reservation_id': reservationId,
                'tournament_id': tournamentId,
            },
        });
    }

    /**
     * @param reservationId
     * @param tournamentId
     * @returns void
     * @throws ApiError
     */
    public static apiGameTournamentReservationDelete(
        reservationId: string,
        tournamentId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/game/tournament/{tournament_id}/reservation/{reservation_id}/',
            path: {
                'reservation_id': reservationId,
                'tournament_id': tournamentId,
            },
        });
    }

    /**
     * @param roundId
     * @param seriesId
     * @param tournamentId
     * @returns TournamentSeriesDetail
     * @throws ApiError
     */
    public static apiGameTournamentRoundSeriesRead(
        roundId: string,
        seriesId: string,
        tournamentId: string,
    ): CancelablePromise<TournamentSeriesDetail> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/tournament/{tournament_id}/round/{round_id}/series/{series_id}/',
            path: {
                'round_id': roundId,
                'series_id': seriesId,
                'tournament_id': tournamentId,
            },
        });
    }

    /**
     * @param tournamentId
     * @returns TournamentEntryTeam
     * @throws ApiError
     */
    public static apiGameTournamentTeamsRead(
        tournamentId: string,
    ): CancelablePromise<Array<TournamentEntryTeam>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/tournament/{tournament_id}/teams/',
            path: {
                'tournament_id': tournamentId,
            },
        });
    }

    /**
     * @param gameId
     * @param reservationId
     * @returns Reservation
     * @throws ApiError
     */
    public static apiGameReservationRead(
        gameId: string,
        reservationId: string,
    ): CancelablePromise<Reservation> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/{game_id}/reservation/{reservation_id}/',
            path: {
                'game_id': gameId,
                'reservation_id': reservationId,
            },
        });
    }

    /**
     * @param gameId
     * @param reservationId
     * @returns void
     * @throws ApiError
     */
    public static apiGameReservationDelete(
        gameId: string,
        reservationId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/game/{game_id}/reservation/{reservation_id}/',
            path: {
                'game_id': gameId,
                'reservation_id': reservationId,
            },
        });
    }

    /**
     * Retrieves details of an individual game based on the ID in the URL
     * @param id
     * @param playerTokenForOverwrite The backend will take this player and overwrite a similar player in this game.
     * @returns Game
     * @throws ApiError
     */
    public static apiGameRead(
        id: string,
        playerTokenForOverwrite?: number,
    ): CancelablePromise<Game> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/{id}/',
            path: {
                'id': id,
            },
            query: {
                'player_token_for_overwrite': playerTokenForOverwrite,
            },
        });
    }

    /**
     * @param id
     * @param data
     * @returns Game
     * @throws ApiError
     */
    public static apiGameEnrollmentCreate(
        id: string,
        data: CreateLineup,
    ): CancelablePromise<Game> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/{id}/enrollment/',
            path: {
                'id': id,
            },
            body: data,
        });
    }

    /**
     * Lists and filters games
     * @param id A unique integer value identifying this play by play.
     * @returns GamePlayByPlay
     * @throws ApiError
     */
    public static apiGamePlayByPlayRead(
        id: number,
    ): CancelablePromise<GamePlayByPlay> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/{id}/play-by-play/',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns Reservation
     * @throws ApiError
     */
    public static apiGameReservationCreate(
        id: string,
    ): CancelablePromise<Reservation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/{id}/reservation/',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param teamId
     * @returns TeamLogoChangeRequest
     * @throws ApiError
     */
    public static apiModerationTeamLogoRead(
        teamId: string,
    ): CancelablePromise<TeamLogoChangeRequest> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/moderation/team/{team_id}/logo/',
            path: {
                'team_id': teamId,
            },
        });
    }

    /**
     * @param teamId
     * @returns void
     * @throws ApiError
     */
    public static apiModerationTeamLogoDelete(
        teamId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/moderation/team/{team_id}/logo/',
            path: {
                'team_id': teamId,
            },
        });
    }

    /**
     * @param teamId
     * @returns TeamNameChangeRequest
     * @throws ApiError
     */
    public static apiModerationTeamNameRead(
        teamId: string,
    ): CancelablePromise<TeamNameChangeRequest> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/moderation/team/{team_id}/name/',
            path: {
                'team_id': teamId,
            },
        });
    }

    /**
     * @param teamId
     * @returns void
     * @throws ApiError
     */
    public static apiModerationTeamNameDelete(
        teamId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/moderation/team/{team_id}/name/',
            path: {
                'team_id': teamId,
            },
        });
    }

}
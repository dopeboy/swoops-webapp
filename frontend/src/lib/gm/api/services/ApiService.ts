/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Player, NBAPlayerStats, PrimaryDailyLineupToday, GameCreate } from '../models/Player';
import type { Game } from '../models/Game';
import type { GameCreation } from '../models/GameCreation';
import type { GameUpdate } from '../models/GameUpdate';
import type { UserId } from '../models/UserId';
import type { Leaderboard } from '../models/Leaderboard';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ApiService {
    /**
     * @param data
     * @returns Player
     * @throws ApiError
     */
    public static apiPlayerCreate(data: Player): CancelablePromise<Player> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/player',
            body: data,
        });
    }

    /**
     * @returns Player
     * @throws ApiError
     */
    public static apiPlayersRead(): CancelablePromise<Array<Player>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/player',
            errors: {
                404: `Players not found`,
            },
        });
    }

    /**
     * @param playerUuid
     * @returns Player
     * @throws ApiError
     */
    public static apiPlayerRead(playerUuid: string): CancelablePromise<Player> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/player/{player_uuid}',
            path: {
                player_uuid: playerUuid,
            },
            errors: {
                404: `Player not found`,
            },
        });
    }

    /**
     * @param playerUuid
     * @param data
     * @returns Player
     * @throws ApiError
     */
    public static apiPlayerPartialUpdate(playerUuid: string, data: Player): CancelablePromise<Player> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/player/{player_uuid}',
            path: {
                player_uuid: playerUuid,
            },
            body: data,
        });
    }

    /**
     * @param status
     * @returns Game
     * @throws ApiError
     */
    public static apiGameList(status?: 'OPEN' | 'COMPLETE' | 'IN_PROGRESS'): CancelablePromise<Array<Game>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game',
            query: {
                status: status,
            },
        });
    }

    /**
     * @param data
     * @returns GameCreation
     * @throws ApiError
     */
    public static apiGameCreate(data: GameCreation): CancelablePromise<GameCreation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game',
            body: data,
        });
    }

    /**
     * @param gameUuid
     * @returns Game
     * @throws ApiError
     */
    public static apiGameRead(gameUuid: string): CancelablePromise<Game> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/{game_uuid}/',
            path: {
                game_uuid: gameUuid,
            },
            errors: {
                404: `Game not found`,
            },
        });
    }

    /**
     * @param gameUuid
     * @param data
     * @returns Game
     * @throws ApiError
     */
    public static apiGamePartialUpdate(gameUuid: string, data: GameUpdate): CancelablePromise<Game> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/game/{game_uuid}',
            path: {
                game_uuid: gameUuid,
            },
            body: data,
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static apiLolList(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/lol',
        });
    }

    /**
     * @returns Player
     * @throws ApiError
     */
    public static apiNBAPlayerRead({ position, ordering, search }): CancelablePromise<NBAPlayerStats> {
        return __request(OpenAPI, {
            method: 'GET',
            url: `/api/game/challenge/today/pool/`,
            query: {
                player__position: position,
                ordering: ordering,
                search: search,
                page: 1,
            },
        });
    }

    /**
     * @returns Leaderboard
     * @throws ApiError
     */
    public static apiGameLeaderboard(partnerSlug: string): CancelablePromise<Array<Leaderboard>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/leaderboard/' + (partnerSlug ? partnerSlug : ''),
        });
    }

    /**
     * @returns Players
     * @throws ApiError
     */
    public static apiDailyLineupPrimaryToday(): CancelablePromise<PrimaryDailyLineupToday> {
        return __request(OpenAPI, {
            method: 'GET',
            url: `/api/game/challenge/today/`,
        });
    }

    /**
     * @returns GameCreate
     * @throws ApiError
     */
    public static apiCreateGame(data: GameCreate): CancelablePromise<GameCreate> {
        return __request(OpenAPI, {
            method: 'POST',
            url: `/api/game/`,
            body: data,
        });
    }

    /**
     * @returns { "id", "username", "email", "phone_number", "twitter_handle" }
     * @throws ApiError
     */
    public static apiGetUserInfo(): CancelablePromise<{ id: string; username: string; email: string; phone_number: string; twitter_handle: string }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/',
        });
    }

    /**
     * @param phoneNumber
     * @param twitterHandle
     * @returns UserId
     * @throws ApiError
     */
    public static apiRequestVerificationCode(phoneNumber: string, twitterHandle: string, email: string): CancelablePromise<UserId> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/user/register/',
            body: {
                phone_number: phoneNumber,
                twitter_handle: twitterHandle,
                email: email,
            },
        });
    }

    /**
     * @param userId
     * @param verificationCode
     * @returns void
     * @throws ApiError
     */
    public static apiConfirmVerificationCode(userId: string, verificationCode: string): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/user/{user_id}/verify/{verification_code}/',
            path: {
                user_id: userId,
                verification_code: verificationCode,
            },
            body: {},
        });
    }

    /**
     * @param gameId
     * @returns void
     * @throws ApiError
     */
    public static gameGenerateResultImage(gameUuid: string): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/game/{uuid}/result-image/',
            path: {
                uuid: gameUuid,
            },
            body: {},
        });
    }

    /**
     * @param gameId
     * @returns any   // TODO - Fix this type
     * @throws ApiError
     */
    public static gameGenerateLineupImage(gameUuid: string): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/game/{uuid}/lineup-image/',
            path: {
                uuid: gameUuid,
            },
            body: {},
        });
    }
}

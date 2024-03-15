/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessToken } from '../models/AccessToken';
import type { Nonce } from '../models/Nonce';
import type { NonceVerification } from '../models/NonceVerification';
import type { TokenRefresh } from '../models/TokenRefresh';
import type { UpdateUser } from '../models/UpdateUser';
import type { User } from '../models/User';
import type { Wallet } from '../models/Wallet';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AccountsService {

    /**
     * @returns any
     * @throws ApiError
     */
    public static accountsLogoutCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/accounts/logout',
        });
    }

    /**
     * @param data
     * @returns Nonce
     * @throws ApiError
     */
    public static accountsNonceCreate(
        data: Wallet,
    ): CancelablePromise<Nonce> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/accounts/nonce',
            body: data,
        });
    }

    /**
     * @param data
     * @returns AccessToken
     * @throws ApiError
     */
    public static accountsNonceVerifyCreate(
        data: NonceVerification,
    ): CancelablePromise<AccessToken> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/accounts/nonce-verify',
            body: data,
        });
    }

    /**
     * @returns AccessToken
     * @throws ApiError
     */
    public static accountsRefreshRead(): CancelablePromise<AccessToken> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/accounts/refresh/',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static accountsSendVerificationEmailCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/accounts/send-verification-email',
        });
    }

    /**
     * Takes a refresh type JSON web token and returns an access type JSON web
     * token if the refresh token is valid.
     * @param data
     * @returns TokenRefresh
     * @throws ApiError
     */
    public static accountsTokenRefreshCreate(
        data: TokenRefresh,
    ): CancelablePromise<TokenRefresh> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/accounts/token/refresh/',
            body: data,
        });
    }

    /**
     * @param token
     * @returns any
     * @throws ApiError
     */
    public static accountsVerifyEmailList(
        token: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/accounts/verify-email',
            query: {
                'token': token,
            },
        });
    }

    /**
     * @param id
     * @returns User
     * @throws ApiError
     */
    public static accountsRead(
        id: string,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/accounts/{id}/',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @param data
     * @returns UpdateUser
     * @throws ApiError
     */
    public static accountsUpdate(
        id: string,
        data: UpdateUser,
    ): CancelablePromise<UpdateUser> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/accounts/{id}/',
            path: {
                'id': id,
            },
            body: data,
        });
    }

    /**
     * @param id
     * @param data
     * @returns UpdateUser
     * @throws ApiError
     */
    public static accountsPartialUpdate(
        id: string,
        data: UpdateUser,
    ): CancelablePromise<UpdateUser> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/accounts/{id}/',
            path: {
                'id': id,
            },
            body: data,
        });
    }

}
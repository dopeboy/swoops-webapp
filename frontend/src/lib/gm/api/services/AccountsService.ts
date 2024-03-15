/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Login } from '../models/Login';
import type { Registration } from '../models/Registration';
import type { User } from '../models/User';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AccountsService {

    /**
     * @param data
     * @returns User
     * @throws ApiError
     */
    public static accountsLoginCreate(
        data: Login,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/accounts/login',
            body: data,
        });
    }

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
     * @returns User
     * @throws ApiError
     */
    public static accountsRegisterCreate(
        data: Registration,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/accounts/register',
            body: data,
        });
    }

}
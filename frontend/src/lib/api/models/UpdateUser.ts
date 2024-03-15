/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Tutorial } from './Tutorial';

export type UpdateUser = {
    readonly id?: number;
    email?: string;
    /**
     * Designates whether the user has used social signin.
     */
    is_social_sign_in_user?: boolean;
    /**
     * Designates whether this user should be treated as active. Unselect this instead of deleting accounts.
     */
    readonly is_active?: boolean;
    /**
     * user's preferred lobby size
     */
    preferred_lobby_size?: number;
    reveal_games_by_default?: boolean;
    /**
     * Designates whether this user has verified their email or not.
     */
    readonly is_verified?: boolean;
    readonly team?: string;
    tutorial?: Tutorial;
    signup_referrer_code?: string | null;
};

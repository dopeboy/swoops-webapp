/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Team } from './Team';
import type { Tutorial } from './Tutorial';

export type User = {
    readonly id?: number;
    email?: string | null;
    /**
     * Designates whether this user should be treated as active. Unselect this instead of deleting accounts.
     */
    readonly is_active?: boolean;
    /**
     * Reveal all game scores by default.
     */
    reveal_games_by_default?: boolean;
    /**
     * Designates whether this user has verified their email or not.
     */
    readonly is_verified?: boolean;
    team: Team;
    readonly magic_bell_hmac?: string;
    /**
     * user's preferred lobby size
     */
    preferred_lobby_size?: number;
    tutorial: Tutorial;
};

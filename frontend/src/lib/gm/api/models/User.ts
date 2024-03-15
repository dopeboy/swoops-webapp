/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Player } from './Player';

export type User = {
    readonly uuid?: string;
    first_name: string;
    last_name: string;
    email: string;
    /**
     * Designates whether this user should be treated as active. Unselect this instead of deleting accounts.
     */
    readonly is_active?: boolean;
    player_set: Array<Player>;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Player } from './Player';

export type TournamentLineupModel = {
    readonly id?: number;
    player_1: Player;
    player_2: Player;
    player_3: Player;
    player_4: Player;
    player_5: Player;
};

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Player } from './Player';
import type { Team } from './Team';

export type Lineup = {
    readonly id?: number;
    team: Team;
    player_1: Player;
    player_2: Player;
    player_3: Player;
    player_4: Player;
    player_5: Player;
};

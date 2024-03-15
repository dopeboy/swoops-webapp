/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { User } from './User';

export type Game = {
    readonly uuid?: string;
    challenger: User;
    challenged?: User;
    readonly challenger_team_external_uuid?: string | null;
    readonly challenged_team_external_uuid?: string | null;
    readonly entry_fee?: string;
    readonly prize_pool?: string;
    readonly challenger_player_1_external_uuid?: string | null;
    readonly challenger_player_2_external_uuid?: string | null;
    readonly challenger_player_3_external_uuid?: string | null;
    readonly challenger_player_4_external_uuid?: string | null;
    readonly challenger_player_5_external_uuid?: string | null;
    readonly challenged_player_1_external_uuid?: string | null;
    readonly challenged_player_2_external_uuid?: string | null;
    readonly challenged_player_3_external_uuid?: string | null;
    readonly challenged_player_4_external_uuid?: string | null;
    readonly challenged_player_5_external_uuid?: string | null;
    status?: Game.status;
    readonly results?: any;
    challenger_player_1?: string | null;
    challenger_player_2?: string | null;
    challenger_player_3?: string | null;
    challenger_player_4?: string | null;
    challenger_player_5?: string | null;
    challenged_player_1?: string | null;
    challenged_player_2?: string | null;
    challenged_player_3?: string | null;
    challenged_player_4?: string | null;
    challenged_player_5?: string | null;
};


export namespace Game {

    export enum status {
        OPEN = 'OPEN',
        COMPLETE = 'COMPLETE',
        IN_PROGRESS = 'IN_PROGRESS',
    }


}

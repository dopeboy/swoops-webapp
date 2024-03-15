/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type GameUpdate = {
    readonly uuid?: string;
    challenged?: number;
    challenger_team_external_uuid?: string | null;
    challenged_team_external_uuid?: string | null;
    readonly entry_fee?: string;
    readonly prize_pool?: string;
    challenger_player_1_external_uuid?: string | null;
    challenger_player_2_external_uuid?: string | null;
    challenger_player_3_external_uuid?: string | null;
    challenger_player_4_external_uuid?: string | null;
    challenger_player_5_external_uuid?: string | null;
    challenged_player_1_external_uuid?: string | null;
    challenged_player_2_external_uuid?: string | null;
    challenged_player_3_external_uuid?: string | null;
    challenged_player_4_external_uuid?: string | null;
    challenged_player_5_external_uuid?: string | null;
    status?: GameUpdate.status;
    results?: any;
    readonly challenger?: string;
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

export namespace GameUpdate {

    export enum status {
        OPEN = 'OPEN',
        COMPLETE = 'COMPLETE',
        IN_PROGRESS = 'IN_PROGRESS',
    }


}

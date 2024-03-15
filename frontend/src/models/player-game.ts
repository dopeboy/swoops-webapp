import { BoxScoreListing, Contest } from 'src/lib/api';
export interface PlayerGame {
    readonly game_id?: number;
    readonly player_id?: number;
    readonly team_id?: number;
    readonly opponent_team_id?: number;
    readonly is_lineup_1?: boolean;
    readonly team_name?: string;
    readonly opponent_team_name?: string;
    readonly game_kind?: Contest.kind;
    readonly game_status?: Contest.status;
    readonly played_at?: string;
    readonly lineup_1_score?: number;
    readonly lineup_2_score?: number;
    readonly won?: boolean;
    readonly player_box_score?: BoxScoreListing;
}

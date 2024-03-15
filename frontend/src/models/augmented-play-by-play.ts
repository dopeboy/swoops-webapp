import { Team } from 'src/lib/api';

export interface AugmentedPlayByPlay {
    action: string;
    action_type: string;
    challenged_score: number;
    challenger_score: number;
    detail: string;
    gameclock: string;
    player: string;
    possession: number;
    quarter: number;
    time_remaining: number;
    team?: Team;
    token?: number;
}

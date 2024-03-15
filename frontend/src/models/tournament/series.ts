import { TournamentGame } from './tournament-game';
import { TournamentTeam } from './tournament-team';

export interface Series {
    id: number;
    team_1: TournamentTeam;
    team_2: TournamentTeam;
    games: TournamentGame[];
}

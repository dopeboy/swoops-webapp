import { Round } from './round';
import { TournamentMeta } from './tournament-meta';

export interface Tournament {
    id: number;
    name: string;
    size: number;
    lineup_submission_cutoff: string;
    reveal_date: string;
    meta: TournamentMeta;
    rounds: Round[];
}

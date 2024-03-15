/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentLineup } from './TournamentLineup';
import type { TournamentTeam } from './TournamentTeam';

export type TournamentEntry = {
    id: number;
    rank: number;
    seed: number;
    positions: Array<'G' | 'F' | 'C'>;
    team: TournamentTeam;
    lineup: TournamentLineup;
};

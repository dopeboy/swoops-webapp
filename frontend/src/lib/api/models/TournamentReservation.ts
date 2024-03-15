/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentListing } from './TournamentListing';
import type { TournamentTeamModel } from './TournamentTeamModel';

export type TournamentReservation = {
    readonly id?: number;
    tournament: TournamentListing;
    team: TournamentTeamModel;
    readonly tokens_required?: number;
    expires_at: string;
};

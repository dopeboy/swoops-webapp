import { Contest, Lineup, Reservation, Result } from 'src/lib/api';

export interface RevisedGame {
    readonly id?: number;
    readonly created_at?: string;
    readonly contest?: Contest;
    readonly lineup_1?: Lineup;
    readonly lineup_2?: Lineup;
    readonly reservations?: Array<Reservation>;
    readonly result?: Result;
    readonly status?: string;
}

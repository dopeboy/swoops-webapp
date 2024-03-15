import { describe, expect, test } from '@jest/globals';
import { createLineup, EmptyRosterPlayer } from './utils';
import { ReadonlyPlayer } from '../services/PlayerService';
import { Position } from 'src/models/position.type';

describe('utils', () => {
    describe('createLineup', () => {
        const createPlayer = (positions: Position[], id = 0): ReadonlyPlayer => ({ positions, id, age: 0, star_rating: 0 });
        test('fills empty positions with EmptyRosterPlayer', () => {
            const lineup = createLineup([]);
            expect(lineup).toHaveLength(5);
            expect(lineup).toEqual([EmptyRosterPlayer, EmptyRosterPlayer, EmptyRosterPlayer, EmptyRosterPlayer, EmptyRosterPlayer]);
        });

        test('assigns guards to first 2 positions', () => {
            const guard1 = createPlayer(['G'], 0);
            const guard2 = createPlayer(['G'], 1);
            const lineup = createLineup([guard1, guard2]);
            expect(lineup).toEqual([guard1, guard2, EmptyRosterPlayer, EmptyRosterPlayer, EmptyRosterPlayer]);
        });

        test('assigns forwards to third and fourth positions', () => {
            const forward1 = createPlayer(['F'], 0);
            const forward2 = createPlayer(['F'], 1);
            const lineup = createLineup([forward1, forward2]);
            expect(lineup).toEqual([EmptyRosterPlayer, EmptyRosterPlayer, forward1, forward2, EmptyRosterPlayer]);
        });

        test('assigns center to fifth position', () => {
            const center = createPlayer(['C']);
            const lineup = createLineup([center]);
            expect(lineup).toEqual([EmptyRosterPlayer, EmptyRosterPlayer, EmptyRosterPlayer, EmptyRosterPlayer, center]);
        });

        test('can assign forward-guards to forward', () => {
            const guard1 = createPlayer(['G'], 0);
            const guard2 = createPlayer(['G'], 1);
            const fg = createPlayer(['F', 'G'], 2);
            const lineup = createLineup([guard1, guard2, fg]);
            expect(lineup).toEqual([guard1, guard2, fg, EmptyRosterPlayer, EmptyRosterPlayer]);
        });

        test('can assign forward-guards to guard', () => {
            const forward1 = createPlayer(['F'], 0);
            const forward2 = createPlayer(['F'], 1);
            const fg = createPlayer(['F', 'G'], 2);
            const lineup = createLineup([forward1, forward2, fg]);
            expect(lineup).toEqual([fg, EmptyRosterPlayer, forward1, forward2, EmptyRosterPlayer]);
        });

        test('can assign forward-centers to forward', () => {
            const center = createPlayer(['C'], 0);
            const fc = createPlayer(['F', 'C'], 2);
            const lineup = createLineup([center, fc]);
            expect(lineup).toEqual([EmptyRosterPlayer, EmptyRosterPlayer, fc, EmptyRosterPlayer, center]);
        });

        test('can assign forward-centers to center', () => {
            const forward1 = createPlayer(['F'], 0);
            const forward2 = createPlayer(['F'], 1);
            const fc = createPlayer(['F', 'C'], 2);
            const lineup = createLineup([forward1, forward2, fc]);
            expect(lineup).toEqual([EmptyRosterPlayer, EmptyRosterPlayer, forward1, forward2, fc]);
        });

        test('can create a valid lineup', () => {
            const guard1 = createPlayer(['G']);
            const guard2 = createPlayer(['G']);
            const forward1 = createPlayer(['F']);
            const forward2 = createPlayer(['F']);
            const center = createPlayer(['C']);
            const lineup = createLineup([center, forward1, guard1, guard2, forward2]);
            expect(lineup).toEqual([guard1, guard2, forward1, forward2, center]);
        });

        test('will move forward-guards to create a valid lineup', () => {
            const fg1 = createPlayer(['F', 'G'], 0);
            const fg2 = createPlayer(['F', 'G'], 1);
            const fg3 = createPlayer(['F', 'G'], 2);
            const guard = createPlayer(['G'], 3);
            const lineup = createLineup([fg1, fg2, fg3, guard]);
            expect(lineup).toEqual([fg3, guard, fg1, fg2, EmptyRosterPlayer]);
        });

        test('will move forward-centers to create a valid lineup', () => {
            const center = createPlayer(['C'], 0);
            const fc1 = createPlayer(['F', 'C'], 1);
            const fc2 = createPlayer(['F', 'C'], 2);
            const lineup = createLineup([center, fc1, fc2]);
            expect(lineup).toEqual([EmptyRosterPlayer, EmptyRosterPlayer, fc1, fc2, center]);
        });

        test('will move forward-guards and forward-centers to create a valid lineup', () => {
            const fc1 = createPlayer(['F', 'C'], 0);
            const fc2 = createPlayer(['F', 'C'], 1);
            const fg1 = createPlayer(['F', 'G'], 2);
            const fg2 = createPlayer(['F', 'G'], 3);
            const fg3 = createPlayer(['F', 'G'], 4);
            const lineup = createLineup([fc1, fc2, fg1, fg2, fg3]);
            expect(lineup).toEqual([fg2, fg3, fc1, fg1, fc2]);
        });

        test('returns null if unable to create lineup', () => {
            const center1 = createPlayer(['C'], 0);
            const center2 = createPlayer(['C'], 1);
            const lineup = createLineup([center1, center2]);
            expect(lineup).toBeNull();
        });
    });
});

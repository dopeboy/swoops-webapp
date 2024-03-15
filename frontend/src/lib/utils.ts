import { Position } from 'src/models/position.type';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { AccountsService, Contest, OpenAPI, Team, TournamentDetail, TournamentRound } from '../lib/api/index';
import * as Sentry from '@sentry/nextjs';
import { DivisionButton } from 'src/models/division-button';
import { LocalStorageUser } from 'src/models/localStorageUser';

export const logoutUserFromClient = (hardClear?: boolean): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('user');
        window.localStorage.removeItem('userDetail');
        window.localStorage.removeItem('access_token');
        window.localStorage.removeItem('refresh_token');
        if (hardClear) {
            localStorage.clear();
        }
        OpenAPI.CREDENTIALS = 'omit';
        OpenAPI.WITH_CREDENTIALS = false;
        OpenAPI.TOKEN = undefined;
    }
};

export const isUserLoggedIn = (): boolean => {
    if (typeof window !== 'undefined' && hasValidAccessToken()) {
        return window.localStorage.getItem('user') !== null;
    }
    return false;
};

export const isUserVerified = (): boolean => {
    if (typeof window !== 'undefined' && hasValidAccessToken()) {
        const user = JSON.parse(window.localStorage.getItem('userDetail'));
        return !!user?.is_verified;
    }
    return false;
};

export const getWalletAddress = (): string => {
    if (typeof window !== 'undefined') {
        return window.localStorage.getItem('user');
    }
};

export const setWalletAddress = (walletAddress: string): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('user', walletAddress);
    }
};

export const getUserDetail = (): LocalStorageUser => {
    if (typeof window !== 'undefined' && hasValidAccessToken()) {
        const userDetailStr = window.localStorage.getItem('userDetail');
        return userDetailStr ? JSON.parse(userDetailStr) : {};
    }
};

export const setUserDetail = (user: LocalStorageUser): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('userDetail', JSON.stringify(user));
    }
};

export const getPrice = (price: string): string => {
    if (!price) return '$0';
    return '$' + parseFloat(price).toLocaleString();
};

export const getJwtExpiration = (jwt: string): number => {
    const parsedJwt = JSON.parse(window.atob(jwt.split('.')[1]));
    // Multiply by 1000 to convert from seconds to milliseconds
    return 1000 * parsedJwt.exp;
};

const isJwtExpired = (jwt: string): boolean => {
    const expiration = getJwtExpiration(jwt);
    return expiration < Date.now();
};

export const getAccessToken = (): string => {
    if (typeof window !== 'undefined') {
        const accessToken = window.localStorage.getItem('access_token');
        if (accessToken && !isJwtExpired(accessToken)) {
            return accessToken;
        }
    }
};

/**
 * Gets the time when the access token stored in localStorage expires
 * @returns {number} milliseconds from epoch when token will expire. Defaults to 0.
 */
export const getAccessTokenExpiration = (): number => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            return 0;
        }
        return getJwtExpiration(accessToken);
    } catch (err) {
        return 0;
    }
};

export const setAccessToken = (access_token: string): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('access_token', access_token);
        OpenAPI.TOKEN = access_token;
    }
};

export function hasValidAccessToken(): boolean {
    return !!getAccessToken();
}

export const getRefreshToken = (): string | null | undefined => {
    if (typeof window !== 'undefined') {
        const refreshToken = window.localStorage.getItem('refresh_token');
        if (refreshToken && !isJwtExpired(refreshToken)) {
            return refreshToken;
        }
    }
};

export const setRefreshToken = (refresh_token: string): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('refresh_token', refresh_token);
    }
};

export function hasValidRefreshToken(): boolean {
    return !!getRefreshToken();
}

export const refreshAccessToken = async (): Promise<void> => {
    if (typeof window !== 'undefined') {
        try {
            const response = await AccountsService.accountsTokenRefreshCreate({ refresh: getRefreshToken() });

            if (response.access) {
                setAccessToken(response.access);
            }
        } catch (err) {
            Sentry.captureException(err);
            throw err;
        }
    }
};

export const setEducationalModalViewed = (): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('educational_modal_viewed', 'true');
    }
};

export const getEducationalModalViewed = (): string => {
    if (typeof window !== 'undefined') {
        return window.localStorage.getItem('educational_modal_viewed');
    }
};

export const setTeamTournamentElegiblelModalViewed = (): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('team_elegible_modal_viewed', 'true');
    }
};

export const geTeamTournamentElegiblelModalViewed = (): string => {
    if (typeof window !== 'undefined') {
        return window.localStorage.getItem('team_elegible_modal_viewed');
    }
};

export const mapToStatus = (str: string): Contest.status => {
    const mappings = {
        open: Contest.status.OPEN,
        inprogress: Contest.status.IN_PROGRESS,
        completed: Contest.status.COMPLETE,
    };

    return mappings[str];
};

export const randomImage = (index: number) =>
    index % 2 === 0 ? '/images/AvatarPink.png' : index % 3 === 0 ? '/images/AvatarGreen.png' : '/images/AvatarWhite.png';

export const stringifyPositions = (positions: Array<Position>) =>
    positions?.reduce(
        (reducedPositions: string, position: string, index: number) =>
            (reducedPositions += `${position}${index !== positions.length - 1 ? ',' : ''}`),
        ''
    );

export const getUserTeam = async (): Promise<Team | undefined> => {
    if (isUserLoggedIn()) {
        const user = getUserDetail();
        const { team } = await AccountsService.accountsRead(user.id.toString());
        return team;
    }
};

export const getSortedPositions = (positions: string[]): string[] => {
    const sortedPositions = [...positions];
    const availablePositions = ['G', 'F', 'C'];
    sortedPositions.sort((a, b) => availablePositions.indexOf(a) - availablePositions.indexOf(b));
    return sortedPositions;
};

export const EmptyRosterPlayer = null;

type Lineup = { [key in Position]: ReadonlyPlayer[] };

const createLineupHelper = (
    players: ReadonlyPlayer[],
    availablePositions: { [key in Position]: number } = { G: 2, F: 2, C: 1 },
    lineup: Lineup = { G: [], F: [], C: [] },
    index = 0
): Lineup | null => {
    // Once there are no more players to assign, we know we've created a valid lineup and can return it
    if (players.length === index) {
        return lineup;
    }

    // Get the next player we want to assign to a position
    const player = players[index];

    // Go through each position the player can play
    for (const position of player?.positions ?? []) {
        // Check if any open spots for that position
        if (availablePositions[position] > 0) {
            // Assign player to position and decrement number of open spots for that position
            availablePositions[position]--;
            lineup[position].push(player);

            // Recursively try to create lineup with remaining players and remaining positions
            const newLineup = createLineupHelper(players, availablePositions, lineup, index + 1);

            // If successful, return completed lineup
            if (newLineup) {
                return newLineup;
            }
            // Otherwise, unassign this player  and open spot for this position
            lineup[position].pop();
            availablePositions[position]++;
        }
    }

    // If we can't find a matching player for this position, we return null to indicate no valid lineup is possible
    return null;
};

export const createLineup = (players: ReadonlyPlayer[]): null | ReadonlyPlayer[] => {
    const lineup = createLineupHelper(players);

    return lineup
        ? [
              lineup.G[0] || EmptyRosterPlayer,
              lineup.G[1] || EmptyRosterPlayer,
              lineup.F[0] || EmptyRosterPlayer,
              lineup.F[1] || EmptyRosterPlayer,
              lineup.C[0] || EmptyRosterPlayer,
          ]
        : null;
};

export const displayPlayerStat = (stat, player): string => {
    if (!player) return '-';

    if (stat === 'W/L' || stat === 'wl') {
        return !player.wins && !player.losses ? '-' : `${player.wins || 0} - ${player.losses || 0}`;
    } else if (stat === 'W/L%') {
        return player?.percentage_wins?.toFixed(1) || 0;
    } else if (stat === 'SZN') {
        return player.age ?? '0';
    } else if (!player[stat.toLowerCase()]) {
        return '-';
    } else if (stat?.toLowerCase()?.includes('pct')) {
        return (Number(player[stat.toLowerCase()]) * 100).toFixed(1);
    } else if (stat?.toLowerCase()?.includes('rating')) {
        return Math.round(Number(player[stat.toLowerCase()])).toFixed(0);
    }

    return Number(player[stat.toLowerCase()]).toFixed(1);
};

export const displaySeasonStats = (stat, seasonStats): string => {
    if (!seasonStats) return '-';

    if (stat === 'W/L' || stat === 'wl') {
        return !seasonStats.wins && !seasonStats.losses ? '-' : `${seasonStats.wins || 0} - ${seasonStats.losses || 0}`;
    } else if (stat === 'SEASON') {
        return seasonStats.season ?? 's0';
    } else if (!seasonStats[stat.toLowerCase()]) {
        return '-';
    } else if (stat?.toLowerCase()?.includes('pct')) {
        return (Number(seasonStats[stat.toLowerCase()]) * 100).toFixed(1);
    }

    return Number(seasonStats[stat.toLowerCase()]).toFixed(1);
};

export const displayPlayerGameStat = (stat, playerGame): string => {
    if (!playerGame) return '-';

    if (stat === 'field_goals') {
        return `${Number(playerGame.field_goals).toFixed(0) || 0} / ${Number(playerGame.field_goal_attempts).toFixed(0) || 0}`;
    } else if (stat === 'three_pointers') {
        return `${Number(playerGame.three_pointers).toFixed(0) || 0} / ${Number(playerGame.three_point_attempts).toFixed(0) || 0}`;
    } else if (stat === 'free_throws') {
        return `${Number(playerGame.free_throws).toFixed(0) || 0} / ${Number(playerGame.free_throw_attempts).toFixed(0) || 0}`;
    } else if (!playerGame[stat.toLowerCase()]) {
        return '-';
    }

    if (!playerGame[stat.toLowerCase()]) {
        return '-';
    }

    return Number(playerGame[stat.toLowerCase()]).toFixed(0);
};

export const displayPlayerBoxScoreStat = (stat, player): string => {
    if (!player) return '-';

    if (stat === 'fg') {
        return `${Number(player.fg).toFixed(0) || 0} / ${Number(player.fga).toFixed(0) || 0}`;
    } else if (stat === 'three_p') {
        return `${Number(player.three_p).toFixed(0) || 0} / ${Number(player.three_pa).toFixed(0) || 0}`;
    } else if (stat === 'ft') {
        return `${Number(player.ft).toFixed(0) || 0} / ${Number(player.fta).toFixed(0) || 0}`;
    } else if (!player[stat.toLowerCase()]) {
        return '-';
    }

    return Number(player[stat.toLowerCase()]).toFixed(0);
};

export const displayTeamStat = (stat, team, shouldDisplayFractionDigits = true): string => {
    if (stat === 'l10') {
        return `${team.l10_wins}-${team.l10_losses}`;
    } else if (stat === 'win_percentage') {
        return (
            Number(team[stat.toLowerCase()])
                ?.toFixed(shouldDisplayFractionDigits ? 2 : 0)
                ?.slice(0) || '0'
        );
    } else if (stat === 'streak') {
        return team[stat];
    }
    return Number(team[stat]).toFixed(shouldDisplayFractionDigits ? 1 : 0);
};

export const abbreviateTeamName = (teamName: string): string => {
    if (teamName.length > 3) {
        const separatedTeamName = teamName?.split(' ');
        if (separatedTeamName.length > 2) {
            return `${separatedTeamName[0][0]}${separatedTeamName[1][0]}${separatedTeamName[2][0]}`;
        } else if (separatedTeamName.length > 1) {
            return `${separatedTeamName[0][0]}${separatedTeamName[0][1]}${separatedTeamName[1][0]}`;
        } else {
            return `${separatedTeamName[0][0]}${separatedTeamName[0][1]}${separatedTeamName[0][2]}`;
        }
    }
    return teamName;
};

export const getTeamLogoFinalResolutionPath = (path: string): string => {
    const separatedPath = path?.split('.');
    return `${separatedPath[0]}_200x200.${separatedPath[1]}`;
};

export const getFilteredRounds = (tournament: TournamentDetail, roundAmount: number): { [key: string]: TournamentRound } => {
    switch (roundAmount) {
        case 2:
            return {
                '4': tournament?.rounds[0],
                championship: tournament?.rounds[1],
            };
        case 3:
            return {
                '8': tournament?.rounds[0],
                '4': tournament?.rounds[1],
                championship: tournament?.rounds[2],
            };
        case 4:
            return {
                '16': tournament?.rounds[0],
                '8': tournament?.rounds[1],
                '4': tournament?.rounds[2],
                championship: tournament?.rounds[3],
            };

        case 5:
            return {
                '32': tournament?.rounds[0],
                '16': tournament?.rounds[1],
                '8': tournament?.rounds[2],
                '4': tournament?.rounds[3],
                championship: tournament?.rounds[4],
            };
        case 6:
            return {
                '64': tournament?.rounds[0],
                '32': tournament?.rounds[1],
                '16': tournament?.rounds[2],
                '8': tournament?.rounds[3],
                '4': tournament?.rounds[4],
                championship: tournament?.rounds[5],
            };
    }
    return {
        '64': tournament?.rounds[0],
        '32': tournament?.rounds[1],
        '16': tournament?.rounds[2],
        '8': tournament?.rounds[3],
        '4': tournament?.rounds[4],
        championship: tournament?.rounds[5],
    };
};

export const getDivisionButtonsForRoundAmount = (roundAmount: number): DivisionButton[] => {
    const minimalRounds = [
        { round: '4', title: 'Round of 4', isFirst: true },
        { round: 'championship', title: 'Championship', isLast: true },
    ];

    const roundObject = {
        1: [{ round: 'championship', title: 'Championship', isLast: true }],
        2: minimalRounds,
        3: [{ round: '8', title: 'Round of 8', isFirst: true }, ...minimalRounds.map((round) => ({ ...round, isFirst: false }))],
        4: [
            { round: '16', title: 'Round of 16', isFirst: true },
            { round: '8', title: 'Round of 8' },
            ...minimalRounds.map((round) => ({ ...round, isFirst: false })),
        ],
        5: [
            { round: '32', title: 'Round of 32', isFirst: true },
            { round: '16', title: 'Round of 16' },
            { round: '8', title: 'Round of 8' },
            ...minimalRounds.map((round) => ({ ...round, isFirst: false })),
        ],
        6: [
            { round: '64', title: 'Round of 64', isFirst: true },
            { round: '32', title: 'Round of 32' },
            { round: '16', title: 'Round of 16' },
            { round: '8', title: 'Round of 8' },
            ...minimalRounds.map((round) => ({ ...round, isFirst: false })),
        ],
    };

    return roundObject[roundAmount] || minimalRounds;
};

const extractMaxGamesPerRound = (meta: string): number[] | null => {
    try {
        const parsedString = meta.replace(/'/g, `"`);
        const parsedMeta = JSON.parse(parsedString);
        return parsedMeta.max_games_per_round || null;
    } catch (e) {
        console.error('Error parsing meta:', e);
        return null;
    }
};

export const extractPayouts = (meta: string): number[] | null => {
    try {
        const parsedString = meta.replace(/'/g, `"`);
        const parsedMeta = JSON.parse(parsedString);
        return parsedMeta.payout_breakdown_usd || null;
    } catch (e) {
        console.error('Error parsing meta:', e);
        return null;
    }
};

export const getBestOf = (tournament: TournamentDetail, roundId: number): string => {
    if (!tournament) return '';
    const extractedTournamentMeta = extractMaxGamesPerRound(tournament.meta);
    const findRoundIndex = tournament.rounds.findIndex((round) => round.id === Number(roundId));
    if (findRoundIndex === -1) return '';
    return `Best of ${extractedTournamentMeta?.[findRoundIndex] || 3}`;
};

export const getBestOfAmount = (tournament: TournamentDetail, roundId: number): number => {
    if (!tournament) return 0;
    const extractedTournamentMeta = extractMaxGamesPerRound(tournament.meta);
    const findRoundIndex = tournament.rounds.findIndex((round) => round.id === Number(roundId));
    if (findRoundIndex === -1) return 0;
    return extractedTournamentMeta?.[findRoundIndex] || 3;
};

// Per https://github.com/PlaySwoops/swoops-webapp/pull/847, we now automatically
// name your team when you sign up. However, those users should still have the opportunity to
// name their team, even if the name is not empty.
// This is hacky and should be done using a `named_on` field on the `Team` object. But for now,
// assume any team name that is 'TEAM-<lastfourdigits>' to be unnamed.
export const isTeamNamed = (name: string): boolean => {
    if (getWalletAddress() !== null) {
        return `team-${getWalletAddress().slice(-4).toLowerCase()}` !== name.toLowerCase();
    }
    return false;
};

// A tutorial is composed of pages which we call steps.
// Each step has a number. This number needs to match
// to a frontend route. That way, the backend can serve
// the `next_step_number` for a user and the frontend
// can convert that to a page and then redirect.
//
// What if we change the sequence of steps in a  tutorial?
// The backend will handle this, so long as the mapping
// below works fine.
//
// What if we introduce new steps or cut some out?
// The backend will introduce new steps and so long
// as the mapping below works, we're good.

// As of 7/11, we're on version 1 and
// the set of steps is 100->200->300->400->500->600->700
export const getRouteFromStepNumberForTutorial = (stepNumber: number): string => {
    if (stepNumber === 100) {
        return 'FILL_ME_IN';
    } else if (stepNumber === 200) {
        return 'FILL_ME_IN';
    } else if (stepNumber === 300) {
        return 'FILL_ME_IN';
    } else if (stepNumber === 400) {
        return 'FILL_ME_IN';
    } else if (stepNumber === 500) {
        return 'FILL_ME_IN';
    } else if (stepNumber === 600) {
        return 'FILL_ME_IN';
    } else if (stepNumber === 700) {
        return 'FILL_ME_IN';
    } else {
        return '/404';
    }
};

export const getOperatingSystem = (): string | null => {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os: string | null = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
    }

    return os;
};

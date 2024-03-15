import { Game, Team } from './api';

export const getPlayerObject = (game: Game, lineupNumber: number): any => {
    const playerObject = {};
    for (let i = 1; i < 6; i++) {
        if (game?.[`lineup_${lineupNumber}`]) {
            const player = game?.[`lineup_${lineupNumber}`]?.[`player_${i}`];
            if (player?.full_name) {
                playerObject[player?.full_name] = {
                    id: game?.[`lineup_${lineupNumber}`]?.team?.id,
                    name: game?.[`lineup_${lineupNumber}`]?.team?.name,
                    token: player?.token,
                    lineupNumber,
                };
            }
        }
    }
    return playerObject;
};

export const getTeamFromPlay = (game: Game, play: any): any => {
    if (play?.team?.toLowerCase() === 'challengers') {
        return { name: game?.lineup_1?.team?.name, id: game?.lineup_1?.team?.id, lineupNumber: 1 };
    } else if (play?.team?.toLowerCase() === 'challenged') {
        return { name: game?.lineup_2?.team?.name, id: game?.lineup_2?.team?.id, lineupNumber: 2 };
    }
};

export const findPlayerName = (game: Game, lineupNumber: number, playerUuid: string): string => {
    for (let i = 1; i < 6; i++) {
        if (game?.[`lineup_${lineupNumber}`]) {
            const player = game?.[`lineup_${lineupNumber}`]?.[`player_${i}`];
            if (player?.uuid === playerUuid) {
                return player?.full_name;
            }
        }
    }
    return '';
};

export const isUserTeam = (user: any, team: Team): boolean => user?.team?.id === team?.id;

export const handleTeamName = (user: any, team?: Team): string => {
    return team?.name?.length > 0 ? team?.name : isUserTeam(user, team) ? 'Your team' : 'Unnamed';
};

export const getPlayerFromPlay = (game: Game, play: any): { name: string; uuid: string } => {
    if (play?.detail && play?.detail?.toLowerCase()?.includes('{')) {
        const splitDetail = play?.detail?.split(' ');
        if (splitDetail) {
            const index = splitDetail.findIndex((word) => word?.toLowerCase()?.includes('{'));
            const playerUuid = splitDetail[index]?.replace('{', '')?.replace('}', '');
            if (play?.team) {
                const team = getTeamFromPlay(game, play);
                if (team?.lineupNumber === 1) {
                    const playerNameInLineupOne = findPlayerName(game, 1, playerUuid);
                    if (playerNameInLineupOne) {
                        return { name: playerNameInLineupOne, uuid: playerUuid };
                    }
                } else if (team?.lineupNumber === 2) {
                    const playerNameInLineupTwo = findPlayerName(game, 2, playerUuid);
                    if (playerNameInLineupTwo) {
                        return { name: playerNameInLineupTwo, uuid: playerUuid };
                    }
                }
            } else {
                const playerNameInLineupOne = findPlayerName(game, 1, playerUuid);
                if (playerNameInLineupOne) {
                    return { name: playerNameInLineupOne, uuid: playerUuid };
                }
                const playerNameInLineupTwo = findPlayerName(game, 2, playerUuid);
                if (playerNameInLineupTwo) {
                    return { name: playerNameInLineupTwo, uuid: playerUuid };
                }
            }
        }
    }
    return { name: '', uuid: '' };
};

export const replaceUuidWithPlayerName = (detail: string, playerName: string, playerUuid: string): any => {
    return detail?.replace(`{${playerUuid}}`, playerName);
};

export const getSecondsFromGameClock = (gameClock: string): number => {
    if (!gameClock) return 0;
    const [minutes, seconds] = gameClock.split(':');
    return parseInt(minutes) * 60 + parseInt(seconds);
};

export const getActionFromPlay = (play: any): string => {
    if (play?.detail) {
        if (play?.detail?.toLowerCase()?.includes('start')) {
            return 'Start';
        } else if (play?.detail?.toLowerCase()?.includes('two')) {
            return '2PT';
        } else if (play?.detail?.toLowerCase()?.includes('three')) {
            return '3PT';
        } else if (play?.detail?.toLowerCase()?.includes('free')) {
            return 'FT';
        } else if (play?.detail?.toLowerCase()?.includes('rebound')) {
            if (play?.detail?.toLowerCase()?.includes('offensive')) return 'OREB';
            else {
                return 'DREB';
            }
        } else if (play?.detail?.toLowerCase()?.includes('assist')) {
            return 'AST';
        } else if (play?.detail?.toLowerCase()?.includes('steal')) {
            return 'STL';
        } else if (play?.detail?.toLowerCase()?.includes('block')) {
            return 'BLK';
        } else if (play?.detail?.toLowerCase()?.includes('turnover')) {
            return 'TO';
        } else if (play?.detail?.toLowerCase()?.includes('foul')) {
            return 'FOUL';
        }
    }
    return '';
};

export const getActionTypeFromPlay = (play: any): string => {
    if (play?.detail) {
        if (play?.detail?.toLowerCase()?.includes('made')) {
            return 'made';
        } else if (play?.detail?.toLowerCase()?.includes('missed')) {
            return 'missed';
        } else if (play?.detail?.toLowerCase()?.includes('rebound')) {
            return 'rebound';
        } else if (play?.detail?.toLowerCase()?.includes('assist')) {
            return 'assist';
        } else if (play?.detail?.toLowerCase()?.includes('steal')) {
            return 'steal';
        } else if (play?.detail?.toLowerCase()?.includes('block')) {
            return 'block';
        } else if (play?.detail?.toLowerCase()?.includes('turnover')) {
            return 'turnover';
        } else if (play?.detail?.toLowerCase()?.includes('foul')) {
            return 'foul';
        }
    }
    return '';
};

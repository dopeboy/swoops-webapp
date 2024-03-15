import classNames from 'classnames';
import { ReactElement, useEffect, useState } from 'react';
import { User } from 'src/lib/api';
import { EmptyRosterPlayer, getSortedPositions, getUserDetail } from 'src/lib/utils';
import { SortableHeader } from 'src/models/sortable-header';
import { PlayerSelectTableHeader } from '../gamelobby/PlayerSelectTableHeader';
import { SortDirection } from 'src/models/sort-direction.enum';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { PlayerBoxScore } from 'src/models/player-box-score';
import { useRouter } from 'next/router';
import { PlayerSlideOver } from '../common/PlayerSlideOver';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { PlayByPlayBoxScore } from 'src/hooks/usePlayByPlay';
import { getSecondsFromGameClock } from 'src/lib/playByPlayUtils';

interface TeamTableProps {
    availablePlayers: PlayByPlayBoxScore[];
    teamId: number;
    shouldAnimate: boolean;
    teamName: string;
    className?: string;
    gameClock?: string;
    hidePlayerHeader?: boolean;
    hideHeader?: boolean;
    addDecimalPlaces?: boolean;
    selectPlayer?: () => void;
    tutorialMode?: boolean;
    stopTour?: () => void;
}

const TeamTable: React.FC<TeamTableProps> = ({
    availablePlayers,
    teamId,
    shouldAnimate,
    gameClock,
    hideHeader,
    teamName,
    hidePlayerHeader,
    className,
    addDecimalPlaces = false,
    selectPlayer,
    tutorialMode,
    stopTour,
}): ReactElement => {
    const router = useRouter();
    const [headers, setHeaders] = useState([
        { title: 'Player', value: 'name', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'pts', value: 'pts', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'drb', value: 'drb', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'orb', value: 'orb', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'trb', value: 'trb', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'ast', value: 'ast', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'stl', value: 'stl', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'blk', value: 'blk', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'to', value: 'tov', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'pf', value: 'pf', sortDirection: SortDirection.NONE, sortable: true },
        { title: addDecimalPlaces ? 'fg%' : 'fg', value: 'fg', sortDirection: SortDirection.NONE, sortable: true },
        { title: addDecimalPlaces ? '3pt%' : '3pt', value: 'three_p', sortDirection: SortDirection.NONE, sortable: true },
        { title: addDecimalPlaces ? 'ft%' : 'ft', value: 'ft', sortDirection: SortDirection.NONE, sortable: true },
    ]);
    const [slideOverOpen, setSlideOverOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<ReadonlyPlayer>(EmptyRosterPlayer);
    const [players, setPlayers] = useState<PlayByPlayBoxScore[]>(availablePlayers);
    const [user] = useState<User>(getUserDetail);

    const openSlideOver = (player: ReadonlyPlayer): void => {
        setSelectedPlayer(player);
        setSlideOverOpen(true);
        selectPlayer();
    };

    const goToPlayerDetail = (playerId: number): void => {
        router.push({
            pathname: `/player-detail/${playerId}/current`,
            query: tutorialMode ? { onboarding: 'true' } : {},
        });
        if (tutorialMode) {
            stopTour();
        }
    };

    const sortMadeVsAttempted = (
        madeStat: string,
        attemptedStat: string,
        sortDirection: SortDirection
    ): { player: ReadonlyPlayer; boxScore: PlayerBoxScore }[] => {
        switch (sortDirection) {
            case SortDirection.ASC:
                return players.sort((a, b) => {
                    if (a.boxScore[attemptedStat] === 0 && b.boxScore[attemptedStat] === 0) {
                        return 0;
                    }
                    if (a.boxScore[madeStat] > b.boxScore[madeStat]) {
                        return 1;
                    }
                    if (a.boxScore[madeStat] < b.boxScore[madeStat]) {
                        return -1;
                    }
                    if (a.boxScore[madeStat] === b.boxScore[madeStat]) {
                        if (a.boxScore[attemptedStat] > b.boxScore[attemptedStat]) {
                            return -1;
                        }
                        if (a.boxScore[attemptedStat] < b.boxScore[attemptedStat]) {
                            return 1;
                        }
                    }
                    return 0;
                });
            case SortDirection.DESC:
                return players.sort((a, b) => {
                    if (a.boxScore[attemptedStat] === 0 && b.boxScore[attemptedStat] === 0) {
                        return 0;
                    }
                    if (a.boxScore[madeStat] > b.boxScore[madeStat]) {
                        return -1;
                    }
                    if (a.boxScore[madeStat] < b.boxScore[madeStat]) {
                        return 1;
                    }
                    if (a.boxScore[madeStat] === b.boxScore[madeStat]) {
                        if (a.boxScore[attemptedStat] > b.boxScore[attemptedStat]) {
                            return 1;
                        }
                        if (a.boxScore[attemptedStat] < b.boxScore[attemptedStat]) {
                            return -1;
                        }
                    }
                    return 0;
                });
            default:
                return players;
        }
    };

    const updateSortDirection = (columnToSort: SortableHeader): void => {
        const newHeaders = headers.map((header) => {
            if (header.value === columnToSort.value) {
                if (header.sortDirection === SortDirection.NONE) {
                    header.sortDirection = SortDirection.DESC;
                    if (header.value === 'name') {
                        setPlayers(
                            players.sort((a, b) => (a.player.full_name?.toLowerCase()?.localeCompare(b.player.full_name?.toLowerCase()) ? 1 : -1))
                        );
                    } else if (header.value === 'fg') {
                        setPlayers(sortMadeVsAttempted('fg', 'fga', header.sortDirection));
                    } else if (header.value === 'three_p') {
                        setPlayers(sortMadeVsAttempted('three_p', 'three_pa', header.sortDirection));
                    } else if (header.value === 'ft') {
                        setPlayers(sortMadeVsAttempted('ft', 'fta', header.sortDirection));
                    } else {
                        setPlayers(players.sort((a, b) => (Number(b.boxScore[header.value] || 0) > Number(a.boxScore[header.value] || 0) ? 1 : -1)));
                    }
                } else if (header.sortDirection === SortDirection.DESC) {
                    header.sortDirection = SortDirection.ASC;
                    if (header.value === 'name') {
                        setPlayers(
                            players.sort((a, b) => (a.player.full_name?.toLowerCase()?.localeCompare(b.player.full_name?.toLowerCase()) ? -1 : 1))
                        );
                    } else if (header.value === 'fg') {
                        setPlayers(sortMadeVsAttempted('fg', 'fga', header.sortDirection));
                    } else if (header.value === 'three_p') {
                        setPlayers(sortMadeVsAttempted('three_p', 'three_pa', header.sortDirection));
                    } else if (header.value === 'ft') {
                        setPlayers(sortMadeVsAttempted('ft', 'fta', header.sortDirection));
                    } else {
                        setPlayers(players.sort((a, b) => (Number(a.boxScore[header.value] || 0) > Number(b.boxScore[header.value] || 0) ? 1 : -1)));
                    }
                } else {
                    header.sortDirection = SortDirection.NONE;
                    setPlayers(availablePlayers);
                }
            } else {
                header.sortDirection = SortDirection.NONE;
                setPlayers(availablePlayers);
            }
            return header;
        });
        setHeaders(newHeaders);
    };

    const getTeamBoxScoreSum = (stat: string): string => {
        const statSum = players?.reduce((accumulator, { boxScore }) => {
            if (boxScore && boxScore[stat]) {
                return accumulator + boxScore[stat];
            }
            return accumulator;
        }, 0);
        return statSum ? Number(statSum)?.toFixed(addDecimalPlaces ? 1 : 0) : '0';
    };

    const getTeamBoxScoreSumPercentage = (stat: string, secondStat: string): string => {
        const getTeamBoxScoreSum = (stat: string): number => {
            const statSum = players?.reduce((accumulator, { boxScore }) => {
                if (boxScore && boxScore[stat]) {
                    return accumulator + boxScore[stat];
                }
                return accumulator;
            }, 0);
            return statSum || 0;
        };

        const statSum = getTeamBoxScoreSum(stat);
        const secondStatSum = getTeamBoxScoreSum(secondStat);

        if (secondStatSum === 0) {
            return '0%';
        }

        const percentage = (statSum / secondStatSum) * 100;
        return percentage.toFixed(percentage === 100 ? 0 : 1) + '%';
    };

    useEffect(() => {
        setPlayers(availablePlayers);
    }, [availablePlayers]);

    return (
        <div className={classNames('hidden sm:flex flex-col w-full divide-y divide-white/16 border-white/16', className)}>
            {!hideHeader && teamId && (
                <div className="w-full flex flex-row items-center justify-start overflow-auto bg-off-black/32 pt-3 pb-2 px-4 subheading-two text-white">
                    <span className="w-fit">
                        <a href={`/locker-room/${teamId}`} target="_blank">
                            {teamName}
                        </a>
                    </span>
                </div>
            )}
            {!hideHeader && !teamId && (
                <div className="w-full overflow-auto cursor-pointer bg-off-black/32 pt-3 pb-2 px-4 subheading-two text-white">
                    Waiting for opponent
                </div>
            )}
            <table className="divide-y divide-white/16 table-auto overflow-x-auto overflow-y-hidden w-full h-full block">
                {!hidePlayerHeader && (
                    <thead className="w-full">
                        <PlayerSelectTableHeader headers={headers} updateSortDirection={updateSortDirection} />
                    </thead>
                )}
                <tbody className="w-full divide-y-1 divide-white/16" data-tut="player-detail-views">
                    {players?.map(({ player, boxScore, changedStats }) => (
                        <tr
                            className="relative w-full h-10 hover:cursor-pointer hover:bg-off-black/40"
                            key={player.id + player.full_name}
                            onClick={() => openSlideOver(player)}
                        >
                            <td className="px-2 pt-2">
                                <a className="flex items-center">
                                    <div className="flex flex-row items-center justify-start w-56 gap-2 ml-4 top-1/3 pb-2">
                                        <div className="flex flex-col items-start">
                                            <PlayerAvatar
                                                playerToken={player?.token}
                                                width={256}
                                                height={256}
                                                className={'absolute -left-8 top-[5px] w-28 h-28 clip-player-front-image transform -scale-x-100'}
                                            />
                                            <div className="ml-10 text-[12px] flex-wrap detail-one text-left uppercase whitespace-nowrap text-display text-white font-semibold">
                                                {player?.full_name ?? ''}
                                            </div>
                                            <div className="ml-10 flex flex-row items-center gap-2">
                                                {player?.team && user?.team?.id
                                                    ? player.team === user.team.id && <img className="h-5 w-5" src="/images/WhiteShield.svg" />
                                                    : ''}
                                                <div className="flex flex-row gap-1 items-center justify-center text-[14px] text-display text-gray-400">
                                                    {getSortedPositions(player.positions).map((position: string, index: number) => (
                                                        <div key={position + index}>
                                                            {position && (
                                                                <span>
                                                                    <span className="font-semibold capitalize">{position}</span>
                                                                    {index !== player.positions.length - 1 ? ' /' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </td>
                            <td
                                className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                    'bg-white/16': changedStats && changedStats?.pts && shouldAnimate,
                                    'bg-transparent': !changedStats || !changedStats?.pts || !shouldAnimate,
                                })}
                            >
                                <span
                                    className={classNames('transition-all duration-200 ease-in-out', {
                                        'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                            changedStats && changedStats?.pts && shouldAnimate,
                                        'bg-assist-green/80':
                                            changedStats && changedStats?.pts && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                        'bg-yellow-400 border-2 border-white':
                                            changedStats && changedStats?.pts && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                        'bg-transparent': !changedStats || !changedStats?.pts || !shouldAnimate,
                                    })}
                                >
                                    {boxScore?.pts
                                        ? addDecimalPlaces
                                            ? Number(boxScore?.pts)?.toFixed(1)
                                            : Number(boxScore?.pts)?.toFixed(addDecimalPlaces ? 1 : 0)
                                        : '0'}
                                </span>
                            </td>
                            <td
                                className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                    'bg-white/16': changedStats && changedStats?.drb && shouldAnimate,
                                    'bg-transparent': !changedStats || !changedStats?.drb || !shouldAnimate,
                                })}
                            >
                                <span
                                    className={classNames('transition-all duration-200 ease-in-out', {
                                        'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                            changedStats && changedStats?.drb && shouldAnimate,
                                        'bg-assist-green/80':
                                            changedStats && changedStats?.drb && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                        'bg-yellow-400 border-2 border-white':
                                            changedStats && changedStats?.drb && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                        'bg-transparent': !changedStats || !changedStats?.drb || !shouldAnimate,
                                    })}
                                >
                                    {boxScore?.drb ? Number(boxScore?.drb)?.toFixed(addDecimalPlaces ? 1 : 0) : '0'}
                                </span>
                            </td>
                            <td
                                className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                    'bg-white/16': changedStats && changedStats?.orb && shouldAnimate,
                                    'bg-transparent': !changedStats || !changedStats?.orb || !shouldAnimate,
                                })}
                            >
                                <span
                                    className={classNames('transition-all duration-200 ease-in-out', {
                                        'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                            changedStats && changedStats?.orb && shouldAnimate,
                                        'bg-assist-green/80':
                                            changedStats && changedStats?.orb && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                        'bg-yellow-400 border-2 border-white':
                                            changedStats && changedStats?.orb && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                        'bg-transparent': !changedStats || !changedStats?.orb || !shouldAnimate,
                                    })}
                                >
                                    {boxScore?.orb ? Number(boxScore?.orb)?.toFixed(addDecimalPlaces ? 1 : 0) : '0'}
                                </span>
                            </td>
                            <td
                                className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                    'bg-white/16': changedStats && changedStats?.trb && shouldAnimate,
                                    'bg-transparent': !changedStats || !changedStats?.trb || !shouldAnimate,
                                })}
                            >
                                <span
                                    className={classNames('transition-all duration-200 ease-in-out', {
                                        'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                            changedStats && changedStats?.trb && shouldAnimate,
                                        'bg-assist-green/80':
                                            changedStats && changedStats?.trb && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                        'bg-yellow-400 border-2 border-white':
                                            changedStats && changedStats?.trb && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                        'bg-transparent': !changedStats || !changedStats?.trb || !shouldAnimate,
                                    })}
                                >
                                    {boxScore?.trb ? Number(boxScore?.trb)?.toFixed(addDecimalPlaces ? 1 : 0) : '0'}
                                </span>
                            </td>
                            <td
                                className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                    'bg-white/16': changedStats && changedStats?.ast && shouldAnimate,
                                    'bg-transparent': !changedStats || !changedStats?.ast || !shouldAnimate,
                                })}
                            >
                                <span
                                    className={classNames('transition-all duration-200 ease-in-out', {
                                        'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                            changedStats && changedStats?.ast && shouldAnimate,
                                        'bg-assist-green/80':
                                            changedStats && changedStats?.ast && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                        'bg-yellow-400 border-2 border-white':
                                            changedStats && changedStats?.ast && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                        'bg-transparent': !changedStats || !changedStats?.ast || !shouldAnimate,
                                    })}
                                >
                                    {boxScore?.ast
                                        ? addDecimalPlaces
                                            ? Number(boxScore?.ast)?.toFixed(1)
                                            : Number(boxScore?.ast)?.toFixed(addDecimalPlaces ? 1 : 0)
                                        : '0'}
                                </span>
                            </td>
                            <td
                                className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                    'bg-white/16': changedStats && changedStats?.stl && shouldAnimate,
                                    'bg-transparent': !changedStats || !changedStats?.stl || !shouldAnimate,
                                })}
                            >
                                <span
                                    className={classNames('transition-all duration-200 ease-in-out', {
                                        'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                            changedStats && changedStats?.stl && shouldAnimate,
                                        'bg-assist-green/80':
                                            changedStats && changedStats?.stl && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                        'bg-yellow-400 border-2 border-white':
                                            changedStats && changedStats?.stl && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                        'bg-transparent': !changedStats || !changedStats?.stl || !shouldAnimate,
                                    })}
                                >
                                    {boxScore?.stl
                                        ? addDecimalPlaces
                                            ? Number(boxScore?.stl)?.toFixed(1)
                                            : Number(boxScore?.stl)?.toFixed(addDecimalPlaces ? 1 : 0)
                                        : '0'}
                                </span>
                            </td>
                            <td
                                className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                    'bg-white/16': changedStats && changedStats?.blk && shouldAnimate,
                                    'bg-transparent': !changedStats || !changedStats?.blk || !shouldAnimate,
                                })}
                            >
                                <span
                                    className={classNames('transition-all duration-200 ease-in-out', {
                                        'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                            changedStats && changedStats?.blk && shouldAnimate,
                                        'bg-assist-green/80':
                                            changedStats && changedStats?.blk && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                        'bg-yellow-400 border-2 border-white':
                                            changedStats && changedStats?.blk && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                        'bg-transparent': !changedStats || !changedStats?.blk || !shouldAnimate,
                                    })}
                                >
                                    {boxScore?.blk
                                        ? addDecimalPlaces
                                            ? Number(boxScore?.blk)?.toFixed(1)
                                            : Number(boxScore?.blk)?.toFixed(addDecimalPlaces ? 1 : 0)
                                        : '0'}
                                </span>
                            </td>
                            <td
                                className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                    'bg-white/16': changedStats && changedStats?.tov && shouldAnimate,
                                    'bg-transparent': !changedStats || !changedStats?.tov || !shouldAnimate,
                                })}
                            >
                                <span
                                    className={classNames('transition-all duration-200 ease-in-out', {
                                        'bg-defeat-red rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                            changedStats && changedStats?.tov && shouldAnimate,
                                        'bg-transparent': !changedStats || !changedStats?.tov || !shouldAnimate,
                                    })}
                                >
                                    {boxScore?.tov
                                        ? addDecimalPlaces
                                            ? Number(boxScore?.tov)?.toFixed(1)
                                            : Number(boxScore?.tov)?.toFixed(addDecimalPlaces ? 1 : 0)
                                        : '0'}
                                </span>
                            </td>
                            <td
                                className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                    'bg-white/16': changedStats && changedStats?.pf && shouldAnimate,
                                    'bg-transparent': !changedStats || !changedStats?.pf || !shouldAnimate,
                                })}
                            >
                                <span
                                    className={classNames('transition-all duration-200 ease-in-out', {
                                        'bg-defeat-red rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                            changedStats && changedStats?.pf && shouldAnimate,
                                        'bg-transparent': !changedStats || !changedStats?.pf || !shouldAnimate,
                                    })}
                                >
                                    {boxScore?.pf
                                        ? addDecimalPlaces
                                            ? Number(boxScore?.pf)?.toFixed(1)
                                            : Number(boxScore?.pf)?.toFixed(addDecimalPlaces ? 1 : 0)
                                        : '0'}
                                </span>
                            </td>
                            {!addDecimalPlaces && (
                                <td
                                    className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                        'bg-white/16': changedStats && changedStats?.fg && shouldAnimate,
                                        'bg-transparent': !changedStats || !changedStats?.fg || !shouldAnimate,
                                    })}
                                >
                                    <span
                                        className={classNames('transition-all duration-200 ease-in-out', {
                                            'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                                changedStats && changedStats?.fg && shouldAnimate,
                                            'bg-assist-green/80':
                                                changedStats && changedStats?.fg && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                            'bg-yellow-400 border-2 border-white':
                                                changedStats && changedStats?.fg && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                            'bg-transparent': !changedStats || !changedStats?.fg || !shouldAnimate,
                                        })}
                                    >
                                        {boxScore?.fg
                                            ? addDecimalPlaces
                                                ? Number(boxScore?.fg)?.toFixed(1)
                                                : Number(boxScore?.fg)?.toFixed(addDecimalPlaces ? 1 : 0)
                                            : '0'}
                                    </span>
                                    /
                                    <span
                                        className={classNames('transition-all duration-200 ease-in-out', {
                                            'bg-defeat-red text-white rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                                changedStats && changedStats?.fga && !changedStats?.fg && shouldAnimate,
                                            'bg-transparent': !changedStats || !changedStats?.fga || changedStats?.fg || !shouldAnimate,
                                        })}
                                    >
                                        {boxScore?.fga
                                            ? addDecimalPlaces
                                                ? Number(boxScore?.fga)?.toFixed(1)
                                                : Number(boxScore?.fga)?.toFixed(addDecimalPlaces ? 1 : 0)
                                            : '0'}
                                    </span>
                                </td>
                            )}
                            {addDecimalPlaces && (
                                <td
                                    className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                        'bg-white/16': changedStats && changedStats?.fg && shouldAnimate,
                                        'bg-transparent': !changedStats || !changedStats?.fg || !shouldAnimate,
                                    })}
                                >
                                    <span
                                        className={classNames('transition-all duration-200 ease-in-out', {
                                            'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                                changedStats && changedStats?.fg && shouldAnimate,
                                            'bg-assist-green/80':
                                                changedStats && changedStats?.fg && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                            'bg-yellow-400 border-2 border-white':
                                                changedStats && changedStats?.fg && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                            'bg-transparent': !changedStats || !changedStats?.fg || !shouldAnimate,
                                        })}
                                    >
                                        {boxScore?.fg && boxScore?.fga
                                            ? `${((Number(boxScore?.fg) / Number(boxScore?.fga)) * 100)?.toFixed(
                                                  (Number(boxScore?.fg) / Number(boxScore?.fga)) * 100 === 100 ? 0 : 1
                                              )}%`
                                            : '0'}
                                    </span>
                                </td>
                            )}
                            {!addDecimalPlaces && (
                                <td
                                    className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                        'bg-white/16': changedStats && changedStats?.three_p && shouldAnimate,
                                        'bg-transparent': !changedStats || !changedStats?.three_p || !shouldAnimate,
                                    })}
                                >
                                    <span
                                        className={classNames('transition-all duration-200 ease-in-out', {
                                            'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                                changedStats && changedStats?.three_p && shouldAnimate,
                                            'bg-assist-green/80':
                                                changedStats && changedStats?.three_p && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                            'bg-yellow-400 border-2 border-white':
                                                changedStats && changedStats?.three_p && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                            'bg-transparent': !changedStats || !changedStats?.three_p || !shouldAnimate,
                                        })}
                                    >
                                        {boxScore?.three_p
                                            ? addDecimalPlaces
                                                ? Number(boxScore?.three_p)?.toFixed(1)
                                                : Number(boxScore?.three_p)?.toFixed(addDecimalPlaces ? 1 : 0)
                                            : '0'}
                                    </span>
                                    /
                                    <span
                                        className={classNames('transition-all duration-200 ease-in-out', {
                                            'bg-defeat-red text-white rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                                changedStats && changedStats?.three_pa && !changedStats?.three_p && shouldAnimate,
                                            'bg-transparent': !changedStats || !changedStats?.three_pa || changedStats?.three_p || !shouldAnimate,
                                        })}
                                    >
                                        {boxScore?.three_pa
                                            ? addDecimalPlaces
                                                ? Number(boxScore?.three_pa)?.toFixed(1)
                                                : Number(boxScore?.three_pa)?.toFixed(addDecimalPlaces ? 1 : 0)
                                            : '0'}
                                    </span>
                                </td>
                            )}
                            {addDecimalPlaces && (
                                <td
                                    className={classNames('py-2 subheading-two text-center text-white transition-all duration-75 ease-in-out', {
                                        'bg-white/16': changedStats && changedStats?.three_p && shouldAnimate,
                                        'bg-transparent': !changedStats || !changedStats?.three_p || !shouldAnimate,
                                    })}
                                >
                                    <span
                                        className={classNames('transition-all duration-200 ease-in-out', {
                                            'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                                changedStats && changedStats?.three_p && shouldAnimate,
                                            'bg-assist-green/80':
                                                changedStats && changedStats?.three_p && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                            'bg-yellow-400 border-2 border-white':
                                                changedStats && changedStats?.three_p && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                            'bg-transparent': !changedStats || !changedStats?.three_p || !shouldAnimate,
                                        })}
                                    >
                                        {boxScore?.three_p && boxScore?.three_pa
                                            ? `${((Number(boxScore?.three_p) / Number(boxScore?.three_pa)) * 100)?.toFixed(
                                                  (Number(boxScore?.three_p) / Number(boxScore?.three_pa)) * 100 === 100 ? 0 : 1
                                              )}%`
                                            : '0'}
                                    </span>
                                </td>
                            )}
                            {!addDecimalPlaces && (
                                <td className={classNames('transition-all duration-150 ease-in-out py-2 subheading-two text-center text-white')}>
                                    <span
                                        className={classNames('transition-all duration-150 ease-in-out', {
                                            'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                                changedStats && changedStats?.ft && shouldAnimate,
                                            'bg-assist-green/80':
                                                changedStats && changedStats?.ft && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                            'bg-yellow-400 border-2 border-white':
                                                changedStats && changedStats?.ft && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                            'bg-transparent': !changedStats || !changedStats?.ft || !shouldAnimate,
                                        })}
                                    >
                                        {boxScore?.ft
                                            ? addDecimalPlaces
                                                ? Number(boxScore?.ft)?.toFixed(1)
                                                : Number(boxScore?.ft)?.toFixed(addDecimalPlaces ? 1 : 0)
                                            : '0'}
                                    </span>
                                    /
                                    <span
                                        className={classNames('transition-all duration-200 ease-in-out', {
                                            'bg-defeat-red text-white rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                                changedStats && changedStats?.fta && !changedStats?.ft && shouldAnimate,
                                            'bg-transparent': !changedStats || !changedStats?.fta || changedStats?.ft || !shouldAnimate,
                                        })}
                                    >
                                        {boxScore?.fta
                                            ? addDecimalPlaces
                                                ? Number(boxScore?.fta)?.toFixed(1)
                                                : Number(boxScore?.fta)?.toFixed(addDecimalPlaces ? 1 : 0)
                                            : '0'}
                                    </span>
                                </td>
                            )}
                            {addDecimalPlaces && (
                                <td className={classNames('transition-all duration-150 ease-in-out py-2 subheading-two text-center text-white')}>
                                    <span
                                        className={classNames('transition-all duration-150 ease-in-out', {
                                            'text-black rounded-full px-4 pt-2.5 pb-2 -translate-y-1 scale-125':
                                                changedStats && changedStats?.ft && shouldAnimate,
                                            'bg-assist-green/80':
                                                changedStats && changedStats?.ft && shouldAnimate && getSecondsFromGameClock(gameClock) > 24,
                                            'bg-yellow-400 border-2 border-white':
                                                changedStats && changedStats?.ft && shouldAnimate && getSecondsFromGameClock(gameClock) <= 24,
                                            'bg-transparent': !changedStats || !changedStats?.ft || !shouldAnimate,
                                        })}
                                    >
                                        {boxScore?.ft && boxScore?.fta
                                            ? `${((Number(boxScore?.ft) / Number(boxScore?.fta)) * 100)?.toFixed(
                                                  (Number(boxScore?.ft) / Number(boxScore?.fta)) * 100 === 100 ? 0 : 1
                                              )}%`
                                            : '0'}
                                    </span>
                                </td>
                            )}
                        </tr>
                    ))}
                    <tr className="relative h-10 hover:cursor-pointer hover:bg-off-black/40">
                        <td className="px-2 pt-4">
                            <a className="flex items-center">
                                <div className="flex flex-row items-center justify-start w-48 gap-2 ml-4 pl-[72px] top-1/3 pb-4">
                                    <div className="flex flex-col items-start">
                                        <div className="text-[12px] flex-wrap detail-one uppercase whitespace-nowrap text-center text-display text-white font-semibold">
                                            Team
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </td>
                        <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSum('pts')}</td>
                        <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSum('drb')}</td>
                        <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSum('orb')}</td>
                        <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSum('trb')}</td>
                        <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSum('ast')}</td>
                        <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSum('stl')}</td>
                        <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSum('blk')}</td>
                        <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSum('tov')}</td>
                        <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSum('pf')}</td>
                        {!addDecimalPlaces && (
                            <td className="py-2 subheading-two text-center text-white">
                                {getTeamBoxScoreSum('fg')}/{getTeamBoxScoreSum('fga')}
                            </td>
                        )}
                        {addDecimalPlaces && (
                            <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSumPercentage('fg', 'fga')}</td>
                        )}
                        {!addDecimalPlaces && (
                            <td className="py-2 subheading-two text-center text-white">
                                {getTeamBoxScoreSum('three_p')}/{getTeamBoxScoreSum('three_pa')}
                            </td>
                        )}
                        {addDecimalPlaces && (
                            <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSumPercentage('three_p', 'three_pa')}</td>
                        )}
                        {!addDecimalPlaces && (
                            <td className="py-2 subheading-two text-center text-white">
                                {getTeamBoxScoreSum('ft')}/{getTeamBoxScoreSum('fta')}
                            </td>
                        )}
                        {addDecimalPlaces && (
                            <td className="py-2 subheading-two text-center text-white">{getTeamBoxScoreSumPercentage('ft', 'fta')}</td>
                        )}
                    </tr>
                </tbody>
            </table>
            <PlayerSlideOver
                onClick={(player) => goToPlayerDetail(player?.token)}
                actionText="View Detail"
                setOpen={setSlideOverOpen}
                open={slideOverOpen}
                selectedPlayer={selectedPlayer}
            />
        </div>
    );
};

export default TeamTable;

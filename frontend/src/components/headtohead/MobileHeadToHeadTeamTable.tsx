import classNames from 'classnames';
import { ReactElement, useEffect, useState } from 'react';
import { User } from 'src/lib/api';
import { displayPlayerBoxScoreStat, EmptyRosterPlayer, getSortedPositions, getUserDetail, isUserLoggedIn } from 'src/lib/utils';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { PlayerBoxScore } from 'src/models/player-box-score';
import { useRouter } from 'next/router';
import { PlayerSlideOver } from '../common/PlayerSlideOver';
import { ArrowDownIcon, ArrowUpIcon, ArrowsUpDownIcon, ChevronDownIcon, ChevronRightIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { playerBoxScoreStatGrid } from 'src/lib/constants';
import { SortDirection } from 'src/models/sort-direction.enum';
import { NoPlayersFoundPlaceholder } from '../common/NoPlayersFoundPlaceholder';
import { PlayerStat } from '../common/PlayerStat';
import { StarRating } from '../common/StarRating';
import { CollapsiblePlayer } from '../lockerRoom/MobileRosterTable';
import { SortableHeader } from 'src/models/sortable-header';

const primarySortingStats = ['name', 'pts'];

interface MobileHeadToHeadTeamTableProps {
    availablePlayers: { player: CollapsiblePlayer; boxScore: PlayerBoxScore }[];
    teamId: number;
    teamName: string;
    className?: string;
    hideTeamStats?: boolean;
    hidePlayerHeader?: boolean;
    tutorialMode?: boolean;
    stopTour?: () => void;
    selectPlayer?: () => void;
    slideOver?: () => void;
}

const MobileHeadToHeadTeamTable: React.FC<MobileHeadToHeadTeamTableProps> = ({
    availablePlayers,
    hideTeamStats,
    teamId,
    teamName,
    className,
    stopTour,
    tutorialMode,
    selectPlayer,
    slideOver,
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
        { title: 'fg', value: 'fg', sortDirection: SortDirection.NONE, sortable: true },
        { title: '3pt', value: 'three_p', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'ft', value: 'ft', sortDirection: SortDirection.NONE, sortable: true },
    ]);
    const [slideOverOpen, setSlideOverOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<CollapsiblePlayer>(EmptyRosterPlayer);
    const [showAdditionalFilters, setShowAdditionalFilters] = useState<boolean>(false);
    const [displayTeamStats, setDisplayTeamStats] = useState<boolean>(false);
    const [players, setPlayers] = useState<{ player: CollapsiblePlayer; boxScore: PlayerBoxScore }[]>(availablePlayers);
    const [user] = useState<User>(getUserDetail);

    const openSlideOver = (player: CollapsiblePlayer): void => {
        slideOver();
        setSelectedPlayer(player);
        setSlideOverOpen(true);
    };

    const sortMadeVsAttempted = (
        madeStat: string,
        attemptedStat: string,
        sortDirection: SortDirection
    ): { player: CollapsiblePlayer; boxScore: PlayerBoxScore }[] => {
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

    const getTeamStat = (stat: string): string => {
        if (stat === 'fg') {
            return `${getTeamBoxScoreSum(stat)}/${getTeamBoxScoreSum('fga')}`;
        } else if (stat === 'three_p') {
            return `${getTeamBoxScoreSum(stat)}/${getTeamBoxScoreSum('three_pa')}`;
        } else if (stat === 'ft') {
            return `${getTeamBoxScoreSum(stat)}/${getTeamBoxScoreSum('fta')}`;
        } else {
            return getTeamBoxScoreSum(stat);
        }
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

    const collapsePlayer = (player: CollapsiblePlayer) => (): void => {
        if (selectPlayer) selectPlayer();
        setPlayers((prevPlayers: { player: CollapsiblePlayer; boxScore: PlayerBoxScore }[]) => {
            return prevPlayers.map((prevPlayer) => {
                if (prevPlayer.player.id === player.id) {
                    return { ...prevPlayer, player: { ...prevPlayer.player, shouldDisplayStats: !prevPlayer.player.shouldDisplayStats } };
                }
                return prevPlayer;
            });
        });
    };

    const userIsOwner = (): boolean => {
        return isUserLoggedIn() && getUserDetail()?.team?.id && getUserDetail()?.team?.id === teamId;
    };

    const getTeamBoxScoreSum = (stat: string): string => {
        const statSum = players?.reduce((accumulator, { boxScore }) => {
            if (boxScore[stat]) {
                return accumulator + boxScore[stat];
            }
            return accumulator;
        }, 0);
        return statSum ? Math.round(Number(statSum))?.toFixed(0) : '0';
    };

    useEffect(() => {
        if ((!players || !players?.length) && availablePlayers?.length > 0) {
            setPlayers(availablePlayers);
            return;
        }
        const updatedPlayers = players?.map(({ player }) => {
            return {
                player,
                boxScore: availablePlayers?.find((bScore) => player.uuid === bScore.player.uuid)?.boxScore,
            };
        });
        setPlayers(updatedPlayers);
    }, [availablePlayers]);

    return (
        <div className={classNames('sm:hidden w-full divide-y divide-white/16 border-white/16', className)}>
            {teamId && (
                <div className="w-full flex flex-row items-center justify-start overflow-x-visible bg-off-black/32 pt-3 pb-2 px-4 subheading-two text-white">
                    <span className="w-fit">
                        <a href={`/locker-room/${teamId}`} target="_blank">
                            {teamName}
                        </a>
                    </span>
                </div>
            )}
            {!teamId && (
                <div className="w-full overflow-x-visible cursor-pointer bg-off-black/32 pt-3 pb-2 px-4 subheading-two text-white">
                    Waiting for opponent
                </div>
            )}
            <div className="sm:hidden flex flex-col w-full bg-black pb-2">
                {headers && (
                    <div className="flex flex-row items-center justify-start gap-2 pt-3 pl-2">
                        {headers
                            ?.filter((header) => primarySortingStats.includes(header.value))
                            .map((header) => (
                                <div
                                    key={header.value}
                                    onClick={() => updateSortDirection && updateSortDirection(header)}
                                    className={classNames(
                                        'flex flex-row items-center justify-between w-fit px-4 py-2 cursor-pointer rounded-xl border border-off-black',
                                        {
                                            'bg-off-black': header.sortDirection !== SortDirection.NONE,
                                        }
                                    )}
                                >
                                    <div className="text-white text-base uppercase">{header.title}</div>
                                    <div className="flex flex-row items-center">
                                        <div className="ml-2">
                                            {header.sortDirection === SortDirection.DESC && (
                                                <ArrowDownIcon className="h-3 w-3 text-white border-white" strokeWidth={3} />
                                            )}
                                            {header.sortDirection === SortDirection.ASC && (
                                                <ArrowUpIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                            )}
                                            {header.sortDirection === SortDirection.NONE && (
                                                <ArrowsUpDownIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        <button
                            onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
                            className={classNames(
                                'flex flex-row items-center justify-between w-fit px-4 py-2 cursor-pointer rounded-xl border border-off-black',
                                {
                                    'bg-off-black': showAdditionalFilters,
                                }
                            )}
                        >
                            <div className="text-white text-base uppercase">Filters</div>
                            <div className="flex flex-row items-center">
                                <div className="ml-2">
                                    {showAdditionalFilters ? (
                                        <ChevronDownIcon className="h-3 w-3 text-white" />
                                    ) : (
                                        <ChevronRightIcon className="h-3 w-3 text-white" />
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>
                )}
                {headers && showAdditionalFilters && (
                    <div className="grid grid-cols-4 items-center gap-2 pt-2 px-2">
                        {headers
                            ?.filter((header) => !primarySortingStats.includes(header.value))
                            .map((header) => (
                                <div
                                    key={header.value}
                                    onClick={() => updateSortDirection && updateSortDirection(header)}
                                    className={classNames(
                                        'flex flex-row items-center justify-between w-full  py-2 cursor-pointer rounded-xl border border-off-black',
                                        {
                                            'bg-off-black': header.sortDirection !== SortDirection.NONE,
                                            'px-4': header.value !== 'three_p' && header.value !== 'ft',
                                            'pl-3 pr-2': header.value === 'three_p' || header.value === 'ft',
                                        }
                                    )}
                                >
                                    <div
                                        className={classNames('text-white uppercase', {
                                            'text-base': header.value !== 'three_p' && header.value !== 'ft',
                                            'text-sm': header.value === 'three_p' || header.value === 'ft',
                                        })}
                                    >
                                        {header.title}
                                    </div>
                                    <div className="flex flex-row items-center">
                                        <div className="ml-2">
                                            {header.sortDirection === SortDirection.DESC && (
                                                <ArrowDownIcon className="h-3 w-3 text-white border-white" strokeWidth={3} />
                                            )}
                                            {header.sortDirection === SortDirection.ASC && (
                                                <ArrowUpIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                            )}
                                            {header.sortDirection === SortDirection.NONE && (
                                                <ArrowsUpDownIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
                {players && players.length > 0 && (
                    <div className="mt-2">
                        {players.map(({ player, boxScore }) => (
                            <div key={player.id} className="relative flex flex-col px-2 items-center justify-center w-full">
                                <div
                                    onClick={collapsePlayer(player)}
                                    className="relative flex flex-row h-16 items-center w-full bg-black border-off-black border rounded-md py-1"
                                >
                                    <div className="whitespace-nowrap w-32">
                                        <div className="flex items-center">
                                            <PlayerAvatar
                                                playerToken={player?.token}
                                                height={160}
                                                width={160}
                                                className={'absolute top-[8px] -left-[35px] h-[120px] w-[120px] clip-player-front-image'}
                                            />
                                            <div className="relative">
                                                <div className="left-[60px] -top-5 absolute text-base text-display uppercase text-white font-semibold">
                                                    <div className="flex flex-col items-start gap-1" data-tut="player-detail-views">
                                                        {player?.full_name ?? ''}
                                                        <div className="flex flex-row items-center justify-start -mt-1.5 gap-2">
                                                            {player?.team && user?.team?.id
                                                                ? player.team === user.team.id && (
                                                                      <img className="h-4 w-4" src="/images/WhiteShield.svg" />
                                                                  )
                                                                : ''}
                                                            <div className="whitespace-nowrap capitalize font-semibold text-base text-center text-white">
                                                                <div className="whitespace-nowrap text-[12px] detail-one text-center text-white">
                                                                    <StarRating rating={player?.star_rating} size="h-3 w-3" />
                                                                </div>
                                                            </div>
                                                            <span className="subheading-two">-</span>
                                                            <div className="whitespace-nowrap capitalize font-semibold text-base text-center text-white">
                                                                <div className="flex flex-col items-start">
                                                                    <div className="w-full flex flex-row gap-1 items-center justify-center">
                                                                        {getSortedPositions(player?.positions || []).map(
                                                                            (position: string, index: number) => (
                                                                                <span key={position + index}>
                                                                                    {position}
                                                                                    {index !== player.positions.length - 1 ? ' /' : ''}
                                                                                </span>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-[190px] pr-4 mt-1.5 w-full flex flex-row items-center justify-between gap-2">
                                        <div className="whitespace-nowrap capitalize font-semibold text-base text-center text-white">
                                            <div className="flex flex-col items-center">
                                                <span className="subheading-three uppercase">PTS</span>
                                                <span className="subheading-three uppercase">{displayPlayerBoxScoreStat('pts', boxScore)}</span>
                                            </div>
                                        </div>
                                        <div className="whitespace-nowrap capitalize font-semibold text-base text-center text-white">
                                            <div className="flex flex-col items-center">
                                                <span className="subheading-three uppercase">FG</span>
                                                <span className="subheading-three uppercase">{displayPlayerBoxScoreStat('fg', boxScore)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {!player?.shouldDisplayStats && <ChevronDownIcon className="-mt-[7px] text-off-black h-4 w-4" />}
                                {player?.shouldDisplayStats && <ChevronUpIcon className="-mt-[2px] text-off-black h-4 w-4" />}
                                {player?.shouldDisplayStats && (
                                    <div className="grid grid-cols-3 w-full gap-1 mt-2 mb-3">
                                        {playerBoxScoreStatGrid.map((stat) => (
                                            <PlayerStat
                                                key={stat.title}
                                                statName={stat.title}
                                                statValue={displayPlayerBoxScoreStat(stat.value, boxScore)}
                                            />
                                        ))}
                                        <div className="col-span-3" data-tut="add-lineup-detail-previo">
                                            <button
                                                onClick={() => {
                                                    openSlideOver(player);
                                                    // selectPlayer();
                                                }}
                                                className="btn-rounded-white heading-three w-full"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {!hideTeamStats && (
                    <button
                        onClick={() => setDisplayTeamStats(!displayTeamStats)}
                        className="flex flex-row items-center gap-2 py-2 mt-2 justify-center w-full bg-off-black"
                    >
                        <span className="subheading-three text-white">View Team Stats</span>
                        {displayTeamStats ? (
                            <ChevronDownIcon className="h-4 w-4 text-white -mt-1" />
                        ) : (
                            <ChevronRightIcon className="h-4 w-4 text-white -mt-1" />
                        )}
                    </button>
                )}
                {!hideTeamStats && displayTeamStats && (
                    <div className="grid grid-cols-3 w-full gap-1 px-2 mt-2 mb-3">
                        {playerBoxScoreStatGrid.map((stat) => (
                            <PlayerStat key={stat.title} statName={stat.title} statValue={getTeamStat(stat.value)} />
                        ))}
                    </div>
                )}
                {!players || (players.length === 0 && <NoPlayersFoundPlaceholder isTeamOwner={userIsOwner()} />)}
            </div>
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

export default MobileHeadToHeadTeamTable;

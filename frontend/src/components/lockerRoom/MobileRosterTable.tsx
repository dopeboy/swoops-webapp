import { ArrowDownIcon, ArrowsUpDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronRightIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import React, { Dispatch, ReactElement, SetStateAction, useState } from 'react';
import { rosterTableStatGrid } from 'src/lib/constants';
import { displayPlayerStat, getSortedPositions, getUserDetail, isUserLoggedIn } from 'src/lib/utils';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { NoPlayersFoundPlaceholder } from '../common/NoPlayersFoundPlaceholder';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { PlayerStat } from '../common/PlayerStat';
import { StarRating } from '../common/StarRating';

const primarySortingStats = ['name', 'positions', 'ppg', 'wl'];
export interface CollapsiblePlayer extends ReadonlyPlayer {
    shouldDisplayStats: boolean;
}

interface MobileRosterTableProps {
    availablePlayers: CollapsiblePlayer[];
    setAvailablePlayers: Dispatch<SetStateAction<CollapsiblePlayer[]>>;
    teamId: number;
    tableHeaders: Array<SortableHeader>;
    updateSortDirection?: (columnToSort: SortableHeader) => void;
    loadingRequest?: boolean;
}

const MobileRosterTable: React.FC<MobileRosterTableProps> = ({
    teamId,
    availablePlayers,
    setAvailablePlayers,
    tableHeaders,
    updateSortDirection,
}): ReactElement => {
    const [showAdditionalFilters, setShowAdditionalFilters] = useState<boolean>(false);
    const userIsOwner = (): boolean => {
        return isUserLoggedIn() && getUserDetail()?.team?.id && getUserDetail()?.team?.id === teamId;
    };

    const collapsePlayer = (player: CollapsiblePlayer) => (): void => {
        setAvailablePlayers((prevPlayers: CollapsiblePlayer[]) => {
            return prevPlayers.map((prevPlayer) => {
                if (prevPlayer.id === player.id) {
                    return { ...prevPlayer, shouldDisplayStats: !prevPlayer.shouldDisplayStats } as CollapsiblePlayer;
                }
                return prevPlayer;
            });
        });
    };

    return (
        <div className="sm:hidden flex flex-col w-full bg-black pb-10">
            {tableHeaders && (
                <div className="flex flex-row items-center justify-start gap-2 pt-3 pl-2">
                    {tableHeaders
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
                                <div className="text-white text-base">{header.title}</div>
                                <div className="flex flex-row items-center">
                                    <div className="ml-2">
                                        {header.sortDirection === SortDirection.DESC && header.value !== 'rank' && (
                                            <ArrowDownIcon className="h-3 w-3 text-white border-white" strokeWidth={3} />
                                        )}
                                        {header.sortDirection === SortDirection.ASC && header.value !== 'rank' && (
                                            <ArrowUpIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                        )}
                                        {header.sortDirection === SortDirection.NONE && header.value !== 'rank' && (
                                            <ArrowsUpDownIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
            <button
                onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
                className="flex flex-row items-center gap-2 py-2 mt-2 justify-center w-full"
            >
                <span className="subheading-three text-white">More filters</span>
                {showAdditionalFilters ? (
                    <ChevronDownIcon className="h-4 w-4 text-white -mt-1" />
                ) : (
                    <ChevronRightIcon className="h-4 w-4 text-white -mt-1" />
                )}
            </button>
            {tableHeaders && showAdditionalFilters && (
                <div className="grid grid-cols-4 items-center gap-2 pt-2 px-2">
                    {tableHeaders
                        ?.filter((header) => !primarySortingStats.includes(header.value))
                        .map((header) => (
                            <div
                                key={header.value}
                                onClick={() => updateSortDirection && updateSortDirection(header)}
                                className={classNames(
                                    'flex flex-row items-center justify-between w-full px-4 py-2 cursor-pointer rounded-xl border border-off-black',
                                    {
                                        'bg-off-black': header.sortDirection !== SortDirection.NONE,
                                    }
                                )}
                            >
                                <div className="text-white text-base">{header.title}</div>
                                <div className="flex flex-row items-center">
                                    <div className="ml-2">
                                        {header.sortDirection === SortDirection.DESC && header.value !== 'rank' && (
                                            <ArrowDownIcon className="h-3 w-3 text-white border-white" strokeWidth={3} />
                                        )}
                                        {header.sortDirection === SortDirection.ASC && header.value !== 'rank' && (
                                            <ArrowUpIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                        )}
                                        {header.sortDirection === SortDirection.NONE && header.value !== 'rank' && (
                                            <ArrowsUpDownIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
            {availablePlayers && availablePlayers.length > 0 && (
                <div className="mt-2" data-tut="current-roster-view">
                    {availablePlayers.map((player) => (
                        <div key={player.id} className="relative flex flex-col px-2 my-1 items-center justify-center w-full">
                            <div
                                onClick={collapsePlayer(player)}
                                className="relative flex flex-row h-20 items-center w-full bg-black border-off-black border rounded-md py-3"
                            >
                                <div className="whitespace-nowrap w-32">
                                    <div className="flex items-center">
                                        <PlayerAvatar
                                            playerToken={player?.token}
                                            height={160}
                                            width={160}
                                            className={'absolute top-[6px] -left-[48px] h-40 w-40 clip-player-front-image'}
                                        />
                                        <div className="relative">
                                            <div className="left-[75px] -top-5 absolute text-base text-display text-gray-900 uppercase dark:text-white font-semibold">
                                                <div className="flex flex-col items-start gap-1">
                                                    {player?.full_name ?? ''}
                                                    <div className="flex flex-row items-center justify-start -mt-1.5 gap-2">
                                                        <div className="whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                                                            <div className="whitespace-nowrap text-[12px] detail-one text-center text-gray-500 dark:text-white">
                                                                <StarRating rating={player?.star_rating} size="h-3 w-3" />
                                                            </div>
                                                        </div>
                                                        <span className="subheading-two">-</span>
                                                        <div className="whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                                                            <div className="flex flex-col items-start">
                                                                <div className="w-full flex flex-row gap-1 items-center justify-center">
                                                                    {getSortedPositions(player.positions).map((position: string, index: number) => (
                                                                        <span key={position + index}>
                                                                            {position}
                                                                            {index !== player.positions.length - 1 ? ' /' : ''}
                                                                        </span>
                                                                    ))}
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
                                    <div className="whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                                        <div className="flex flex-col items-center">
                                            <span className="subheading-one uppercase">PTS</span>
                                            <span className="subheading-two uppercase">{displayPlayerStat('ppg', player)}</span>
                                        </div>
                                    </div>
                                    <div className="whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                                        <div className="flex flex-col items-center">
                                            <span className="subheading-one uppercase">W/L</span>
                                            <span className="subheading-two uppercase">{displayPlayerStat('wl', player)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {!player?.shouldDisplayStats && <ChevronDownIcon className="mt-0.5 text-off-black h-4 w-4" />}
                            {player?.shouldDisplayStats && <ChevronUpIcon className="mt-0.5 text-off-black h-4 w-4" />}
                            {player?.shouldDisplayStats && (
                                <div className="grid grid-cols-3 w-full gap-1 mt-2 mb-3">
                                    {rosterTableStatGrid.map((stat) => (
                                        <PlayerStat key={stat.title} statName={stat.title} statValue={displayPlayerStat(stat.value, player)} />
                                    ))}
                                    <div className="col-span-2">
                                        <button
                                            onClick={() => window.open(`/player-detail/${player?.token}/current`, '_blank')}
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
            {!availablePlayers || (availablePlayers.length === 0 && <NoPlayersFoundPlaceholder isTeamOwner={userIsOwner()} />)}
        </div>
    );
};

export default MobileRosterTable;

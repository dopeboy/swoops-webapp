import { ArrowDownIcon, ArrowsUpDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import React, { ReactElement, useState } from 'react';
import { getUserDetail, isUserLoggedIn } from 'src/lib/utils';
import { SeasonStatsWithSeason } from 'src/models/player-detail/season-stats';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { NoHistoricalStatsFoundPlaceholder } from '../common/NoHistoricalStatsFoundPlaceholder';
import { MobileAllTimeStatsGridView } from './MobileAllTimeStatsGridView';

const primarySortingStats = ['name', 'positions', 'ppg', 'wl'];
export interface SeasonStats extends ReadonlyPlayer {
    shouldDisplayStats: boolean;
}

interface MobileAllTimeStatsProps {
    seasonStats: SeasonStatsWithSeason[];
    totalStats: SeasonStatsWithSeason;
    teamId: number;
    tableHeaders: Array<SortableHeader>;
    updateSortDirection?: (columnToSort: SortableHeader) => void;
    loadingRequest?: boolean;
}

const MobileAllTimeStatsTable: React.FC<MobileAllTimeStatsProps> = ({
    teamId,
    totalStats,
    seasonStats,
    tableHeaders,
    updateSortDirection,
}): ReactElement => {
    const [showAdditionalFilters, setShowAdditionalFilters] = useState<boolean>(false);
    const userIsOwner = (): boolean => {
        return isUserLoggedIn() && getUserDetail()?.team?.id && getUserDetail()?.team?.id === teamId;
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
            {seasonStats && seasonStats.length > 0 && (
                <div className="mt-2">
                    {seasonStats.map((individualSeasonStats) => (
                        <MobileAllTimeStatsGridView key={individualSeasonStats?.season} seasonStats={individualSeasonStats} />
                    ))}
                    {totalStats && <MobileAllTimeStatsGridView seasonStats={totalStats} />}
                </div>
            )}
            {!seasonStats || (seasonStats.length === 0 && <NoHistoricalStatsFoundPlaceholder isTeamOwner={userIsOwner()} />)}
        </div>
    );
};

export default MobileAllTimeStatsTable;

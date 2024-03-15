import React, { ReactElement } from 'react';
import { getUserDetail, isUserLoggedIn } from 'src/lib/utils';
import { SeasonStatsWithSeason } from 'src/models/player-detail/season-stats';
import { SortableHeader } from 'src/models/sortable-header';
import { NoHistoricalStatsFoundPlaceholder } from '../common/NoHistoricalStatsFoundPlaceholder';
import { PlayerSelectTableHeader } from '../gamelobby/PlayerSelectTableHeader';
import AllTimeStatsRow from './AllTimeStatsRow';

interface AllTimeStatsProps {
    seasonStats: SeasonStatsWithSeason[];
    totalStats: SeasonStatsWithSeason;
    teamId: number;
    tableHeaders: Array<SortableHeader>;
    updateSortDirection?: (columnToSort: SortableHeader) => void;
    loadingRequest?: boolean;
}

const AllTimeStatsTable: React.FC<AllTimeStatsProps> = ({ teamId, totalStats, seasonStats, tableHeaders, updateSortDirection }): ReactElement => {
    const userIsOwner = (): boolean => {
        return isUserLoggedIn() && getUserDetail()?.team?.id && getUserDetail()?.team?.id === teamId;
    };

    return (
        <div className="hidden sm:flex flex-col bg-black px-6 pb-32 overflow-x-auto overflow-y-hidden">
            {seasonStats && seasonStats.length > 0 && (
                <table className="min-w-full max-w-6xl divide-y dark:divide-white/16">
                    <thead className="bg-gray-50 dark:bg-black">
                        <PlayerSelectTableHeader headers={tableHeaders} updateSortDirection={updateSortDirection} />
                    </thead>
                    <tbody className="bg-white dark:bg-black divide-y divide-white/16">
                        {seasonStats &&
                            seasonStats.map((individualSeasonStats) => (
                                <AllTimeStatsRow key={individualSeasonStats?.season} seasonStats={individualSeasonStats} />
                            ))}
                        {totalStats && <AllTimeStatsRow seasonStats={totalStats} />}
                    </tbody>
                </table>
            )}
            {(!seasonStats && !totalStats) || (seasonStats.length === 0 && <NoHistoricalStatsFoundPlaceholder isTeamOwner={userIsOwner()} />)}
        </div>
    );
};

export default AllTimeStatsTable;

import React, { ReactElement } from 'react';
import { getUserDetail, isUserLoggedIn } from 'src/lib/utils';
import { SortableHeader } from 'src/models/sortable-header';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { NoPlayersFoundPlaceholder } from '../common/NoPlayersFoundPlaceholder';
import { PlayerSelectTableHeader } from '../gamelobby/PlayerSelectTableHeader';
import PlayerRow from './PlayerRow';

interface RosterTableProps {
    players: ReadonlyPlayer[];
    teamId: number;
    tableHeaders: Array<SortableHeader>;
    updateSortDirection?: (columnToSort: SortableHeader) => void;
    loadingRequest?: boolean;
}

const RosterTable: React.FC<RosterTableProps> = ({ teamId, players, tableHeaders, updateSortDirection }): ReactElement => {
    const userIsOwner = (): boolean => {
        return isUserLoggedIn() && getUserDetail()?.team?.id && getUserDetail()?.team?.id === teamId;
    };

    return (
        <div className="hidden sm:flex flex-col bg-black px-6 pb-32 overflow-x-auto overflow-y-hidden">
            {players && players.length > 0 && (
                <table className="min-w-full max-w-6xl divide-y dark:divide-white/16" data-tut="current-roster-view">
                    <thead className="bg-gray-50 dark:bg-black">
                        <PlayerSelectTableHeader headers={tableHeaders} updateSortDirection={updateSortDirection} />
                    </thead>
                    <tbody className="bg-white dark:bg-black divide-y divide-white/16">
                        {players && players.map((player) => <PlayerRow key={player.id} player={player} />)}
                    </tbody>
                </table>
            )}
            {!players || (players.length === 0 && <NoPlayersFoundPlaceholder isTeamOwner={userIsOwner()} />)}
        </div>
    );
};

export default RosterTable;

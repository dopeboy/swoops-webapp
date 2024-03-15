import _ from 'lodash';
import React, { ReactElement } from 'react';
import { useLeaderboardPlayersTableSort } from 'src/hooks/useLeaderboardPlayersTableSort';
import { leaderboardPlayersTableHeaders } from 'src/lib/constants';
import { PlayerSelectTableHeader } from '../gamelobby/PlayerSelectTableHeader';
import PlayerRow from './PlayerRow';
import { PlayersLeaderboardWithRank } from 'src/pages/stats/[section]';

interface PlayersTableProps {
    availablePlayers: PlayersLeaderboardWithRank[];
    loadingRequest?: boolean;
}

const PlayersTable: React.FC<PlayersTableProps> = ({ availablePlayers }): ReactElement => {
    const { tableHeaders, players, updateSortDirection } = useLeaderboardPlayersTableSort(
        availablePlayers,
        _.cloneDeep(leaderboardPlayersTableHeaders)
    );

    return (
        <div className="flex flex-col bg-black pb-32">
            {players && players.length > 0 && (
                <table className="min-w-full max-w-6xl divide-y dark:divide-white/16 block table-fixed">
                    <thead className="bg-gray-50 dark:bg-black">
                        <PlayerSelectTableHeader headers={tableHeaders} updateSortDirection={updateSortDirection} />
                    </thead>
                    <tbody className="bg-white dark:bg-black divide-y divide-white/16">
                        {players && players.map((player) => <PlayerRow key={player.id} player={player} />)}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PlayersTable;

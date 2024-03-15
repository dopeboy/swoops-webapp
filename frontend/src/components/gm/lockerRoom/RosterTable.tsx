import React, { ReactElement } from 'react';
import { Player } from 'src/lib/gm/api';
import PlayerRow from './PlayerRow';

interface RosterTablePropType {
    players: Player[];
}

const RosterTable = (props: RosterTablePropType): ReactElement => {
    const { players } = props;

    const getTableHeader = (headerName): ReactElement => {
        return (
            <th
                key={headerName}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider"
            >
                {headerName}
            </th>
        );
    };

    const stats = ['PPG', 'RPG', 'ABG', 'W/L', '+/-'];
    const headerNames = ['Player', 'Position', ...stats];

    return (
        <div className="flex flex-col bg-black px-36">
            <table className="min-w-full divide-y dark:divide-white/16">
                <thead className="bg-gray-50 dark:bg-black">
                    <tr>{headerNames.map(getTableHeader)}</tr>
                </thead>
                <tbody className="bg-white dark:bg-black divide-y divide-white/16">
                    {players && players.map((player) => <PlayerRow player={player} />)}
                </tbody>
            </table>
        </div>
    );
};

export default RosterTable;

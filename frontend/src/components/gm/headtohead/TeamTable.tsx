import { ReactElement } from 'react';
import { Player } from 'src/lib/gm/api';
import PlayerRow from './PlayerRow';

interface RosterTablePropType {
    players: Player[];
    teamName: string;
}

const TeamTable = (props: RosterTablePropType): ReactElement => {
    const { players, teamName } = props;

    const tableHeaderClassNames = 'px-6 py-3 text-left heading-four font-medium text-gray-500 dark:text-white uppercase tracking-wider';
    const getTableHeader = (headerName) => {
        return (
            <th scope="col" className={tableHeaderClassNames}>
                {headerName}
            </th>
        );
    };

    const stats = ['PTS', 'RES', 'AST', 'STL', 'BLK', '+/-'];

    return (
        <table className="w-full px-36 border border-white/16  table-fixed">
            <thead className="bg-gray-50 dark:bg-black">
                <tr>
                    <th className={tableHeaderClassNames}>Player</th>
                    {stats.map(getTableHeader)}
                </tr>
                <tr>
                    <div className="bg-white/4 pl-4 heading-four border-l border-t border-b border-white/16 text-white h-16 pt-5">{teamName}</div>
                    {stats.map(() => (
                        <td className="bg-white/4 border-t border-b border-white/16" />
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-200">
                {players && players.map((player) => <PlayerRow player={player} />)}
            </tbody>
        </table>
    );
};

export default TeamTable;

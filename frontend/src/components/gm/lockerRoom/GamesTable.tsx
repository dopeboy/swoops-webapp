import { ReactElement } from 'react';
import PlayerGameRow from './PlayerGameRow';
import PlayerRow from './PlayerRow';

const playerDisplayStats = ['PPG', 'RPG', 'ABG', 'W/L', '+/-'];
const gameDisplayStats = ['PTS', 'RES', 'AST', 'STL', 'BLK', '+/-'];

const GamesTable = (props): ReactElement => {
    const { players, games } = props;

    const stats = players ? playerDisplayStats : gameDisplayStats;
    const headerNames = ['Opponent', 'PTS', ...stats];

    const getTableHeader = (headerName) => {
        return (
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                {headerName}
            </th>
        );
    };

    return (
        <div className="flex flex-col bg-black px-36">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/64">
                            <thead className="bg-gray-50 dark:bg-black">
                                <tr>{headerNames.map(getTableHeader)}</tr>
                            </thead>
                            <tbody className="bg-white dark:bg-black divide-y divide-gray-200">
                                {players &&
                                    players.map((player) => {
                                        return <PlayerRow key={player.uuid} player={player} />;
                                    })}
                                {games && games.map((game) => <PlayerGameRow key={game.gameId} playerGame={game} />)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamesTable;

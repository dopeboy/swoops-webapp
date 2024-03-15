import { ReactElement } from 'react';
import { PlayerGame } from 'src/models/player-game';
import PlayerGameRow from './PlayerGameRow';

interface PlayerGamesTableProps {
    games: PlayerGame[];
}

const PlayerGamesTable: React.FC<PlayerGamesTableProps> = ({ games }): ReactElement => {
    const stats = [
        ['points'],
        ['field_goals', 'field_goal_attempts'],
        ['three_pointers', 'three_point_attempts'],
        ['free_throws', 'free_throw_attempts'],
        ['offensive_rebounds'],
        ['defensive_rebounds'],
        ['rebounds'],
        ['assists'],
        ['steals'],
        ['blocks'],
        ['turnovers'],
        ['fouls'],
    ];
    return (
        <>
            <div className="hidden sm:flex flex-col bg-black px-4 pb-32">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="overflow-hidden sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-600">
                                <thead className="bg-gray-50 dark:bg-black">
                                    <tr>
                                        <th scope="col" className="text-left subheading-three text-white py-4">
                                            Type
                                        </th>
                                        <th scope="col" className="text-left subheading-three text-white py-4">
                                            Opponent
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            Game Result
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            PTS
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            FGM/FGA
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            3PM/3PA
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            FTM/FTA
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            ORB
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            DRB
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            TRB
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            AST
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            STL
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            BLK
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            TO
                                        </th>
                                        <th scope="col" className="text-center subheading-three text-white py-4">
                                            PF
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-black divide-y divide-gray-600">
                                    {games && games.map((game, index) => <PlayerGameRow key={index + game.team_name} stats={stats} game={game} />)}
                                    {(!games || games.length === 0) && (
                                        <tr>
                                            <td className="py-4 whitespace-nowrap subheading-one text-center text-gray-500 dark:text-white w-14">
                                                -
                                            </td>
                                            <td>
                                                <div className="flex flex-col items-start text-base text-display font-semibold dark:text-white">
                                                    <span className="text-white subheading-two">No game data</span>
                                                </div>
                                            </td>
                                            <td className="px-6 flex flex-col items-center py-4 whitespace-nowrap subheading-one text-center text-gray-500 dark:text-white">
                                                <div className="flex flex-col items-end">
                                                    <span>-</span>
                                                </div>
                                            </td>
                                            {stats.map(() => (
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-base heading-three text-gray-500 dark:text-white">
                                                    -
                                                </td>
                                            ))}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlayerGamesTable;

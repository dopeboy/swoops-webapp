import { ReactElement } from 'react';
import { TableLoadingSpinner } from '../common/TableLoadingSpinner';
import { TableNoGamesFoundPlaceholder } from '../common/TableNoGamesFoundPlaceholder';
import { OpenGamesRow } from './OpenGamesRow';
import { LoadingEnabledGame } from './RenderCourtroomTable';

interface OpenGamesProps {
    games: LoadingEnabledGame[];
    userOwnedPlayerAmount: number;
    loadingGames: boolean;
    setLoading: (id: number, loading: boolean) => void;
    reloadGames: () => void;
}

const OpenGamesTable: React.FC<OpenGamesProps> = ({ games, userOwnedPlayerAmount, setLoading, loadingGames, reloadGames }): ReactElement => {
    return (
        <div className="hidden sm:flex flex-col bg-black sm:px-12 pb-12">
            <div className="-my-2 overflow-x-auto px-2 w-full">
                <div className="py-2 align-middle inline-block min-w-full ">
                    <div className="overflow-hidden sm:rounded-lg">
                        {!loadingGames && (
                            <table className="min-w-full divide-y  divide-gray-200 dark:divide-white/64">
                                <thead className=" bg-gray-50 dark:bg-black  border-b border-white/16 border-solid">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="py-5 pl-2 pr-6 whitespace-nowrap text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            ID
                                        </th>
                                        <th
                                            align="right"
                                            scope="col"
                                            className="py-5 pr-6 whitespace-nowrap text-xs text-center font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Buy-in
                                        </th>
                                        <th
                                            align="right"
                                            scope="col"
                                            className="py-5 pr-6 whitespace-nowrap text-xs text-center font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Current Prize
                                        </th>
                                        <th
                                            align="right"
                                            scope="col"
                                            className="py-5 !w-[230px] whitespace-nowrap text-xs text-center font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Max Swoopsters
                                        </th>
                                        <th
                                            align="right"
                                            scope="col"
                                            className="py-5 pr-6 !w-[290px] whitespace-nowrap text-center text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Teams Joined
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-black divide-y divide-gray-200">
                                    {games &&
                                        games.map((game, idx) => (
                                            <OpenGamesRow
                                                reloadGames={reloadGames}
                                                key={idx}
                                                index={idx}
                                                prizePool={game.prize_pool || ''}
                                                maxSwoopsters={game.tokens_required}
                                                userOwnedPlayerAmount={userOwnedPlayerAmount}
                                                reservations={game.max_enrollable}
                                                currentReservations={game.number_enrolled_reservation}
                                                currentLineups={game.number_enrolled_lineup}
                                                isCurrentUserEnrolledReservation={game.is_current_user_enrolled_with_reservation}
                                                isCurrentUserEnrolledLineup={game.is_current_user_enrolled_with_lineup}
                                                setLoading={(id, loading) => setLoading(id, loading)}
                                                loading={game.loading}
                                                id={game.id}
                                            />
                                        ))}
                                </tbody>
                            </table>
                        )}
                        <TableLoadingSpinner loading={loadingGames} />
                        <TableNoGamesFoundPlaceholder shouldShow={!loadingGames && (!games || games.length === 0)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpenGamesTable;

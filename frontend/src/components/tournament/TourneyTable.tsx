import { ReactElement } from 'react';
import TournamentRow from './TournamentRow';
import { NoTournamentsFoundPlaceholder } from '../common/NoTournamentsFoundPlaceholder';
import { TableLoadingSpinner } from '../common/TableLoadingSpinner';
import { TournamentListing } from 'src/lib/api';

interface TourneyTableProps {
    tournaments: TournamentListing[];
    loadingTournaments: boolean;
    reloadTournaments?: () => void;
    userOwnedPlayerAmount: number;
    open: boolean;
}
export const TourneyTable: React.FC<TourneyTableProps> = ({ tournaments, loadingTournaments, userOwnedPlayerAmount, open }): ReactElement => {
    return (
        <div className="hidden sm:flex flex-col bg-black pb-12 pl-2 sm:px-12 md:pb-32 overflow-x-auto overflow-y-hidden">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full max-w-6xl px-1 sm:px-6 lg:px-8">
                    <div className="shadow sm:rounded-lg">
                        {tournaments && tournaments.length > 0 && !loadingTournaments && (
                            <table className="min-w-full divide-y divide-gray-600">
                                <thead className="bg-gray-50 dark:bg-black">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="pl-0.5 sm:pl-2 py-5 pr-6 whitespace-nowrap text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Id
                                        </th>
                                        <th
                                            scope="col"
                                            className="py-5 pr-6 whitespace-nowrap text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Tournament
                                        </th>
                                        <th
                                            scope="col"
                                            className="py-5 pl-4 whitespace-nowrap text-end text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Prize Pool
                                        </th>
                                        <th
                                            scope="col"
                                            className="py-5 whitespace-nowrap text-end pr-6 text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Bracket Size
                                        </th>
                                        <th
                                            scope="col"
                                            className="py-5 pr-6 whitespace-nowrap text-end text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Start Date
                                        </th>
                                        <th
                                            scope="col"
                                            className="py-5 pr-6 whitespace-nowrap text-end text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Max Swoopsters
                                        </th>
                                        <th
                                            scope="col"
                                            className="py-5 pr-6 whitespace-nowrap text-end text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                        >
                                            Teams Joined
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-black divide-y divide-gray-600">
                                    {tournaments &&
                                        tournaments.map((tournament) => (
                                            <TournamentRow tournament={tournament} open={open} userOwnedPlayerAmount={userOwnedPlayerAmount} />
                                        ))}
                                </tbody>
                            </table>
                        )}
                        <TableLoadingSpinner loading={loadingTournaments} />
                        {!loadingTournaments && (!tournaments || tournaments.length === 0) && <NoTournamentsFoundPlaceholder />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourneyTable;

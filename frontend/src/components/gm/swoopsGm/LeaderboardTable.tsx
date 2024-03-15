import { ReactElement } from 'react';
import LeaderboardBody from 'src/components/gm/swoopsGm/LeaderboardBody';
import { Leaderboard } from 'src/lib/gm/api/models/Leaderboard';

interface IProps {
    leaderboards: Leaderboard[];
}

const LeaderboardTable = (props: IProps): ReactElement => {
    const { leaderboards } = props;

    return (
        <div className="align-middle inline-block overflow-x-auto w-full rounded-lg border-t border-r border-l border-solid border-white/16">
            <table className="min-w-full text-white table-fixed">
                <thead className="bg-black border-b border-solid border-white/16 w-full">
                    <tr>
                        <th
                            align="left"
                            scope="col"
                            className="px-4 py-3.5 md:px-6 md:py-5 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header"
                        >
                            Place
                        </th>
                        <th
                            align="left"
                            scope="col"
                            className="px-3 py-3.5 md:px-4 md:py-5 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header"
                        >
                            Amended ID
                        </th>
                        <th
                            align="left"
                            scope="col"
                            className="px-3 py-3.5 md:px-4 md:py-5 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header"
                        >
                            W/L
                        </th>
                        <th
                            align="left"
                            scope="col"
                            className="px-3 py-3.5 md:px-4 md:py-5 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header"
                        >
                            Win %
                        </th>
                        <th
                            align="left"
                            scope="col"
                            className="px-3 py-3.5 md:px-4 md:py-5 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header"
                        >
                            +/-
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-black">
                    {leaderboards &&
                        leaderboards.map((leaderboard, idx) => (
                            <LeaderboardBody key={leaderboard.amended_id} leaderboard={{ ...leaderboard, position: idx + 1 }} />
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaderboardTable;

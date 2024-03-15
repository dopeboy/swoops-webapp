import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { getPrice } from 'src/lib/gm/utils';

const TournamentTable = (props): ReactElement => {
    const { tournaments } = props;
    const router = useRouter();
    const renderTournament = (tournament, idx): ReactElement => {
        return (
            <tr key={idx}>
                <td className="align-top border-b border-white/16 border-solid  py-6 pr-6 whitespace-nowrap text-sm text-gray-500 dark:text-white">
                    <div className="heading-two font-bold">{getPrice(tournament.price)}</div>
                    <div className="text-xs text-white/64 font-medium">
                        <span className="capitalize">{tournament.type} </span>
                        <span>• </span>
                        <span className="uppercase">{tournament.currency}</span>
                    </div>
                </td>
                <td
                    align="right"
                    className="align-top border-b border-white/16 border-solid  py-6 pr-6 whitespace-nowrap text-sm text-gray-500 dark:text-white"
                >
                    <div className="heading-three font-bold">{getPrice(tournament.prizepool)}</div>
                    <div className="text-xs text-white/64 font-medium ">
                        <span className="uppercase leading-6">{tournament.currency}</span>
                    </div>
                </td>
                <td
                    align="right"
                    className="align-top border-b border-white/16 border-solid  py-6  whitespace-nowrap text-sm text-gray-500 dark:text-white"
                >
                    <div className="flex justify-end w-full flex-row space-x-12">
                        <div>
                            <div className="heading-three font-bold">
                                {tournament.participated}/{tournament.slot}
                            </div>
                            <div className="text-xs text-white/64 font-medium leading-6">
                                <span> {(tournament.participated / tournament.slot) * 100}% Full</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                router.push(`/headtohead/somegameid`);
                            }}
                            className="btn bg-assist-green"
                        >
                            Join
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="flex flex-col bg-black  pb-12">
            <div className="-my-2 overflow-x-auto px-2 container-md w-full">
                <div className="py-2 align-middle inline-block min-w-full ">
                    <div className="overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y  divide-gray-200 dark:divide-white/64">
                            <thead className=" bg-gray-50 dark:bg-black  border-b border-white/16 border-solid">
                                <tr>
                                    <th
                                        scope="col"
                                        className=" py-5  pr-6 whitespace-nowrap  text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                    >
                                        Buy-in
                                    </th>
                                    <th
                                        align="right"
                                        scope="col"
                                        className=" py-5  pr-6  whitespace-nowrap  text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                    >
                                        Current Prize
                                    </th>
                                    <th
                                        align="right"
                                        scope="col"
                                        style={{ paddingRight: 172 }}
                                        className=" py-5  whitespace-nowrap    text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                    >
                                        Teams Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-black divide-y divide-gray-200">
                                {tournaments && tournaments.map((tournament, idx) => renderTournament(tournament, idx))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentTable;

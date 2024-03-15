import { ReactElement } from 'react';
import { DotsHorizontalIcon } from '@heroicons/react/solid';
import moment from 'moment';
import classnames from 'classnames';
import { getPrice } from 'src/lib/gm/utils';
import BasketballIcon from 'src/components/gm/court/BasketballIcon';
import UnionIcon from 'src/components/gm/court/UnionIcon';
import config from 'tailwind.config';

const GameTable = (props): ReactElement => {
    const { games } = props;

    const renderGame = (game, idx): ReactElement => {
        return (
            <tr key={idx}>
                <td className="align-top border-b border-white/16 border-solid py-6 whitespace-nowrap text-sm text-gray-500 w-96 pr-6 dark:text-white">
                    <div className="flex flex-row space-x-8">
                        <div className="shrink-0">
                            {game.image_url === 'Basketball' ? (
                                <BasketballIcon color={config.theme.extend.colors.white} />
                            ) : game.image_url === 'Bracket' ? (
                                <UnionIcon color={config.theme.extend.colors.white} />
                            ) : null}
                        </div>
                        <div className="flex flex-col w-full">
                            {game.teams.map((team, idx) => (
                                <div
                                    key={idx}
                                    className={classnames('text-base leading-6  font-bold ', {
                                        'text-white': team.highlight,
                                        'text-white/64': !team.highlight,
                                    })}
                                >
                                    <div className="flex space-x-12 flex-row justify-between pr-7 border-r border-solid border-white/16">
                                        <span>{team.name}</span>
                                        <span>{team.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </td>
                <td
                    align="right"
                    className="align-top border-b border-white/16 border-solid py-6 px-6 whitespace-nowrap text-sm text-gray-500 dark:text-white"
                >
                    <div className="heading-three font-bold">{getPrice(game.payout)}</div>
                    <div className="text-xs text-white/64 font-medium leading-6">
                        <span className="uppercase">{game.currency}</span>
                    </div>
                </td>
                <td
                    align="right"
                    className="align-top border-b border-white/16 border-solid py-6 whitespace-nowrap text-sm text-gray-500 dark:text-white"
                >
                    <div className="flex justify-end w-full flex-row space-x-12">
                        <div>
                            <div className="text-base leading-6 capitalize font-bold">
                                {game.date.isSame(moment().clone().subtract(1, 'days').startOf('day'), 'd')
                                    ? 'Yesterday'
                                    : moment().diff(game.date, 'days') + ' days ago'}
                            </div>
                            <div className="text-xs leading-6 text-white/64 font-medium ">
                                <span>{moment(game.date).format('hh:mma')}</span>
                            </div>
                        </div>
                        <button className="icon-btn">
                            <DotsHorizontalIcon className="text-white h-6 w-6" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="flex flex-col bg-black pb-12">
            <div className="-my-2 overflow-x-auto px-2 container-md w-full">
                <div className="py-2 align-middle inline-block min-w-full ">
                    <div className="overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/64">
                            <thead className=" bg-gray-50 dark:bg-black border-b border-white/16 border-solid">
                                <tr>
                                    <th
                                        scope="col"
                                        className="py-5 pr-6 whitespace-nowrap text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                    >
                                        Teams
                                    </th>
                                    <th
                                        align="right"
                                        scope="col"
                                        className="py-5 pr-6 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                    >
                                        Total Payout
                                    </th>
                                    <th
                                        align="right"
                                        scope="col"
                                        style={{ paddingRight: 108 }}
                                        className="py-5 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider font-header"
                                    >
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-black divide-y divide-gray-200">
                                {games && games.map((game, idx) => renderGame(game, idx))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameTable;

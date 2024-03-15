import { useState, ReactElement } from 'react';
import classnames from 'classnames';
import SearchBar from 'src/components/gm/common/SearchBar';
import DollarIcon from 'src/components/gm/swoopsGm/DollarIcon';
import CaretIcon from 'src/components/gm/swoopsGm/CaretIcon';
import { getStat } from 'src/lib/gm/utils';
import { NBAPlayerStats } from 'src/lib/gm/api';
import { debounce, cloneDeep } from 'lodash';
import config from 'tailwind.config';
import { PlusIcon } from '@heroicons/react/24/solid';

const filtersButton = [
    {
        title: 'All',
    },
    {
        title: 'Guard',
    },
    {
        title: 'Forward',
    },
    {
        title: 'Center',
    },
];

const tableHead = [
    {
        query: 'player__full_name',
        sort: true,
        children: (
            <>
                <span>Player</span>
            </>
        ),
        class: 'cursor-pointer hover:bg-white/4 min-w-[220px] md:min-w-[370px] px-4 py-3.5 md:py-5 md:px-6 whitespace-nowrap text-left text-xs font-medium uppercase tracking-wider font-header hidden md:table-cell',
        direction: '',
    },
    {
        query: 'price',
        sort: true,
        children: (
            <>
                <span>
                    {' '}
                    <DollarIcon color={config.theme.extend.colors.white} />
                </span>
            </>
        ),
        class: 'cursor-pointer hover:bg-white/4 py-3.5 px-3 md:py-5 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header table-cell md:hidden',
        direction: '',
    },
    {
        query: 'player__position',
        sort: true,
        children: (
            <>
                <span className="hidden md:block">Position</span>
                <span className="block md:hidden">POS</span>
            </>
        ),
        class: 'cursor-pointer hover:bg-white/4 px-3 py-3.5 md:py-5 md:px-4 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header',
        direction: '',
    },
    {
        query: 'ppg',
        sort: true,
        children: (
            <>
                <span>PPG</span>
            </>
        ),
        class: 'cursor-pointer hover:bg-white/4 px-3 py-3.5 md:py-5 md:px-4 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header',
        direction: '',
    },
    {
        query: 'rpg',
        sort: true,
        children: (
            <>
                <span>RPG</span>
            </>
        ),
        class: 'cursor-pointer hover:bg-white/4 px-3 py-3.5 md:py-5 md:px-4 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header',
        direction: '',
    },
    {
        query: 'apg',
        sort: true,
        children: (
            <>
                <span>APG</span>
            </>
        ),
        class: 'cursor-pointer hover:bg-white/4 px-3 py-3.5 md:py-5 md:px-4 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header',
        direction: '',
    },
    {
        query: 'rating',
        sort: true,
        children: (
            <>
                <span>Rating</span>
            </>
        ),
        class: 'cursor-pointer hover:bg-white/4 px-3 py-3.5 md:py-5 md:px-4 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header',
        direction: '',
    },
    {
        query: 'price',
        sort: true,
        children: (
            <>
                <span>
                    {' '}
                    <DollarIcon color={config.theme.extend.colors.white} />
                </span>
            </>
        ),
        class: 'cursor-pointer hover:bg-white/4 md:px-4 px-3 py-3.5 md:py-5 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header hidden md:table-cell',
        direction: '',
    },
];

const sortData = Array.apply(0, Array(tableHead.length)).map(function (_, i) {
    return {
        direction: '',
    };
});

interface IProps {
    players: NBAPlayerStats[];
    filter: any;
    handleFilter: (value) => void;
    handleAddLineup: (value) => void;
}

const LineupTable = (props: IProps): ReactElement => {
    const [sort, setSort] = useState([...sortData]);

    const { players, filter, handleFilter, handleAddLineup } = props;

    const handleSort = (idx, type) => {
        const stateSort = cloneDeep(sortData);
        let ordering;
        if (sort[idx].direction === '') {
            stateSort[idx].direction = 'up';
            ordering = type;
        } else if (sort[idx].direction === 'up') {
            stateSort[idx].direction = 'down';
            ordering = `-${type}`;
        } else if (sort[idx].direction === 'down') {
            stateSort[idx].direction = '';
            ordering = '';
        }
        setSort(stateSort);
        handleFilter({ ...filter, ordering: `${ordering}` });
    };

    const onSearch = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
        handleFilter({ ...filter, search: event.target.value });
    }, 250);

    const renderPlayers = (player): ReactElement => {
        return (
            <tr key={player.id} className="border-b border-solid border-white/16">
                <td className="whitespace-nowrap text-sm pl-4 md:pl-6 text-white hidden md:table-cell">
                    <div className="h-16 md:h-24 flex items-center">
                        <div className="h-full shrink-0 flex flex-col justify-center md:justify-end mr-2.5">
                            <img
                                src={player.player?.image_url}
                                alt={`${player.player.full_name} Player`}
                                className="object-cover w-8 h-12 md:h-32 md:w-32"
                            />
                        </div>
                        <div className="font-display font-extrabold text-white text-lg">
                            <span className="hidden md:block"> {player.player.first_name + ' ' + player.player.last_name}</span>
                            <span className="block md:hidden"> {player.player.first_name.charAt(0) + '. ' + player.player.last_name}</span>
                        </div>
                    </div>
                </td>
                <td align="left" className="align-center whitespace-nowrap px-3 table-cell md:hidden font-display">
                    <div className="h-16 flex flex-col justify-center">
                        <div className="rounded bg-assist-green/32 p-1 md:rounded-none md:bg-transparent md:p-0 flex items-center w-fit">
                            <DollarIcon color={config.theme.extend.colors.white} />
                            <div className="ml-0.5 font-display font-medium text-white text-base">{player.price}</div>
                        </div>
                    </div>
                </td>
                <td align="left" className="align-center whitespace-nowrap px-3 md:px-4 font-display">
                    <div className="rounded bg-off-black p-1 md:rounded-none md:bg-transparent md:p-0 w-fit">
                        <div className="font-display font-medium text-white text-base">{player.player.position}</div>
                    </div>
                </td>
                <td align="left" className="align-center whitespace-nowrap px-3 md:px-4 font-display">
                    <div className="font-display font-medium text-white text-base">{getStat(player.ppg)}</div>
                </td>
                <td align="left" className="align-center whitespace-nowrap px-3 md:px-4 font-display">
                    <div className="font-display font-medium text-white text-base">{getStat(player.rpg)}</div>
                </td>
                <td align="left" className="align-center whitespace-nowrap px-3 md:px-4 font-display">
                    <div className="font-display font-medium text-white text-base">{getStat(player.apg)}</div>
                </td>
                <td align="left" className="align-center whitespace-nowrap px-3 md:px-4 font-display">
                    <div className="font-display font-medium text-white text-base">{player.rating}</div>
                </td>
                <td align="left" className="align-center whitespace-nowrap px-3 md:px-4 hidden md:table-cell font-display">
                    <div className="font-display font-medium text-white text-base">{getStat(player?.price)}</div>
                </td>
                <td align="left" className="align-center whitespace-nowrap text-sm text-white pr-6 hidden md:table-cell">
                    <button
                        onClick={() => {
                            handleAddLineup(player);
                        }}
                        className="btn-rounded-white text-black h-12"
                    >
                        Add
                    </button>
                </td>
                <div className="block md:hidden absolute right-0 px-2 flex justify-center bg-black my-3.5" style={{ translate: 'transformY(-50%)' }}>
                    <button
                        className="h-10 w-10 rounded-lg bg-white flex items-center justify-center"
                        onClick={() => {
                            handleAddLineup(player);
                        }}
                    >
                        <PlusIcon className="w-6 h-6 text-black" />
                    </button>
                </div>
            </tr>
        );
    };

    return (
        <div className="flex flex-col">
            <div className="bg-off-black border-t border-r border-l border-solid border-white/16 rounded-lg relative">
                <div className="flex flex-row md:space-x-4 pt-4 px-4">
                    <div className="grow hidden md:block">
                        <SearchBar placeholder="Search Players" onChange={onSearch} />
                    </div>
                    <div className="relative w-full md:w-fit flex flex-wrap">
                        {filtersButton.map((button, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={classnames(
                                    'grow  md:grow-0 text-base font-bold border-r-2 border-solid border-off-black relative flex-auto text-center align-middle no-underline leading-6 rounded-none md:px-4 py-2 md:py-3 ',
                                    {
                                        'bg-white text-black': filter.position === button.title,
                                        'bg-white/4 hover:bg-white/8 text-white ': filter.position !== button.title,
                                        'rounded-l-lg': idx === 0,
                                        'rounded-r-lg': idx === filtersButton.length - 1,
                                    }
                                )}
                                onClick={() => {
                                    handleFilter({ ...filter, position: button.title });
                                }}
                            >
                                {button.title}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-row relative text-white">
                    <div className="align-middle inline-block rounded-bl-lg pt-2 md:hidden relative pt-2">
                        <table>
                            {' '}
                            <thead className="bg-off-black border-b border-solid border-white/16 w-full">
                                <th
                                    scope="col"
                                    className={classnames(
                                        'cursor-pointer hover:bg-white/4 min-w-[220px] md:min-w-[370px] px-4 py-3.5 md:py-5 md:px-6 whitespace-nowrap text-left text-xs font-medium uppercase tracking-wider font-header'
                                    )}
                                    onClick={() => {
                                        handleSort(0, 'player__full_name');
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        Player
                                        <span className="ml-1">
                                            <CaretIcon direction="up" className={classnames({ 'fill-assist-green': sort[0]?.direction === 'up' })} />
                                            <CaretIcon
                                                direction="down"
                                                className={classnames({ 'fill-assist-green': sort[0]?.direction === 'down' })}
                                            />
                                        </span>
                                    </div>
                                </th>
                            </thead>
                            <tbody className="bg-black">
                                {players.map((player) => (
                                    <tr key={player.id} className="border-b border-solid border-white/16">
                                        <td className="whitespace-nowrap px-4 md:px-6">
                                            <div className="flex items-center h-16 md:h-24">
                                                <div className="h-full shrink-0 flex flex-col justify-center md:justify-end mr-2.5">
                                                    <img
                                                        src={player.player?.image_url}
                                                        alt={`${player.player.full_name} Player`}
                                                        className="object-cover w-8 h-12 md:h-32 md:w-32"
                                                    />
                                                </div>
                                                <div className="font-display font-extrabold text-white text-lg">
                                                    <span className="hidden md:block">
                                                        {' '}
                                                        {player.player.first_name + ' ' + player.player.last_name}
                                                    </span>
                                                    <span className="block md:hidden">
                                                        {' '}
                                                        {player.player.first_name.charAt(0) + '. ' + player.player.last_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div
                            className="absolute right-0 top-0 w-px h-full bg-off-black"
                            style={{ boxShadow: '1px 0px 2px rgba(0, 0, 0, 0.32), 1px 0px 1px rgba(0, 0, 0, 0.64)' }}
                        />
                    </div>
                    <div className="align-middle inline-block overflow-x-auto w-full rounded-br-lg md:rounded-b-lg pt-2">
                        <table className="min-w-full">
                            <thead className="bg-off-black border-b border-solid border-white/16 w-full">
                                <tr>
                                    {tableHead.map((head, idx) => (
                                        <th
                                            scope="col"
                                            className={classnames(head.class)}
                                            onClick={() => {
                                                handleSort(idx, head.query);
                                            }}
                                        >
                                            <div className="flex justify-between items-center">
                                                {head.children}
                                                {head.sort && (
                                                    <span className="ml-1">
                                                        <CaretIcon
                                                            direction="up"
                                                            className={classnames({ 'fill-assist-green': sort[idx]?.direction === 'up' })}
                                                        />
                                                        <CaretIcon
                                                            direction="down"
                                                            className={classnames({ 'fill-assist-green': sort[idx]?.direction === 'down' })}
                                                        />
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th
                                        align="left"
                                        scope="col"
                                        className="min-w-[48px] py-5 whitespace-nowrap text-xs font-medium  text-white uppercase tracking-wider font-header hidden md:table-cell"
                                    ></th>
                                </tr>
                            </thead>
                            <tbody className="bg-black">{players && players.map((player) => renderPlayers(player))}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LineupTable;

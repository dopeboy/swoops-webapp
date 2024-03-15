import {
    ArrowDownIcon,
    ArrowsUpDownIcon,
    ArrowUpIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    MinusIcon,
    PlusIcon,
} from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { Dispatch, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Player } from 'src/lib/api';
import { rosterTableStatGrid } from 'src/lib/constants';
import { displayPlayerStat, EmptyRosterPlayer, getSortedPositions } from 'src/lib/utils';
import { PositionFilter } from 'src/models';
import { Position } from 'src/models/position.type';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { PlayerSlideOver } from '../common/PlayerSlideOver';
import { PlayerStat } from '../common/PlayerStat';
import { StarRating } from '../common/StarRating';
import { TableLoadingSpinner } from '../common/TableLoadingSpinner';
import { PlayerTableNoResultsPlaceholder } from '../common/TableNoResultsPlaceholder';
import { CollapsiblePlayer } from '../lockerRoom/MobileRosterTable';
import { PositionFilters } from './PositionFilters';

interface MobilePlayerSelectTableProps {
    addPlayerToSelection: (player: Player, shouldRemove: boolean) => void;
    setAvailablePlayers: Dispatch<SetStateAction<CollapsiblePlayer[]>>;
    filterPlayerPosition: (position: Array<Position>) => void;
    isFreeAgentDisplay: boolean;
    tableHeaders: Array<SortableHeader>;
    updateSortDirection?: (columnToSort: SortableHeader) => void;
    loadingRequest: boolean;
    selectPosition: (position: Position) => void;
    selectedPosition: PositionFilter;
    positions: PositionFilter[];
    selectedPlayers: Array<CollapsiblePlayer>;
    availablePlayers: Array<CollapsiblePlayer>;
    cardPosition?: Position;
    clickOnPlayer?: () => void;
}
const primarySortingStats = ['name', 'positions', 'ppg', 'wl'];

const MobilePlayerSelectTable: React.FC<MobilePlayerSelectTableProps> = ({
    addPlayerToSelection,
    availablePlayers,
    filterPlayerPosition,
    positions,
    selectedPosition,
    selectPosition,
    tableHeaders,
    updateSortDirection,
    setAvailablePlayers,
    loadingRequest,
    selectedPlayers,
    cardPosition,
    clickOnPlayer,
}): ReactElement => {
    const [showAdditionalFilters, setShowAdditionalFilters] = useState<boolean>(false);
    const [slideOverOpen, setSlideOverOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<CollapsiblePlayer>(EmptyRosterPlayer);

    const collapsePlayer = (player: CollapsiblePlayer) => (): void => {
        if (clickOnPlayer) clickOnPlayer();
        setAvailablePlayers((prevPlayers: CollapsiblePlayer[]) => {
            return prevPlayers.map((prevPlayer) => {
                if (prevPlayer.id === player.id) {
                    return { ...prevPlayer, shouldDisplayStats: !prevPlayer.shouldDisplayStats } as CollapsiblePlayer;
                }
                return prevPlayer;
            });
        });
    };

    const isPlayerAdded = (player): boolean =>
        selectedPlayers
            .filter((selectedPlayer) => selectedPlayer !== EmptyRosterPlayer)
            .some((selectedPlayer) => {
                return selectedPlayer.id === player.id;
            });

    useMemo(() => {
        setAvailablePlayers(availablePlayers);
    }, [availablePlayers]);

    useEffect(() => {
        if (cardPosition) {
            selectPosition(cardPosition);
        }
    }, [cardPosition]);

    return (
        <>
            <div className="sm:hidden flex flex-col w-full justify-center pb-10 overflow-hidden">
                <div className="flex flex-col items-start bg-off-black rounded-lg border border-white/16 w-full">
                    <PositionFilters
                        filterPlayerPosition={filterPlayerPosition}
                        positions={positions}
                        selectedPosition={selectedPosition}
                        selectPosition={selectPosition}
                    />
                    {tableHeaders && (
                        <div className="flex flex-row items-center justify-start gap-2 pt-3 px-2">
                            {tableHeaders
                                ?.filter((header) => primarySortingStats.includes(header.value))
                                .map((header) => (
                                    <div
                                        key={header.value}
                                        onClick={() => updateSortDirection && updateSortDirection(header)}
                                        className={classNames(
                                            'flex flex-row items-center justify-between w-fit px-4 py-2 cursor-pointer rounded-xl border border-white',
                                            {
                                                'bg-off-black': header.sortDirection !== SortDirection.NONE,
                                            }
                                        )}
                                    >
                                        <div className="text-white text-base">{header.title}</div>
                                        <div className="flex flex-row items-center">
                                            <div className="ml-2">
                                                {header.sortDirection === SortDirection.DESC && header.value !== 'rank' && (
                                                    <ArrowDownIcon className="h-3 w-3 text-white border-white" strokeWidth={3} />
                                                )}
                                                {header.sortDirection === SortDirection.ASC && header.value !== 'rank' && (
                                                    <ArrowUpIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                                )}
                                                {header.sortDirection === SortDirection.NONE && header.value !== 'rank' && (
                                                    <ArrowsUpDownIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                    <button
                        onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
                        className="flex flex-row items-center gap-2 py-2 mt-2 justify-center w-full"
                    >
                        <span className="subheading-three text-white">More filters</span>
                        {showAdditionalFilters ? (
                            <ChevronDownIcon className="h-4 w-4 text-white -mt-1" />
                        ) : (
                            <ChevronRightIcon className="h-4 w-4 text-white -mt-1" />
                        )}
                    </button>
                    {tableHeaders && showAdditionalFilters && (
                        <div className="grid grid-cols-4 items-center gap-2 pt-2 px-2 w-full z-10">
                            {tableHeaders
                                ?.filter((header) => !primarySortingStats.includes(header.value))
                                .map((header) => (
                                    <div
                                        key={header.value}
                                        onClick={() => updateSortDirection && updateSortDirection(header)}
                                        className={classNames(
                                            'flex flex-row items-center justify-between w-full px-4 py-2 cursor-pointer rounded-xl border border-white',
                                            {
                                                'bg-black': header.sortDirection !== SortDirection.NONE,
                                            }
                                        )}
                                    >
                                        <div className="text-white text-base">{header.title}</div>
                                        <div className="flex flex-row items-center">
                                            <div className="ml-2">
                                                {header.sortDirection === SortDirection.DESC && header.value !== 'rank' && (
                                                    <ArrowDownIcon className="h-3 w-3 text-white border-white" strokeWidth={3} />
                                                )}
                                                {header.sortDirection === SortDirection.ASC && header.value !== 'rank' && (
                                                    <ArrowUpIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                                )}
                                                {header.sortDirection === SortDirection.NONE && header.value !== 'rank' && (
                                                    <ArrowsUpDownIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                    {availablePlayers && availablePlayers.length > 0 && (
                        <div className="mt-2 w-full">
                            {availablePlayers.map((player) => (
                                <div key={player.id} className="relative flex flex-col px-2 my-1 items-center justify-center w-full">
                                    <div
                                        onClick={collapsePlayer(player)}
                                        className="relative flex flex-row h-20 items-center w-full bg-off-black border-white/16 border rounded-md py-3"
                                    >
                                        <div className="whitespace-nowrap w-32">
                                            <div className="flex items-center">
                                                <PlayerAvatar
                                                    playerToken={player?.token}
                                                    height={160}
                                                    width={160}
                                                    className={'absolute top-[6px] -left-[48px] h-40 w-40 clip-player-front-image'}
                                                />
                                                <div className="relative text-white">
                                                    <div
                                                        className="left-[75px] -top-5 absolute text-base text-display uppercase font-semibold available-players"
                                                        data-tut="available-players"
                                                    >
                                                        <div className="flex flex-col items-start gap-1">
                                                            {player?.full_name ?? ''}
                                                            <div className="flex flex-row items-center justify-start -mt-1.5 gap-2">
                                                                <div className="whitespace-nowrap capitalize font-semibold text-base text-white text-center dark:text-white">
                                                                    <div className="whitespace-nowrap text-[12px] detail-one text-center text-white dark:text-white">
                                                                        <StarRating rating={player?.star_rating} size="h-3 w-3" />
                                                                    </div>
                                                                </div>
                                                                <span className="subheading-two">-</span>
                                                                <div className="whitespace-nowrap capitalize font-semibold text-base text-white text-center dark:text-white">
                                                                    <div className="flex flex-col items-start">
                                                                        <div className="w-full flex flex-row gap-1 items-center justify-center">
                                                                            {getSortedPositions(player.positions).map(
                                                                                (position: string, index: number) => (
                                                                                    <span key={position + index}>
                                                                                        {position}
                                                                                        {index !== player.positions.length - 1 ? ' /' : ''}
                                                                                    </span>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-[190px] pr-4 mt-1.5 w-full flex flex-row items-center justify-between gap-2">
                                            <div className="whitespace-nowrap capitalize font-semibold text-base text-white text-center dark:text-white">
                                                <div className="flex flex-col items-center">
                                                    <span className="subheading-one uppercase">PTS</span>
                                                    <span className="subheading-two uppercase">{displayPlayerStat('ppg', player)}</span>
                                                </div>
                                            </div>
                                            <div
                                                className="whitespace-nowrap capitalize font-semibold text-base text-white text-center dark:text-white"
                                                data-tut="add-lineup-list"
                                            >
                                                <button
                                                    className={classNames(
                                                        !isPlayerAdded(player) ? 'bg-white border-black' : 'bg-black border-white',
                                                        'inline-block w-fit p-1 -mt-2 mr-2 border-1 rounded-lg'
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        addPlayerToSelection(player, isPlayerAdded(player));
                                                    }}
                                                >
                                                    {isPlayerAdded(player) ? (
                                                        <MinusIcon className="h-8 w-8 stroke-4 text-white" />
                                                    ) : (
                                                        <PlusIcon className="h-8 w-8 stroke-4 text-black" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {!player?.shouldDisplayStats && <ChevronDownIcon className="mt-0.5 text-white h-4 w-4" />}
                                    {player?.shouldDisplayStats && <ChevronUpIcon className="mt-0.5 text-white h-4 w-4" />}
                                    {player?.shouldDisplayStats && (
                                        <div className="grid grid-cols-3 w-full gap-1 mt-2 mb-3">
                                            {rosterTableStatGrid.map((stat) => (
                                                <PlayerStat
                                                    key={stat.title}
                                                    statName={stat.title}
                                                    statValue={displayPlayerStat(stat.value, player)}
                                                />
                                            ))}
                                            <div className="col-span-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPlayer(player);
                                                        setSlideOverOpen(true);
                                                    }}
                                                    className="btn-rounded-white heading-three w-full"
                                                >
                                                    View
                                                </button>
                                            </div>
                                            <div data-tut="add-lineup-detail" className="w-full col-span-3">
                                                <button
                                                    className={classNames(
                                                        !isPlayerAdded(player) ? 'bg-white' : 'bg-black text-white border-white',
                                                        'inline-block w-full px-1 py-3 mr-2 border-2 rounded-lg heading-three col-span-3'
                                                    )}
                                                    onClick={() => {
                                                        addPlayerToSelection(player, isPlayerAdded(player));
                                                    }}
                                                >
                                                    {!isPlayerAdded(player) ? 'Add to Lineup' : 'Remove'}
                                                </button>
                                            </div>
                                            <div className="h-1 border-b border-white/16 col-span-3"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <TableLoadingSpinner loading={loadingRequest} />
                    <PlayerTableNoResultsPlaceholder shouldShow={!loadingRequest && (!availablePlayers || availablePlayers.length === 0)} />
                    <PlayerSlideOver
                        onClick={(player) => addPlayerToSelection(player, selectedPlayer ? isPlayerAdded(selectedPlayer) : false)}
                        isAddedToRoster={selectedPlayer ? isPlayerAdded(selectedPlayer) : false}
                        setOpen={setSlideOverOpen}
                        open={slideOverOpen}
                        actionText={selectedPlayer && isPlayerAdded(selectedPlayer) ? 'Remove' : 'Add to lineup'}
                        selectedPlayer={selectedPlayer}
                    />
                </div>
            </div>
        </>
    );
};

export default MobilePlayerSelectTable;

import { Dispatch, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Player } from 'src/lib/api';
import { EmptyRosterPlayer } from 'src/lib/utils';
import { PositionFilter } from 'src/models';
import { Position } from 'src/models/position.type';
import { SortableHeader } from 'src/models/sortable-header';
import { PlayerSlideOver } from '../common/PlayerSlideOver';
import { TableLoadingSpinner } from '../common/TableLoadingSpinner';
import { PlayerTableNoResultsPlaceholder } from '../common/TableNoResultsPlaceholder';
import { CollapsiblePlayer } from '../lockerRoom/MobileRosterTable';
import { PlayerSelectRow } from './PlayerSelectRow';
import { PlayerSelectTableHeader } from './PlayerSelectTableHeader';
import { PositionFilters } from './PositionFilters';

interface PlayerSelectTableProps {
    addPlayerToSelection: (player: Player, shouldRemove: boolean) => void;
    filterPlayerPosition: (position: Array<Position>) => void;
    isFreeAgentDisplay: boolean;
    setAvailablePlayers: Dispatch<SetStateAction<CollapsiblePlayer[]>>;
    loadingRequest: boolean;
    selectPosition: (position: Position) => void;
    selectedPosition: PositionFilter;
    positions: Array<PositionFilter>;
    tableHeaders: Array<SortableHeader>;
    updateSortDirection?: (columnToSort: SortableHeader) => void;
    selectedPlayers: Array<CollapsiblePlayer>;
    availablePlayers: Array<CollapsiblePlayer>;
    cardPosition?: Position;
    clickOnPlayer?: () => void;
}

const PlayerSelectTable: React.FC<PlayerSelectTableProps> = ({
    addPlayerToSelection,
    availablePlayers,
    setAvailablePlayers,
    tableHeaders,
    selectPosition,
    selectedPosition,
    positions,
    updateSortDirection,
    filterPlayerPosition,
    isFreeAgentDisplay,
    loadingRequest,
    selectedPlayers,
    cardPosition,
    clickOnPlayer,
}): ReactElement => {
    const [slideOverOpen, setSlideOverOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<CollapsiblePlayer>(EmptyRosterPlayer);

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
            <div className="hidden sm:flex sm:flex-col pb-36 w-full">
                <div className="flex flex-col items-start overflow-x-auto w-full bg-off-black rounded-lg border border-white/16">
                    <PositionFilters
                        filterPlayerPosition={filterPlayerPosition}
                        positions={positions}
                        selectedPosition={selectedPosition}
                        selectPosition={selectPosition}
                    />
                    {!loadingRequest && availablePlayers && availablePlayers.length > 0 && (
                        <table className="divide-y dark:divide-white/16 w-full overflow-x-auto" data-tut={`${isFreeAgentDisplay ? '-' : '-'}`}>
                            <thead className="bg-off-black overflow-x-auto">
                                <PlayerSelectTableHeader withGap headers={tableHeaders} updateSortDirection={updateSortDirection} />
                            </thead>
                            {availablePlayers && availablePlayers.length > 0 && (
                                <tbody className="bg-black divide-y divide-white/16 overflow-x-auto">
                                    {availablePlayers.map((player: CollapsiblePlayer) => (
                                        <PlayerSelectRow
                                            key={player?.id}
                                            player={player}
                                            setSlideOverOpen={() => {
                                                setSlideOverOpen(true);
                                                clickOnPlayer();
                                            }}
                                            setSelectedPlayer={setSelectedPlayer}
                                            addPlayerToSelection={addPlayerToSelection}
                                            isFreeAgent={isFreeAgentDisplay}
                                            isAddedToRoster={isPlayerAdded(player)}
                                        />
                                    ))}
                                </tbody>
                            )}
                        </table>
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

export default PlayerSelectTable;

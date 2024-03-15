import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { CollapsiblePlayer } from 'src/components/lockerRoom/MobileRosterTable';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';

interface UseTableSort {
    tableHeaders: SortableHeader[];
    players: CollapsiblePlayer[];
    setPlayers: Dispatch<SetStateAction<CollapsiblePlayer[]>>;
    setLastSortedColumn: Dispatch<SetStateAction<SortableHeader>>;
    setSavedDefaultPlayers: Dispatch<SetStateAction<CollapsiblePlayer[]>>;
    updateSortDirection: (columnToSort: SortableHeader) => void;
}

const sortNames = (header: SortableHeader, players: CollapsiblePlayer[]): CollapsiblePlayer[] => {
    return players.sort((playerOne, playerTwo) => {
        switch (header.sortDirection) {
            case SortDirection.ASC:
                return playerOne.full_name.toLowerCase().localeCompare(playerTwo.full_name.toLowerCase());
            case SortDirection.DESC:
                return playerTwo.full_name.toLowerCase().localeCompare(playerOne.full_name.toLowerCase());
            default:
                return 0;
        }
    });
};

const sortWinLossRatio = (header: SortableHeader, players: CollapsiblePlayer[]): CollapsiblePlayer[] => {
    switch (header.sortDirection) {
        case SortDirection.ASC:
            return _.orderBy(players, ['wins', 'losses'], ['asc', 'desc']);
        case SortDirection.DESC:
            return _.orderBy(players, ['wins', 'losses'], ['desc', 'asc']);
        default:
            return players;
    }
};

const sortNumericValues = (header: SortableHeader, players: CollapsiblePlayer[]): CollapsiblePlayer[] =>
    players.sort((playerOne, playerTwo) => {
        switch (header.sortDirection) {
            case SortDirection.ASC:
                return Number(playerOne[header.value] || 0) > Number(playerTwo[header.value] || 0) ? 1 : -1;
            case SortDirection.DESC:
                return Number(playerTwo[header.value] || 0) > Number(playerOne[header.value] || 0) ? 1 : -1;
            default:
                return 0;
        }
    });

const sortPositions = (header: SortableHeader, players: CollapsiblePlayer[]): CollapsiblePlayer[] => {
    const sortIndividualPositions = (positions: string[]): number => {
        const initialPositionOrder = ['G', 'F', 'C'];
        const flattenedPositions = positions.sort((a, b) => initialPositionOrder.indexOf(a) - initialPositionOrder.indexOf(b)).join('');
        const positionOrder = ['G', 'GF', 'F', 'FC', 'C'];
        return positionOrder.indexOf(flattenedPositions);
    };

    return players.sort((playerOne, playerTwo) => {
        switch (header.sortDirection) {
            case SortDirection.ASC:
                return sortIndividualPositions(playerTwo.positions) > sortIndividualPositions(playerOne.positions) ? 1 : -1;
            case SortDirection.DESC:
                return sortIndividualPositions(playerOne.positions) > sortIndividualPositions(playerTwo.positions) ? 1 : -1;
            default:
                return 0;
        }
    });
};

export const useTableSort = (defaultPlayers?: CollapsiblePlayer[], defaultTableHeaderInput?: SortableHeader[]): UseTableSort => {
    const defaultTableHeaders: Array<SortableHeader> = defaultTableHeaderInput?.length
        ? defaultTableHeaderInput
        : [
              { title: 'Player', value: 'name', sortDirection: SortDirection.NONE },
              { title: 'Position', value: 'positions', sortDirection: SortDirection.NONE },
              { title: 'PPG', value: 'ppg', sortDirection: SortDirection.NONE },
              { title: 'RPG', value: 'rpg', sortDirection: SortDirection.NONE },
              { title: 'APG', value: 'apg', sortDirection: SortDirection.NONE },
              { title: 'W/L', value: 'wl', sortDirection: SortDirection.NONE },
          ];
    const [lastSortedColumn, setLastSortedColumn] = useState<SortableHeader | undefined>(undefined);
    const [players, setPlayers] = useState<CollapsiblePlayer[]>(_.cloneDeep(defaultPlayers) || []);
    const [savedDefaultPlayers, setSavedDefaultPlayers] = useState(_.cloneDeep(defaultPlayers) || []);
    const [tableHeaders, setTableHeaders] = useState<SortableHeader[]>(defaultTableHeaders);

    const updateSortDirection = (columnToSort: SortableHeader): void => {
        if (lastSortedColumn === columnToSort) {
            columnToSort.sortDirection = columnToSort.sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;
        } else {
            tableHeaders.forEach((header) => {
                if (header !== columnToSort) {
                    header.sortDirection = SortDirection.NONE;
                }
            });
            columnToSort.sortDirection = SortDirection.DESC;
            setLastSortedColumn(columnToSort);
        }
        setTableHeaders([...tableHeaders]);
    };

    const sortPlayers = (): void => {
        if (!lastSortedColumn || !tableHeaders.some((header) => header.sortDirection !== SortDirection.NONE)) {
            setPlayers([...savedDefaultPlayers]);
            return;
        }
        let tempPlayers = players;
        switch (lastSortedColumn.value) {
            case 'name':
                tempPlayers = sortNames(lastSortedColumn, tempPlayers);
                break;
            case 'positions':
                tempPlayers = sortPositions(lastSortedColumn, tempPlayers);
                break;
            case 'ppg':
            case 'rpg':
            case 'apg':
            case 'spg':
            case 'bpg':
            case 'fpg':
            case 'drpg':
            case 'orpg':
            case 'tpg':
            case 'age':
            case 'star_rating':
            case 'fg_pct':
            case 'ft_pct':
            case 'three_p_pct':
                tempPlayers = sortNumericValues(lastSortedColumn, tempPlayers);
                break;
            case 'wl':
                tempPlayers = sortWinLossRatio(lastSortedColumn, tempPlayers);
                break;
        }
        setPlayers([...tempPlayers]);
    };

    useEffect(() => {
        sortPlayers();
    }, [tableHeaders, lastSortedColumn]);

    return { tableHeaders, players, setPlayers, setSavedDefaultPlayers, setLastSortedColumn, updateSortDirection };
};

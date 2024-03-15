import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';
import { PlayersLeaderboardWithRank } from 'src/pages/stats/[section]';

interface UseTableSort {
    tableHeaders: SortableHeader[];
    players: PlayersLeaderboardWithRank[];
    setPlayers: Dispatch<SetStateAction<PlayersLeaderboardWithRank[]>>;
    updateSortDirection: (columnToSort: SortableHeader) => void;
}

const sortNames = (header: SortableHeader, players: PlayersLeaderboardWithRank[]): PlayersLeaderboardWithRank[] => {
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

const sortWinLossRatio = (header: SortableHeader, players: PlayersLeaderboardWithRank[]): PlayersLeaderboardWithRank[] => {
    switch (header.sortDirection) {
        case SortDirection.ASC:
            return _.orderBy(players, ['wins', 'losses'], ['asc', 'desc']);
        case SortDirection.DESC:
            return _.orderBy(players, ['wins', 'losses'], ['desc', 'asc']);
        default:
            return players;
    }
};

const sortNumericValues = (header: SortableHeader, players: PlayersLeaderboardWithRank[]): PlayersLeaderboardWithRank[] =>
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

const sortPositions = (header: SortableHeader, players: PlayersLeaderboardWithRank[]): PlayersLeaderboardWithRank[] => {
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

export const useLeaderboardPlayersTableSort = (
    defaultPlayers?: PlayersLeaderboardWithRank[],
    defaultTableHeaderInput?: SortableHeader[]
): UseTableSort => {
    const defaultTableHeaders: Array<SortableHeader> = defaultTableHeaderInput?.length
        ? defaultTableHeaderInput
        : [
              { title: 'Rank', value: 'rank', sortDirection: SortDirection.NONE },
              { title: 'Player', value: 'name', sortDirection: SortDirection.NONE },
              { title: 'Position', value: 'positions', sortDirection: SortDirection.NONE },
              { title: 'PPG', value: 'ppg', sortDirection: SortDirection.NONE },
              { title: 'RPG', value: 'rpg', sortDirection: SortDirection.NONE },
              { title: 'APG', value: 'apg', sortDirection: SortDirection.NONE },
              { title: 'W/L', value: 'wl', sortDirection: SortDirection.NONE },
              { title: 'Price', value: 'opensea_price_usd', sortDirection: SortDirection.NONE },
          ];
    const [lastSortedColumn, setLastSortedColumn] = useState<SortableHeader | undefined>(undefined);
    const [players, setPlayers] = useState<PlayersLeaderboardWithRank[]>(defaultPlayers || []);
    const savedDefaultPlayers = defaultPlayers;
    const [tableHeaders, setTableHeaders] = useState<SortableHeader[]>(defaultTableHeaders);

    const updateSortDirection = (columnToSort: SortableHeader): void => {
        if (columnToSort.value === 'rank') return;
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
        if (!lastSortedColumn) return;
        if (!tableHeaders.some((header) => header.sortDirection !== SortDirection.NONE)) {
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
            case 'opensea_price_usd':
            case 'orpg':
            case 'tpg':
            case 'age':
            case 'star_rating':
            case 'fg_pct':
            case 'ft_pct':
            case 'percentage_wins':
            case 'three_p_pct':
                tempPlayers = sortNumericValues(lastSortedColumn, tempPlayers);
                break;
            case 'wl':
                tempPlayers = sortWinLossRatio(lastSortedColumn, tempPlayers);
                break;
        }
        if (lastSortedColumn.sortDirection === 1) {
            setPlayers([...tempPlayers.map((player, index) => ({ ...player, rank: index + 1 }))]);
        } else {
            const playersRanked = [...tempPlayers.reverse().map((player, index) => ({ ...player, rank: index + 1 }))];
            setPlayers(playersRanked.reverse());
        }
    };

    useEffect(() => {
        sortPlayers();
    }, [tableHeaders, lastSortedColumn]);

    useEffect(() => {
        setPlayers(defaultPlayers);
    }, [defaultPlayers]);

    return { tableHeaders, players, setPlayers, updateSortDirection };
};

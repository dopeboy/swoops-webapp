import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { SeasonStatsWithSeason } from 'src/models/player-detail/season-stats';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';

interface UseAllTimeStatsTableSort {
    tableHeaders: SortableHeader[];
    seasonStats: SeasonStatsWithSeason[];
    setSeasonStats: Dispatch<SetStateAction<SeasonStatsWithSeason[]>>;
    setLastSortedColumn: Dispatch<SetStateAction<SortableHeader>>;
    setSavedDefaultStats: Dispatch<SetStateAction<SeasonStatsWithSeason[]>>;
    updateSortDirection: (columnToSort: SortableHeader) => void;
}

const sortWinLossRatio = (header: SortableHeader, seasonStats: SeasonStatsWithSeason[]): SeasonStatsWithSeason[] => {
    switch (header.sortDirection) {
        case SortDirection.ASC:
            return _.orderBy(seasonStats, ['wins', 'losses'], ['asc', 'desc']);
        case SortDirection.DESC:
            return _.orderBy(seasonStats, ['wins', 'losses'], ['desc', 'asc']);
        default:
            return seasonStats;
    }
};

const sortNumericValues = (header: SortableHeader, seasonStats: SeasonStatsWithSeason[]): SeasonStatsWithSeason[] =>
    seasonStats.sort((playerOne, playerTwo) => {
        switch (header.sortDirection) {
            case SortDirection.ASC:
                return Number(playerOne[header.value] || 0) > Number(playerTwo[header.value] || 0) ? 1 : -1;
            case SortDirection.DESC:
                return Number(playerTwo[header.value] || 0) > Number(playerOne[header.value] || 0) ? 1 : -1;
            default:
                return 0;
        }
    });

export const useAllTimeStatsSort = (defaultStats?: SeasonStatsWithSeason[], defaultTableHeaderInput?: SortableHeader[]): UseAllTimeStatsTableSort => {
    const defaultTableHeaders: Array<SortableHeader> = defaultTableHeaderInput?.length
        ? defaultTableHeaderInput
        : [
              { title: 'Season', value: 'name', sortDirection: SortDirection.NONE },
              { title: 'PTS', value: 'ppg', sortDirection: SortDirection.NONE },
              { title: 'FG%', value: 'fg_pct', sortDirection: SortDirection.NONE },
              { title: '3PT%', value: 'three_p_pct', sortDirection: SortDirection.NONE },
              { title: 'FT%', value: 'ft_pct', sortDirection: SortDirection.NONE },
              { title: 'ORB', value: 'orpg', sortDirection: SortDirection.NONE },
              { title: 'DRB', value: 'drpg', sortDirection: SortDirection.NONE },
              { title: 'REB', value: 'rpg', sortDirection: SortDirection.NONE },
              { title: 'AST', value: 'apg', sortDirection: SortDirection.NONE },
              { title: 'STL', value: 'spg', sortDirection: SortDirection.NONE },
              { title: 'BLK', value: 'bpg', sortDirection: SortDirection.NONE },
              { title: 'TO', value: 'tpg', sortDirection: SortDirection.NONE },
              { title: 'PF', value: 'fpg', sortDirection: SortDirection.NONE },
              { title: 'W/L', value: 'wl', sortDirection: SortDirection.NONE },
          ];
    const [lastSortedColumn, setLastSortedColumn] = useState<SortableHeader | undefined>(undefined);
    const [seasonStats, setSeasonStats] = useState<SeasonStatsWithSeason[]>(_.cloneDeep(defaultStats) || []);
    const [savedDefaultStats, setSavedDefaultStats] = useState(_.cloneDeep(defaultStats) || []);
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

    const sortStats = (): void => {
        if (!lastSortedColumn || !tableHeaders.some((header) => header.sortDirection !== SortDirection.NONE)) {
            setSeasonStats([...savedDefaultStats]);
            return;
        }
        let tempSeasonStats = seasonStats;
        switch (lastSortedColumn.value) {
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
                tempSeasonStats = sortNumericValues(lastSortedColumn, tempSeasonStats);
                break;
            case 'wl':
                tempSeasonStats = sortWinLossRatio(lastSortedColumn, tempSeasonStats);
                break;
        }
        setSeasonStats([...tempSeasonStats]);
    };

    useEffect(() => {
        sortStats();
    }, [tableHeaders, lastSortedColumn]);

    return { tableHeaders, seasonStats, setSeasonStats, setSavedDefaultStats, setLastSortedColumn, updateSortDirection };
};

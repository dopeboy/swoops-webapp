import _ from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { CollapsiblePlayer } from 'src/components/lockerRoom/MobileRosterTable';
import { PlayerBoxScore } from 'src/models/player-box-score';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';

interface UseBoxScoreTeamTableSort {
    tableHeaders: SortableHeader[];
    players: { player: CollapsiblePlayer; boxScore: PlayerBoxScore }[];
    setPlayers: Dispatch<SetStateAction<{ player: CollapsiblePlayer; boxScore: PlayerBoxScore }[]>>;
    updateSortDirection: (columnToSort: SortableHeader) => void;
}

const sortMadeVsAttempted = (
    madeStat: string,
    attemptedStat: string,
    sortDirection: SortDirection,
    players: { player: CollapsiblePlayer; boxScore: PlayerBoxScore }[]
): { player: CollapsiblePlayer; boxScore: PlayerBoxScore }[] => {
    switch (sortDirection) {
        case SortDirection.ASC:
            return players.sort((a, b) => {
                if (a.boxScore[attemptedStat] === 0 && b.boxScore[attemptedStat] === 0) {
                    return 0;
                }
                if (a.boxScore[madeStat] > b.boxScore[madeStat]) {
                    return 1;
                }
                if (a.boxScore[madeStat] < b.boxScore[madeStat]) {
                    return -1;
                }
                if (a.boxScore[madeStat] === b.boxScore[madeStat]) {
                    if (a.boxScore[attemptedStat] > b.boxScore[attemptedStat]) {
                        return -1;
                    }
                    if (a.boxScore[attemptedStat] < b.boxScore[attemptedStat]) {
                        return 1;
                    }
                }
                return 0;
            });
        case SortDirection.DESC:
            return players.sort((a, b) => {
                if (a.boxScore[attemptedStat] === 0 && b.boxScore[attemptedStat] === 0) {
                    return 0;
                }
                if (a.boxScore[madeStat] > b.boxScore[madeStat]) {
                    return -1;
                }
                if (a.boxScore[madeStat] < b.boxScore[madeStat]) {
                    return 1;
                }
                if (a.boxScore[madeStat] === b.boxScore[madeStat]) {
                    if (a.boxScore[attemptedStat] > b.boxScore[attemptedStat]) {
                        return 1;
                    }
                    if (a.boxScore[attemptedStat] < b.boxScore[attemptedStat]) {
                        return -1;
                    }
                }
                return 0;
            });
        default:
            return players;
    }
};

export const useBoxScoreTeamTableSort = (defaultPlayers?: { player: CollapsiblePlayer; boxScore: PlayerBoxScore }[]): UseBoxScoreTeamTableSort => {
    const [players, setPlayers] = useState<{ player: CollapsiblePlayer; boxScore: PlayerBoxScore }[]>(defaultPlayers || []);
    const savedDefaultPlayers = _.cloneDeep(defaultPlayers);
    const [tableHeaders, setTableHeaders] = useState<SortableHeader[]>([
        { title: 'Player', value: 'name', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'pts', value: 'pts', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'drb', value: 'drb', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'orb', value: 'orb', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'trb', value: 'trb', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'ast', value: 'ast', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'stl', value: 'stl', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'blk', value: 'blk', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'to', value: 'tov', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'pf', value: 'pf', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'fgm/fga', value: 'fg', sortDirection: SortDirection.NONE, sortable: true },
        { title: '3pm/3pa', value: 'three_p', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'ftm/fta', value: 'ft', sortDirection: SortDirection.NONE, sortable: true },
    ]);

    const updateSortDirection = (columnToSort: SortableHeader): void => {
        const newHeaders = tableHeaders.map((header) => {
            if (header.value === columnToSort.value) {
                if (header.sortDirection === SortDirection.NONE) {
                    header.sortDirection = SortDirection.DESC;
                    if (header.value === 'name') {
                        setPlayers(
                            players.sort((a, b) => (a.player.full_name?.toLowerCase()?.localeCompare(b.player.full_name?.toLowerCase()) ? 1 : -1))
                        );
                    } else if (header.value === 'fg') {
                        setPlayers(sortMadeVsAttempted('fg', 'fga', header.sortDirection, players));
                    } else if (header.value === 'three_p') {
                        setPlayers(sortMadeVsAttempted('three_p', 'three_pa', header.sortDirection, players));
                    } else if (header.value === 'ft') {
                        setPlayers(sortMadeVsAttempted('ft', 'fta', header.sortDirection, players));
                    } else {
                        setPlayers(players.sort((a, b) => (Number(b.boxScore[header.value] || 0) > Number(a.boxScore[header.value] || 0) ? 1 : -1)));
                    }
                } else if (header.sortDirection === SortDirection.DESC) {
                    header.sortDirection = SortDirection.ASC;
                    if (header.value === 'name') {
                        setPlayers(
                            players.sort((a, b) => (a.player.full_name?.toLowerCase()?.localeCompare(b.player.full_name?.toLowerCase()) ? -1 : 1))
                        );
                    } else if (header.value === 'fg') {
                        setPlayers(sortMadeVsAttempted('fg', 'fga', header.sortDirection, players));
                    } else if (header.value === 'three_p') {
                        setPlayers(sortMadeVsAttempted('three_p', 'three_pa', header.sortDirection, players));
                    } else if (header.value === 'ft') {
                        setPlayers(sortMadeVsAttempted('ft', 'fta', header.sortDirection, players));
                    } else {
                        setPlayers(players.sort((a, b) => (Number(a.boxScore[header.value] || 0) > Number(b.boxScore[header.value] || 0) ? 1 : -1)));
                    }
                } else {
                    header.sortDirection = SortDirection.NONE;
                    setPlayers(savedDefaultPlayers);
                }
            } else {
                header.sortDirection = SortDirection.NONE;
                setPlayers(savedDefaultPlayers);
            }
            return header;
        });
        setTableHeaders(newHeaders);
    };

    return { tableHeaders, players, setPlayers, updateSortDirection };
};

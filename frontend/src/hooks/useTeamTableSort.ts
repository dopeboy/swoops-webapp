import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';
import { TeamLeaderboardListingWithRank } from 'src/pages/stats/[section]';

interface UseTeamTableSort {
    tableHeaders: SortableHeader[];
    teams: TeamLeaderboardListingWithRank[];
    setTeams: Dispatch<SetStateAction<TeamLeaderboardListingWithRank[]>>;
    updateSortDirection: (columnToSort: SortableHeader) => void;
}

const sortNames = (header: SortableHeader, teams: TeamLeaderboardListingWithRank[]): TeamLeaderboardListingWithRank[] => {
    return teams.sort((teamOne, teamTwo) => {
        switch (header.sortDirection) {
            case SortDirection.ASC:
                return teamOne.name.toLowerCase().localeCompare(teamTwo.name.toLowerCase());
            case SortDirection.DESC:
                return teamTwo.name.toLowerCase().localeCompare(teamOne.name.toLowerCase());
            default:
                return 0;
        }
    });
};

const sortWinLossRatio = (header: SortableHeader, teams: TeamLeaderboardListingWithRank[]): TeamLeaderboardListingWithRank[] => {
    switch (header.sortDirection) {
        case SortDirection.ASC:
            return _.orderBy(teams, ['l10_wins', 'l10_losses'], ['asc', 'desc']);
        case SortDirection.DESC:
            return _.orderBy(teams, ['l10_wins', 'l10_losses'], ['desc', 'asc']);
        default:
            return teams;
    }
};

const sortNumericValues = (header: SortableHeader, teams: TeamLeaderboardListingWithRank[]): TeamLeaderboardListingWithRank[] =>
    teams.sort((teamOne, teamTwo) => {
        switch (header.sortDirection) {
            case SortDirection.ASC:
                return Number(teamOne[header.value] || 0) > Number(teamTwo[header.value] || 0) ? 1 : -1;
            case SortDirection.DESC:
                return Number(teamTwo[header.value] || 0) > Number(teamOne[header.value] || 0) ? 1 : -1;
            default:
                return 0;
        }
    });

const sortStreak = (header: SortableHeader, teams: TeamLeaderboardListingWithRank[]): TeamLeaderboardListingWithRank[] =>
    teams.sort((teamOne, teamTwo) => {
        switch (header.sortDirection) {
            case SortDirection.ASC:
                if (teamOne?.streak?.toString()?.includes('W') && teamTwo?.streak?.toString()?.includes('W')) {
                    return Number(teamOne?.streak?.toString()?.replace('W', '') || 0) > Number(teamTwo?.streak?.toString()?.replace('W', '') || 0)
                        ? 1
                        : -1;
                } else if (teamOne?.streak?.toString()?.includes('W')) {
                    return 1;
                } else if (teamTwo?.streak?.toString()?.includes('W')) {
                    return -1;
                } else if (teamOne?.streak?.toString()?.includes('L') && teamTwo?.streak?.toString()?.includes('L')) {
                    return Number(teamOne?.streak?.toString()?.replace('L', '') || 0) > Number(teamTwo?.streak?.toString()?.replace('L', '') || 0)
                        ? -1
                        : 1;
                } else if (teamOne?.streak?.toString()?.includes('L')) {
                    return -1;
                } else if (teamTwo?.streak?.toString()?.includes('L')) {
                    return 1;
                } else {
                    return 0;
                }
            case SortDirection.DESC:
                if (teamTwo?.streak?.toString()?.includes('W') && teamOne?.streak?.toString()?.includes('W')) {
                    return Number(teamTwo?.streak?.toString()?.replace('W', '') || 0) > Number(teamOne?.streak?.toString()?.replace('W', '') || 0)
                        ? 1
                        : -1;
                } else if (teamTwo?.streak?.toString()?.includes('W')) {
                    return 1;
                } else if (teamOne?.streak?.toString()?.includes('W')) {
                    return -1;
                } else if (teamTwo?.streak?.toString()?.includes('L') && teamOne?.streak?.toString()?.includes('L')) {
                    return Number(teamTwo?.streak?.toString()?.replace('L', '') || 0) > Number(teamOne?.streak?.toString()?.replace('L', '') || 0)
                        ? -1
                        : 1;
                } else if (teamTwo?.streak?.toString()?.includes('L')) {
                    return -1;
                } else if (teamOne?.streak?.toString()?.includes('L')) {
                    return 1;
                } else {
                    return 0;
                }
            default:
                return 0;
        }
    });

/**
 * This function sorts an array of teams based on multiple criteria. The criteria, in order of precedence, are:
 * 1. total_sp
 * 2. wins
 * 3. win_percentage
 *
 * If the values for a particular criterion are equal between two teams, the function proceeds to the next criterion.
 *
 * @param {SortableHeader} header - An object that contains the sorting direction (ascending or descending).
 * @param {TeamLeaderboardListingWithRankAndHeadToHead[]} teams - The array of teams to sort.
 * @return {TeamLeaderboardListingWithRankAndHeadToHead[]} - The sorted array of teams.
 */
const sortSwooperPoints = (header: SortableHeader, teams: TeamLeaderboardListingWithRank[]): TeamLeaderboardListingWithRank[] =>
    teams.sort((teamOne, teamTwo) => {
        const criteria = ['total_sp', 'wins', 'win_percentage'];

        for (const criterion of criteria) {
            const valueOne = Number(teamOne[criterion]) || 0;
            const valueTwo = Number(teamTwo[criterion]) || 0;

            if (valueOne !== valueTwo) {
                switch (header.sortDirection) {
                    case SortDirection.ASC:
                        return valueOne - valueTwo;
                    case SortDirection.DESC:
                        return valueTwo - valueOne;
                    default:
                        return 0;
                }
            }
        }

        return 0;
    });

export const useTeamTableSort = (defaultPlayers?: TeamLeaderboardListingWithRank[], defaultTableHeaderInput?: SortableHeader[]): UseTeamTableSort => {
    const defaultTableHeaders: Array<SortableHeader> = defaultTableHeaderInput?.length
        ? defaultTableHeaderInput
        : [
              { title: 'Rank', value: 'rank', sortDirection: SortDirection.NONE },
              { title: 'Team', value: 'name', sortDirection: SortDirection.NONE },
              { title: '', value: 'total_sp', sortDirection: SortDirection.DESC },
              { title: 'Wins', value: 'wins', sortDirection: SortDirection.DESC },
              { title: 'Losses', value: 'losses', sortDirection: SortDirection.NONE },
              { title: 'WIN %', value: 'win_percentage', sortDirection: SortDirection.NONE },
              { title: 'L10', value: 'l10', sortDirection: SortDirection.NONE },
              { title: 'Streaks', value: 'streak', sortDirection: SortDirection.NONE },
              { title: 'PPG', value: 'ppg', sortDirection: SortDirection.DESC },
              { title: 'OPP PPG', value: 'opp_ppg', sortDirection: SortDirection.NONE },
              { title: 'Players Owned', value: 'player_count', sortDirection: SortDirection.NONE },
          ];
    const [lastSortedColumn, setLastSortedColumn] = useState<SortableHeader | undefined>(undefined);
    const [teams, setTeams] = useState<TeamLeaderboardListingWithRank[]>(_.cloneDeep(defaultPlayers) || []);
    const savedDefaultTeams = _.cloneDeep(defaultPlayers);
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

    const sortTeams = (): void => {
        if (!lastSortedColumn) return;

        if (!tableHeaders.some((header) => header.sortDirection !== SortDirection.NONE)) {
            setTeams([...savedDefaultTeams]);
            return;
        }
        let tempTeams = teams;
        switch (lastSortedColumn.value) {
            case 'name':
                tempTeams = sortNames(lastSortedColumn, tempTeams);
                break;
            case 'l10':
                tempTeams = sortWinLossRatio(lastSortedColumn, tempTeams);
                break;
            case 'streak':
                tempTeams = sortStreak(lastSortedColumn, tempTeams);
                break;
            case 'total_sp':
                tempTeams = sortSwooperPoints(lastSortedColumn, tempTeams);
                break;
            case 'win_percentage':
            case 'wins':
            case 'losses':
            case 'ppg':
            case 'opp_ppg':
            case 'number_players_owned':
            case 'player_count':
                tempTeams = sortNumericValues(lastSortedColumn, tempTeams);
                break;
        }
        if (lastSortedColumn.sortDirection === 1) {
            setTeams([...tempTeams.map((player, index) => ({ ...player, rank: index + 1 }))]);
        } else {
            const teamsRanked = [...tempTeams.reverse().map((team, index) => ({ ...team, rank: index + 1 }))];
            setTeams(teamsRanked.reverse());
        }
    };

    useEffect(() => {
        sortTeams();
    }, [tableHeaders, lastSortedColumn]);

    return { tableHeaders, teams, setTeams, updateSortDirection };
};

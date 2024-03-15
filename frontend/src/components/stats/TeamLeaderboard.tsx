import { useTeamTableSort } from 'src/hooks/useTeamTableSort';
import { TeamLeaderboardListingWithRank } from 'src/pages/stats/[section]';
import { TeamLeaderboardRow } from './TeamLeaderboardRow';
import { TeamLeaderboardTableHeader } from './TeamLeaderboardTableHeader';

interface TeamLeaderboardProps {
    teams: TeamLeaderboardListingWithRank[];
}
export const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({ teams }) => {
    const { teams: sortedTeams, tableHeaders, updateSortDirection } = useTeamTableSort(teams);
    return (
        <div className="team-leaderboard">
            {teams && (
                <table className="min-w-full max-w-6xl divide-y dark:divide-white/16">
                    <thead className="bg-gray-50 dark:bg-black">
                        <TeamLeaderboardTableHeader headers={tableHeaders} updateSortDirection={updateSortDirection} />
                    </thead>
                    <tbody className="bg-white dark:bg-black divide-y divide-white/16">
                        {sortedTeams && sortedTeams.map((team) => <TeamLeaderboardRow key={team.team_id} team={team} />)}
                    </tbody>
                </table>
            )}
        </div>
    );
};

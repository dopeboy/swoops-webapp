import { ReactElement } from 'react';
import { displayTeamStat } from 'src/lib/utils';
import { TeamLeaderboardListingWithRank } from 'src/pages/stats/[section]';

interface TeamLeaderboardRowProps {
    team: TeamLeaderboardListingWithRank;
}

export const TeamLeaderboardRow: React.FC<TeamLeaderboardRowProps> = ({ team }): ReactElement => {
    const stats = ['wins', 'losses', 'win_percentage', 'l10', 'streak', 'ppg', 'opp_ppg'];

    const goToLockerRoom = (): void => {
        window.open(`/locker-room/${team.team_id}`, '_blank');
    };

    return (
        <tr key={team.team_id} className="hover:cursor-pointer hover:bg-off-black/40 w-full relative h-20" onClick={goToLockerRoom}>
            <td className="pl-12 pr-3 py-4 whitespace-nowrap subheading-two text-center text-gray-500 dark:text-white">{team.rank}</td>
            <td className="px-3 py-4 whitespace-nowrap subheading-two text-center text-gray-500 dark:text-white">{team.name || 'Unnamed'}</td>
            <td className="px-3 py-4 whitespace-nowrap subheading-two text-center text-gray-500 dark:text-white">{team?.total_sp || '0'}</td>
            {stats.map((stat) => (
                <td key={team.team_id + stat} className="px-3 py-4 whitespace-nowrap subheading-two text-center text-gray-500 dark:text-white">
                    {displayTeamStat(stat, team, stat === 'win_percentage' || stat?.includes('game'))}
                </td>
            ))}
            <td className="pl-3 pr-12 py-4 whitespace-nowrap subheading-two text-center text-gray-500 dark:text-white">
                {displayTeamStat('player_count', team, false)}
            </td>
        </tr>
    );
};

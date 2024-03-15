import { ReactElement } from 'react';
import { displaySeasonStats } from 'src/lib/utils';
import { SeasonStatsWithSeason } from 'src/models/player-detail/season-stats';

interface PlayerRowProps {
    seasonStats: SeasonStatsWithSeason;
}

const AllTimeStatsRow: React.FC<PlayerRowProps> = ({ seasonStats }): ReactElement => {
    const stats = ['PPG', 'FG_PCT', 'THREE_P_PCT', 'FT_PCT', 'ORPG', 'DRPG', 'RPG', 'APG', 'SPG', 'BPG', 'TPG', 'FPG', 'W/L'];

    return (
        <tr className="hover:cursor-pointer hover:bg-off-black/40 w-full relative h-20">
            <td className="px-3 py-4 text-[12px] detail-one text-center text-white">{seasonStats?.season ?? ''}</td>
            {stats.map((stat) => (
                <td
                    key={seasonStats?.season + stat}
                    className="px-3 py-4 whitespace-nowrap text-[12px] detail-one text-center text-gray-500 dark:text-white"
                >
                    {displaySeasonStats(stat, seasonStats)}
                </td>
            ))}
        </tr>
    );
};

export default AllTimeStatsRow;

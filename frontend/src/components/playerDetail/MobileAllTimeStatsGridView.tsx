import { playerStatGrid } from 'src/lib/constants';
import { displaySeasonStats } from 'src/lib/utils';
import { SeasonStatsWithSeason } from 'src/models/player-detail/season-stats';
import { PlayerStat } from '../common/PlayerStat';

interface MobileAllTimeStatsGridViewProps {
    seasonStats: SeasonStatsWithSeason;
}
export const MobileAllTimeStatsGridView: React.FC<MobileAllTimeStatsGridViewProps> = ({ seasonStats }) => {
    return (
        <div className="relative flex flex-col px-2 my-1 items-center justify-center w-full">
            <div className="relative flex flex-row h-14 items-center w-full bg-white border-off-black border rounded-md py-3">
                <div className="w-full flex flex-col items-center justify-center">
                    <span className="heading-three text-black">{seasonStats?.season}</span>
                </div>
            </div>
            <div className="grid grid-cols-3 w-full gap-1 mt-2 mb-3">
                {playerStatGrid.map((stat) => (
                    <PlayerStat key={stat.title} statName={stat.title} statValue={displaySeasonStats(stat.value, seasonStats)} />
                ))}
            </div>
        </div>
    );
};

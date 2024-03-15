import { Team } from 'src/lib/api';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { PlayerAverageStat } from './PlayerAverageStat';

interface PlayerAverageStatsProps {
    player: ReadonlyPlayer;
    team: Team;
}
export const PlayerAverageStats: React.FC<PlayerAverageStatsProps> = ({ player, team }) => {
    const getPlayerStat = (stat: string, isPercentage = false): string => {
        if (!player || !player.current_season_stats || !player.current_season_stats[stat]) return '-';
        return isPercentage
            ? (Number(player.current_season_stats[stat]) * 100).toFixed(1)
            : Number(player.current_season_stats[stat]).toFixed(1) ?? '-';
    }; 
    return (
        <div
            className="relative w-full max-w-[1200px] sm:w-full pd-xl:w-[100%] -mt-2.5 rounded-b-xl border-b-2 border-x-2 sm:border-b-4 sm:border-x-4 bg-gradient-to-t from-black/80 to-black/20 grid grid-cols-6 border-assist-green pt-4 pb-1 sm:p-4"
            data-tut="swoopster-stats-game-log"
        >
            <PlayerAverageStat statName="PTS" statValue={getPlayerStat('ppg')} />
            <PlayerAverageStat statName="ORB" statValue={getPlayerStat('orpg')} />
            <PlayerAverageStat statName="DRB" statValue={getPlayerStat('drpg')} />
            <PlayerAverageStat statName="TRB" statValue={getPlayerStat('rpg')} />
            <PlayerAverageStat statName="AST" statValue={getPlayerStat('apg')} />
            <PlayerAverageStat statName="TO" statValue={getPlayerStat('tpg')} />
            <PlayerAverageStat statName="FG%" statValue={getPlayerStat('fg_pct', true)} />
            <PlayerAverageStat statName="3PT%" statValue={getPlayerStat('three_p_pct', true)} />
            <PlayerAverageStat statName="FT%" statValue={getPlayerStat('ft_pct', true)} />
            <PlayerAverageStat statName="STL" statValue={getPlayerStat('spg')} />
            <PlayerAverageStat statName="BLK" statValue={getPlayerStat('bpg')} />
            <PlayerAverageStat statName="PF" statValue={getPlayerStat('fpg')} />
            <div className="col-span-2 flex flex-col gap-0.5 items-center w-full rounded-lg py-2">
                <span className="uppercase text-white subheading-two sm:heading-three lg:heading-two">
                    {`${player?.current_season_stats?.wins || 0} - ${player?.current_season_stats?.losses || 0}` || '-'}
                </span>
                <span className="detail-one sm:subheading-two text-assist-green uppercase">{'W-L'}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-0.5 w-fit items-center sm:w-full rounded-lg pt-2 pb-6image.png sm:py-2 text-white">
                <span className="detail-one w-fit text-center sm:heading-three sm:mb-1 sm:mt-2">{team?.name || '-'}</span>
                <span className="detail-one sm:subheading-two text-assist-green uppercase">Team</span>
            </div>
            <div className="absolute rounded-tl-xl rounded-br-xl detail-one text-[8px] sm:subheading-two -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 bg-assist-green px-3 py-1 sm:py-1.5">
                Current Season Stats
            </div>
        </div>
    );
};

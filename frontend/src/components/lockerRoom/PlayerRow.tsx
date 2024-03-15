import { ReactElement } from 'react';
import { displayPlayerStat, getSortedPositions } from 'src/lib/utils';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { StarRating } from '../common/StarRating';

interface PlayerRowProps {
    player: ReadonlyPlayer;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player }): ReactElement => {
    const stats = ['SZN', 'STAR', 'PPG', 'FG_PCT', 'THREE_P_PCT', 'FT_PCT', 'ORPG', 'DRPG', 'RPG', 'APG', 'SPG', 'BPG', 'TPG', 'FPG', 'W/L'];

    const goToPlayerDetail = (): void => {
        window.open(`/player-detail/${player?.token}/current`, '_blank');
    };

    return (
        <tr key={player.id} className="hover:cursor-pointer hover:bg-off-black/40 w-full relative h-20" onClick={goToPlayerDetail}>
            <td className="px-2 pt-4 whitespace-nowrap w-60">
                <div className="flex items-center">
                    <PlayerAvatar
                        playerToken={player?.token}
                        height={160}
                        width={160}
                        className={'absolute top-2 -left-12 h-40 w-40 clip-player-front-image'}
                    />
                    <div className="relative left-[68px] pb-4">
                        <div className="text-base text-display text-gray-900 uppercase dark:text-white font-semibold">{player?.full_name ?? ''}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                <div className="w-full flex flex-row gap-1 items-center justify-center">
                    {getSortedPositions(player.positions).map((position: string, index: number) => (
                        <span key={position + index}>
                            {position}
                            {index !== player.positions.length - 1 ? ' /' : ''}
                        </span>
                    ))}
                </div>
            </td>
            {stats.map((stat) => (
                <td key={player.id + stat} className="px-3 py-4 whitespace-nowrap text-[12px] detail-one text-center text-gray-500 dark:text-white">
                    {stat !== 'STAR' ? displayPlayerStat(stat, player) : <StarRating rating={player?.star_rating} />}
                </td>
            ))}
        </tr>
    );
};

export default PlayerRow;

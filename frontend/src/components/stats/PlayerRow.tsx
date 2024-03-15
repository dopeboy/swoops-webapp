import { ReactElement } from 'react';
import { getPrice, displayPlayerStat, getSortedPositions } from 'src/lib/utils';
import { StarRating } from '../common/StarRating';
import { PlayersLeaderboardWithRank } from 'src/pages/stats/[section]';

interface PlayerRowProps {
    player: PlayersLeaderboardWithRank;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player }): ReactElement => {
    const stats = ['SZN', 'STAR', 'PPG', 'FG_PCT', 'THREE_P_PCT', 'FT_PCT', 'ORPG', 'DRPG', 'RPG', 'APG', 'SPG', 'BPG', 'TPG', 'FPG', 'W/L', 'W/L%'];

    const goToPlayerDetail = (): void => {
        if (player?.token) {
            window.open(`/player-detail/${player.token}/current`, '_blank');
        }
    };

    return (
        <tr key={player.id} className="hover:cursor-pointer hover:bg-off-black/40 w-full relative h-20">
            <td className="px-6 py-4 whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white heading-three font-bold">
                {player.rank}
            </td>
            <td className="px-2 whitespace-nowrap w-60" onClick={goToPlayerDetail}>
                <div className="flex flex-row gap-1 items-center justify-center">
                    <div className="text-base text-display text-gray-900 uppercase dark:text-white font-semibold">{player?.full_name ?? ''}</div>
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
            <td className="px-6 py-4 whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                <div className="w-full flex flex-row gap-1 items-center justify-center">
                    {player?.opensea_price_usd ? getPrice(player.opensea_price_usd?.toString()) : '-'}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap capitalize font-semibold text-base text-black-500 text-center">
                <div className="w-full">
                    <a
                        href={`https://opensea.io/assets/ethereum/0xc211506d58861857c3158af449e832cc5e1e7e7b/${player.token}`}
                        target="_blank"
                        className="px-12 py-6 subheading-two"
                    >
                        <img src="/images/opensea.png" width={35}></img>
                    </a>
                </div>
            </td>
        </tr>
    );
};

export default PlayerRow;

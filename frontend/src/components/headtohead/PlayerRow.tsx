import { ReactElement } from 'react';
import { getSortedPositions, randomImage } from 'src/lib/utils';
import { ReadonlyPlayer } from 'src/services/PlayerService';

interface PlayerRowPropType {
    player: ReadonlyPlayer;
}

const PlayerRow = (props: PlayerRowPropType): ReactElement => {
    const { player } = props;
    const stats = ['PTS', 'RES', 'AST', 'STL', 'BLK', '+/-'];

    return (
        <tr key={player.id}>
            <td className="px-2 pt-4">
                <div className="flex items-center">
                    <div className="pl-2 flex-shrink-0 h-18 w-18">
                        <img className="h-full rounded-t-100" src={randomImage(player.id)} alt="Player image" />
                    </div>
                    <div className="flex flex-row items-center justify-start gap-2 ml-4 pb-4">
                        <div className="flex flex-col items-start">
                            <div className="text-[16px] text-display text-white font-semibold">{player.full_name ?? ''}</div>
                            <div className="flex flex-row items-center text-[12px] text-display font-semibold text-gray-400">
                                {getSortedPositions(player.positions).map((position: string, index: number) => (
                                    <span key={position + index}>
                                        {position}
                                        {index !== player.positions.length ? '/' : ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <img className="h-4 w-4 text-black" src="/images/my_roster_icon.png" />
                    </div>
                </div>
            </td>
            {stats.map((stat) => (
                <td key={player.id + stat} className="px-6 py-4 whitespace-nowrap heading-four text-gray-500 dark:text-white">
                    {(Math.random() * 100).toFixed(0)}
                </td>
            ))}
        </tr>
    );
};

export default PlayerRow;

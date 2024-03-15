import { ReactElement } from 'react';
import { Player } from 'src/lib/gm/api';

interface PlayerRowPropType {
    player: Player;
}

const PlayerRow = (props: PlayerRowPropType): ReactElement => {
    const { player } = props;
    const stats = ['PTS', 'RES', 'AST', 'STL', 'BLK', '+/-'];

    return (
        <tr key={player.uuid}>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={player.image_url} alt="Player image" />
                    </div>
                    <div className="ml-4">
                        <div className="text-display text-white text-base">{`${player.first_name} ${player.last_name}`}</div>
                        <div className="text-display text-white/64 text-base">Point Guard</div>
                    </div>
                </div>
            </td>
            {stats.map((stat) => (
                <td key={player.uuid + stat} className="px-6 py-4 whitespace-nowrap heading-four text-gray-500 dark:text-white">
                    {(Math.random() * 100).toFixed(0)}
                </td>
            ))}
        </tr>
    );
};

export default PlayerRow;

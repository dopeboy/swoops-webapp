import { ReactElement } from 'react';
import Link from 'next/link';
import { Player } from 'src/lib/gm/api';

interface PlayerRowPropType {
    player: Player;
}

const PlayerRow = (props: PlayerRowPropType): ReactElement => {
    const { player } = props;
    const stats = ['PPG', 'RPG', 'ABG', 'W/L', '+/-'];

    const randomImage = Math.floor(Math.random() * 2) % 2 ? '/images/AvatarPink.png' : '/images/AvatarGreen.png';
    return (
        <tr key={player.uuid}>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={randomImage} alt="Player image" />
                    </div>
                    <div className="ml-4">
                        <Link key={player.uuid} href={`/players/profile/${player.uuid}`}>
                            <a>
                                <div className="text-base text-display text-gray-900 dark:text-white">
                                    {player.first_name + ' ' + player.last_name}
                                </div>
                            </a>
                        </Link>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-base text-display text-gray-500 dark:text-white">Shooting Guard</td>
            {stats.map((stat) => (
                <td key={player.uuid + stat} className="px-6 py-4 whitespace-nowrap text-base heading-three text-gray-500 dark:text-white">
                    {(Math.random() * 100).toFixed(2)}
                </td>
            ))}
        </tr>
    );
};

export default PlayerRow;

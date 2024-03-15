import { ReactElement } from 'react';
import Link from 'next/link';

const fakeGameData = { points: 24, rebounds: 5, assists: 9, steals: 2, blocks: 0, plusminus: 89 };

const PlayerGameRow = (props): ReactElement => {
    const { playerGame } = props;
    const fakeImage = playerGame.gameId % 2 ? '/images/AvatarPink.png' : '/images/AvatarGreen.png';
    return (
        <tr key={playerGame.gameId}>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={fakeImage} alt="Player image" />
                    </div>
                    <div className="ml-4">
                        <Link key={playerGame.gameId} href={`/players/profile/${playerGame.gameId}`}>
                            <a>
                                <div className="text-base text-display dark:text-white">{playerGame.teamName}</div>
                            </a>
                        </Link>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-base text-display text-gray-500 dark:text-white">Shooting Guard</td>
            {Object.values(playerGame.stats).map((stat) => (
                <td className="px-6 py-4 whitespace-nowrap text-base heading-three text-gray-500 dark:text-white">{stat}</td>
            ))}
        </tr>
    );
};

export default PlayerGameRow;

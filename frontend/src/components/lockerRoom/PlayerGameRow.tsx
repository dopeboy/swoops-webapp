import { ReactElement } from 'react';
import classNames from 'classnames';
import { PlayerGame } from 'src/models/player-game';
import { useRouter } from 'next/router';
import moment from 'moment';

interface PlayerGameRowProps {
    game: PlayerGame;
    stats: string[][];
}

const PlayerGameRow: React.FC<PlayerGameRowProps> = ({ game, stats }): ReactElement => {
    const router = useRouter();
    // Only doing head to head matches for now
    const gameTypeImage = '/images/Basketball.svg';

    const goToMatchup = (): void => {
        router.push({ pathname: `/headtohead/${game?.game_id}/joined/matchup` });
    };

    return (
        <tr key={game.game_id} className="hover:cursor-pointer hover:bg-off-black/40" onClick={goToMatchup}>
            <td className="py-4 whitespace-nowrap w-16">
                <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-full w-full" src={gameTypeImage} alt="Game type image" />
                </div>
            </td>
            <td>
                <a>
                    <div className="flex flex-col items-start text-base text-display font-semibold dark:text-white">
                        <span className="text-white">{game.opponent_team_name || 'Unnamed'}</span>
                        {game?.played_at && (
                            <div>
                                <div className="text-base text-white/64 leading-6 capitalize font-bold">
                                    {moment(game?.played_at)?.isSame(moment().clone().subtract(1, 'days').startOf('day'), 'd')
                                        ? 'Yesterday'
                                        : moment(game?.played_at)?.isSame(moment().clone().startOf('day'), 'd')
                                        ? 'Today'
                                        : moment().diff(game?.played_at, 'days') + ' days ago'}
                                </div>
                            </div>
                        )}
                    </div>
                </a>
            </td>
            <td>
                <td className="px-6 flex flex-col items-center py-4 whitespace-nowrap subheading-one text-center text-gray-500 dark:text-white">
                    <div className="flex flex-col items-end">
                        <span>
                            {game.is_lineup_1 ? game.lineup_1_score : game.lineup_2_score} -{' '}
                            {game.is_lineup_1 ? game.lineup_2_score : game.lineup_1_score}
                        </span>
                        <div
                            className={classNames(
                                game.won ? 'bg-assist-green' : 'bg-defeat-red text-white',
                                'rounded-xl whitespace-nowrap uppercase subheading-three text-center w-fit h-fit py-1.5 pb-1 px-2 flex justify-center items-center'
                            )}
                        >
                            {game.won ? 'Win' : 'Loss'}
                        </div>
                    </div>
                </td>
            </td>
            {game?.player_box_score &&
                stats.map((stat) => (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-base heading-three text-gray-500 dark:text-white">
                        {stat.map((individualStat, index) => (
                            <span key={individualStat}>
                                {game.player_box_score[individualStat]}
                                {stat.length > 1 && index < stat.length - 1 && '/'}
                            </span>
                        ))}
                    </td>
                ))}
        </tr>
    );
};

export default PlayerGameRow;

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import { Dispatch, ReactElement, SetStateAction } from 'react';
import { playerGameStatGrid } from 'src/lib/constants';
import { displayPlayerGameStat } from 'src/lib/utils';
import { CollapsiblePlayerGame } from 'src/pages/player-detail/[id]/[section]';
import { PlayerStat } from '../common/PlayerStat';

const gameTypeImage = '/images/Basketball.svg';

interface MobilePlayerGamesTableProps {
    games: CollapsiblePlayerGame[];
    setGames: Dispatch<SetStateAction<CollapsiblePlayerGame[]>>;
}

const MobilePlayerGamesTable: React.FC<MobilePlayerGamesTableProps> = ({ games, setGames }): ReactElement => {
    const router = useRouter();

    const collapsePlayer = (game: CollapsiblePlayerGame) => (): void => {
        setGames((prevPlayers: CollapsiblePlayerGame[]) => {
            return prevPlayers.map((prevGame) => {
                if (prevGame.game_id === game.game_id) {
                    return { ...prevGame, shouldDisplayStats: !prevGame.shouldDisplayStats } as CollapsiblePlayerGame;
                }
                return prevGame;
            });
        });
    };

    return (
        <>
            <div className="sm:hidden flex flex-col w-full bg-black pb-10">
                {games && games.length > 0 && (
                    <div className="mt-2">
                        {games.map((game) => (
                            <div key={game.game_id} className="relative flex flex-col px-2 my-1 items-center justify-center w-full">
                                <div
                                    onClick={collapsePlayer(game)}
                                    className="flex flex-row h-20 items-center w-full bg-black border-off-black border rounded-md py-3"
                                >
                                    <div className="pl-2">
                                        <div className="flex flex-row gap-2 items-center">
                                            <div className="py-4 whitespace-nowrap w-10">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-full w-full" src={gameTypeImage} alt="Game type image" />
                                                </div>
                                            </div>
                                            <div className="pr-3 w-40 flex flex-col">
                                                <div className="uppercase leading-3 text-[9px] subheading-one text-white/64">Opponent</div>
                                                <div className="text-base subheading-one text-[12px] text-display text-white uppercase font-semibold">
                                                    <div className="flex flex-col items-start">{game?.opponent_team_name ?? ''}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pr-4 mt-1.5 w-full flex flex-row items-center justify-between gap-2">
                                        <div className="whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                                            <div className="flex flex-col items-center">
                                                <span className="subheading-one uppercase">PTS</span>
                                                <span className="subheading-two uppercase">
                                                    {displayPlayerGameStat('points', game.player_box_score)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                                            <div className="flex flex-col items-center">
                                                <span className="subheading-one uppercase">FGM/FGA</span>
                                                <span className="subheading-two uppercase">
                                                    {displayPlayerGameStat('field_goals', game.player_box_score)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {!game?.shouldDisplayStats && <ChevronDownIcon className="mt-0.5 text-off-black h-4 w-4" />}
                                {game?.shouldDisplayStats && <ChevronUpIcon className="mt-0.5 text-off-black h-4 w-4" />}
                                {game?.shouldDisplayStats && (
                                    <div className="grid grid-cols-3 w-full gap-1 mt-2 mb-3">
                                        {playerGameStatGrid.map((stat) => (
                                            <PlayerStat
                                                key={stat.title}
                                                statName={stat.title}
                                                statValue={displayPlayerGameStat(stat.value, game.player_box_score)}
                                            />
                                        ))}
                                        <div className="col-span-3">
                                            <button
                                                onClick={() => router.push({ pathname: `/headtohead/${game.game_id}/joined` })}
                                                className="btn-rounded-white heading-three w-full"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {/* No Games found placeholder */}
            </div>
        </>
    );
};

export default MobilePlayerGamesTable;

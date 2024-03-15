import { GameListing, ApiService } from 'src/lib/api';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { getPrice, getUserDetail, isUserLoggedIn } from 'src/lib/utils';
import { useRouter } from 'next/router';
import moment from 'moment';
import { ChipPosition, ColorTheme } from 'src/components/common/button/types';
import Button from 'src/components/common/button/Button';

interface PlayerRowProps {
    game: GameListing;
    currentTeamId: number;
    reloadGames: () => void;
}

const GameRow: React.FC<PlayerRowProps> = ({ currentTeamId, game }) => {
    const router = useRouter();
    const [currentGame, setCurrentGame] = useState<GameListing>();

    const getCurrentTeamFromLineup = () => {
        if (!currentTeamId) {
            return null;
        }

        if (currentGame?.results?.lineup_1_team_id === currentTeamId) {
            return {
                name: currentGame?.results?.lineup_1_team_name,
                id: currentGame?.results?.lineup_1_team_id,
            };
        } else if (currentGame?.results?.lineup_2_team_id === currentTeamId) {
            return {
                name: currentGame?.results?.lineup_2_team_name,
                id: currentGame?.results?.lineup_2_team_id,
            };
        }
    };

    useEffect(() => {
        if (game) {
            setCurrentGame(game);
        }
    }, [game]);

    const getMatchupTeamNames = (): string => {
        const currentTeamFromLineup = getCurrentTeamFromLineup();

        if (currentTeamFromLineup) {
            const opponentTeam =
                currentTeamFromLineup?.id === currentGame?.results?.lineup_1_team_id
                    ? currentGame?.results?.lineup_2_team_name
                    : currentGame?.results?.lineup_1_team_name;
            return `${currentTeamFromLineup.name} vs ${opponentTeam}`;
        }
        return `${currentGame?.results?.lineup_1_team_name} vs ${currentGame?.results?.lineup_2_team_name}`;
    };

    const userIsOwner = (): boolean => {
        return isUserLoggedIn() && getUserDetail()?.team?.id && getUserDetail()?.team?.id === currentTeamId;
    };

    const getMatchupTeamScores = (): string => {
        const currentTeamFromLineup = getCurrentTeamFromLineup();

        if (currentTeamFromLineup) {
            const currentTeamScore =
                currentTeamFromLineup?.id === currentGame?.results?.lineup_1_team_id
                    ? currentGame?.results?.lineup_1_score?.toFixed(0)
                    : currentGame?.results?.lineup_2_score?.toFixed(0);
            const opponentTeamScore =
                currentTeamFromLineup?.id === currentGame?.results?.lineup_1_team_id
                    ? currentGame?.results?.lineup_2_score?.toFixed(0)
                    : currentGame?.results?.lineup_1_score?.toFixed(0);
            return `${currentTeamScore} - ${opponentTeamScore}`;
        }
        return `${currentGame?.results.lineup_1_score.toFixed(0)} - ${currentGame?.results.lineup_2_score.toFixed(0)}`;
    };

    const goToMatchup = (): void => {
        window.open(`/headtohead/${currentGame?.id}/joined/matchup`, '_blank');
    };

    const getMatchupResult = (): boolean => {
        const currentTeamFromLineup = getCurrentTeamFromLineup();

        if (currentTeamFromLineup) {
            const currentTeamScore =
                currentTeamFromLineup?.id === currentGame?.results?.lineup_1_team_id
                    ? currentGame?.results.lineup_1_score
                    : currentGame?.results.lineup_2_score;
            const opponentTeamScore =
                currentTeamFromLineup?.id === currentGame?.results?.lineup_1_team_id
                    ? currentGame?.results.lineup_2_score
                    : currentGame?.results.lineup_1_score;
            return currentTeamScore > opponentTeamScore;
        }
        return currentGame?.results.lineup_1_score > currentGame?.results.lineup_2_score;
    };

    useEffect(() => {
        if (router.isReady) {
            getMatchupTeamNames();
        }
    }, [router.isReady, currentTeamId]);

    const revealGame = async () => {
        const newGame = { ...game };
        newGame.revealed = true;
        setCurrentGame(newGame);
        await ApiService.apiGamePartialUpdate([{ id: currentGame?.id }]);
    };

    return (
        <tr
            key={currentGame?.id}
            onClick={() => {
                if ((userIsOwner() && currentGame?.revealed) || !userIsOwner()) {
                    goToMatchup();
                }
            }}
            className="hover:cursor-pointer hover:hover:bg-off-black/40"
        >
            <td className="pl-2 pr-6 py-4 subheading-three whitespace-nowrap text-base text-display text-gray-500 text-left font-semibold dark:text-white">
                {currentGame?.id}
            </td>
            <td className="pr-6 py-4 subheading-three whitespace-nowrap text-base text-display text-gray-500 text-left font-semibold dark:text-white">
                {getMatchupTeamNames()}
            </td>
            <td
                className={classNames(
                    currentGame?.results && !userIsOwner()
                        ? 'pt-6'
                        : currentGame?.results && userIsOwner() && !currentGame?.revealed
                        ? 'pt-2'
                        : 'pt-6', 
                    'flex flex-col items-center justify-center whitespace-nowrap uppercase subheading-three text-center'
                )}
            >
                <div
                    className={classNames(
                        currentGame?.results && !userIsOwner() ? (getMatchupResult() ? 'bg-assist-green' : 'bg-defeat-red text-white') : '',
                        currentGame?.results && userIsOwner() && currentGame?.revealed
                            ? getMatchupResult()
                                ? 'bg-assist-green'
                                : 'bg-defeat-red text-white'
                            : '',
                        'rounded-xl w-fit h-fit py-1.5 pb-1 px-2 flex justify-center items-center'
                    )}
                >
                    {currentGame?.results && !userIsOwner() ? (
                        getMatchupResult() ? (
                            'Win'
                        ) : (
                            'Loss'
                        )
                    ) : currentGame?.results && userIsOwner() ? (
                        currentGame?.revealed ? (
                            getMatchupResult() ? (
                                'Win'
                            ) : (
                                'Loss'
                            )
                        ) : (
                            <Button
                                className={'text-sm'}
                                colorTheme={ColorTheme.White}
                                onClick={() => goToMatchup()}
                                isLoading={false}
                                chipPosition={ChipPosition.Right}
                            >
                                Watch Game
                            </Button>
                        )
                    ) : (
                        '-'
                    )}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 dark:text-white">
                <div className="text-base leading-6 capitalize font-bold">{getPrice(currentGame?.prize_pool)}</div>
                <div className="text-xs leading-6 text-white/64 font-medium">
                    <span>{'USD'}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap subheading-one text-right text-gray-500 dark:text-white">
                {!userIsOwner() ? getMatchupTeamScores() || '-' : ''}

                {userIsOwner() ? (
                    currentGame?.revealed ? (
                        getMatchupTeamScores() || '-'
                    ) : (
                        <div className="flex -mr-10 justify-end">
                            <Button className={'text-sm'} colorTheme={ColorTheme.White} onClick={revealGame} chipPosition={ChipPosition.Right}>
                                Reveal
                            </Button>
                        </div>
                    )
                ) : (
                    ''
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 dark:text-white">
                {currentGame?.played_at && (
                    <div>
                        <div className="text-base leading-6 capitalize font-bold">
                            {moment(currentGame?.played_at)?.isSame(moment().clone().subtract(1, 'days').startOf('day'), 'd')
                                ? 'Yesterday'
                                : moment(currentGame?.played_at)?.isSame(moment().clone().startOf('day'), 'd')
                                ? 'Today'
                                : moment().diff(currentGame?.played_at, 'days') + ' days ago'}
                        </div>
                        <div className="text-xs leading-6 text-white/64 font-medium">
                            <span>{moment(currentGame?.played_at).format('hh:mma')}</span>
                        </div>
                    </div>
                )}
                {!currentGame?.played_at && (
                    <div className="pr-2">
                        <div className="text-base leading-6 capitalize font-bold">-</div>
                        <div className="text-xs leading-6 text-white/64 font-medium ">
                            <span>-</span>
                        </div>
                    </div>
                )}
            </td>
        </tr>
    );
};

export default GameRow;

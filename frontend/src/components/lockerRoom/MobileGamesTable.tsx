import { ReactElement, useState, useEffect } from 'react';
import { NoGamesFoundPlaceholder } from '../common/NoGamesFoundPlaceholder';
import { TableLoadingSpinner } from '../common/TableLoadingSpinner';
import classNames from 'classnames';
import moment from 'moment';
import { GameListing, ApiService } from 'src/lib/api';
import { getPrice, getUserDetail, isUserLoggedIn } from 'src/lib/utils';

interface MobileGamesTableProps {
    games: GameListing[];
    currentTeamId: number;
    loadingGames: boolean;
    reloadGames?: () => void;
}
export const MobileGamesTable: React.FC<MobileGamesTableProps> = ({ games, currentTeamId, loadingGames, reloadGames }): ReactElement => {

    const [currentGames, setCurrentGames] = useState<GameListing[]>();

    useEffect(() => {
        if (games) {
            setCurrentGames(games);
        }
    }, [games]);

    const getCurrentTeamFromLineup = (game: GameListing) => {
        if (!currentTeamId) {
            return null;
        }

        if (game?.results?.lineup_1_team_id === currentTeamId) {
            return {
                name: game?.results?.lineup_1_team_name,
                id: game?.results?.lineup_1_team_id,
            };
        } else if (game?.results?.lineup_2_team_id === currentTeamId) {
            return {
                name: game?.results?.lineup_2_team_name,
                id: game?.results?.lineup_2_team_id,
            };
        }
    };

    const userIsOwner = (): boolean => {
        return isUserLoggedIn() && getUserDetail()?.team?.id && getUserDetail()?.team?.id === currentTeamId;
    };

    const getMatchupTeamNames = (game: GameListing): string[] => {
        const currentTeamFromLineup = getCurrentTeamFromLineup(game);

        if (currentTeamFromLineup) {
            const opponentTeam =
                currentTeamFromLineup?.id === game?.results?.lineup_1_team_id ? game?.results?.lineup_2_team_name : game?.results?.lineup_1_team_name;
            return [`${currentTeamFromLineup.name}`, 'vs', `${opponentTeam}`];
        }
        return [`${game?.results?.lineup_1_team_name}`, 'vs', `${game?.results?.lineup_2_team_name}`];
    };

    const getMatchupTeamScores = (game: GameListing): string => {
        const currentTeamFromLineup = getCurrentTeamFromLineup(game);

        if (currentTeamFromLineup) {
            const currentTeamScore =
                currentTeamFromLineup?.id === game?.results?.lineup_1_team_id
                    ? game?.results?.lineup_1_score?.toFixed(0)
                    : game?.results?.lineup_2_score?.toFixed(0);
            const opponentTeamScore =
                currentTeamFromLineup?.id === game?.results?.lineup_1_team_id
                    ? game?.results?.lineup_2_score?.toFixed(0)
                    : game?.results?.lineup_1_score?.toFixed(0);
            return `${currentTeamScore} - ${opponentTeamScore}`;
        }
        return `${game?.results.lineup_1_score.toFixed(0)} - ${game?.results.lineup_2_score.toFixed(0)}`;
    };

    const goToMatchup = (game: GameListing): void => {
        window.open(`/headtohead/${game?.id}/joined/matchup`, '_blank');
    };

    const getMatchupResult = (game: GameListing): boolean => {
        const currentTeamFromLineup = getCurrentTeamFromLineup(game);

        if (currentTeamFromLineup) {
            const currentTeamScore =
                currentTeamFromLineup?.id === game?.results?.lineup_1_team_id ? game?.results.lineup_1_score : game?.results.lineup_2_score;
            const opponentTeamScore =
                currentTeamFromLineup?.id === game?.results?.lineup_1_team_id ? game?.results.lineup_2_score : game?.results.lineup_1_score;
            return currentTeamScore > opponentTeamScore;
        }
        return game?.results.lineup_1_score > game?.results.lineup_2_score;
    };

    const revealGame = async (game: GameListing) => {
        const updatedGames = currentGames.map((g) => {
            if (g.id === game.id) {
                return { ...g, revealed: true };
            }
            return g;
        });
        setCurrentGames(updatedGames);
        await ApiService.apiGamePartialUpdate([{ id: game?.id }]);
    };

    return (
        <div className="sm:hidden flex flex-col bg-black pb-12">
            <div className="-my-2 overflow-x-auto">
                <div className="py-2 align-middle inline-block w-full">
                    <div className="shadow sm:rounded-lg divide-y-1 divide-white/64">
                        {currentGames &&
                            currentGames.length > 0 &&
                            !loadingGames &&
                            currentGames?.map((game) => (
                                <div key={game?.id} className="w-full flex flex-col gap-2 pt-2 pb-4 px-2">
                                    <div className="flex flex-col items-center gap-0.5 text-left text-white uppercase subheading-two">
                                        <div className="flex flex-row w-full items-center gap-1.5 justify-center">
                                            <div className="flex flex-row items-center justify-start gap-1">
                                                <span className="subheading-three uppercase">Game ID</span>
                                                <span className="subheading-three">{game?.id}</span>
                                            </div>
                                        </div>
                                        <div className="w-full flex flex-col items-center justify-center gap-1 border border-white/16 rounded-lg p-2">
                                            {getMatchupTeamNames(game).map((text) => (
                                                <span key={text} className="uppercase font-bold">
                                                    {text}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-row items-start justify-between gap-3 px-2 border border-white/16 rounded-lg p-2">
                                        <div className="flex flex-col items-center gap-0.5 text-center text-white uppercase subheading-three">
                                            Result
                                            <div
                                                className={classNames(
                                                    game?.results && !userIsOwner()
                                                        ? getMatchupResult(game)
                                                            ? 'bg-assist-green'
                                                            : 'bg-defeat-red text-white'
                                                        : '',
                                                    game?.results && userIsOwner() && game?.revealed
                                                        ? getMatchupResult(game)
                                                            ? 'bg-assist-green'
                                                            : 'bg-defeat-red text-white'
                                                        : '',
                                                    'rounded-xl detail-one w-fit h-fit py-1.5 pb-1 px-2 flex justify-center items-center'
                                                )}
                                            >
                                                {game?.results && !userIsOwner()
                                                    ? getMatchupResult(game)
                                                        ? 'Win'
                                                        : 'Loss'
                                                    : game?.results && userIsOwner()
                                                    ? game?.revealed
                                                        ? getMatchupResult(game)
                                                            ? 'Win'
                                                            : 'Loss'
                                                        : '-'
                                                    : '-'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 text-end text-white uppercase subheading-three">
                                            Prize Pool
                                            <div className="flex flex-col">
                                                <div className="text-xs capitalize font-bold">{getPrice(game?.prize_pool)}</div>
                                                <div className="text-[8px] text-white/64">
                                                    <span>{'USD'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 text-end text-white uppercase subheading-three">
                                            Score
                                            <div className="text-xs">
                                                {!userIsOwner() ? getMatchupTeamScores(game) || '-' : ''}

                                                {userIsOwner() ? (game?.revealed ? getMatchupTeamScores(game) || '-' : '-') : ''}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 text-end text-white uppercase">
                                            <span className="subheading-three">Date</span>
                                            {game?.played_at && (
                                                <div>
                                                    <div className="capitalize text-[11px] font-bold">
                                                        {moment(game?.played_at)?.isSame(moment().clone().subtract(1, 'days').startOf('day'), 'd')
                                                            ? 'Yesterday'
                                                            : moment(game?.played_at)?.isSame(moment().clone().startOf('day'), 'd')
                                                            ? 'Today'
                                                            : moment().diff(game?.played_at, 'days') + ' days ago'}
                                                    </div>
                                                    <div className="text-[10px] text-white/64">
                                                        <span>{moment(game?.played_at).format('hh:mma')}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {!game?.played_at && (
                                                <div className="pr-2">
                                                    <div className="text-base capitalize font-bold">-</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {((userIsOwner() && game?.revealed && game?.results) || (!userIsOwner() && game?.results)) && (
                                        <button onClick={() => goToMatchup(game)} className="rounded-lg bg-white pt-3 pb-2 subheading-one w-full">
                                            View
                                        </button>
                                    )}
                                    {userIsOwner() && !game?.revealed && game?.results && (
                                        <button onClick={() => goToMatchup(game)} className="rounded-lg bg-white pt-3 pb-2 subheading-one w-full">
                                            Watch Game
                                        </button>
                                    )}
                                    {userIsOwner() && !game?.revealed && game?.results && (
                                        <button
                                            onClick={() => revealGame(game)}
                                            className="rounded-lg bg-assist-green pt-3 pb-2 subheading-one w-full"
                                        >
                                            Reveal
                                        </button>
                                    )}
                                </div>
                            ))}
                        <TableLoadingSpinner loading={loadingGames} />
                        {!loadingGames && (!games || games.length === 0) && <NoGamesFoundPlaceholder />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileGamesTable;

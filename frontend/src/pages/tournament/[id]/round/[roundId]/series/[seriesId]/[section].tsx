import { TrophyIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LayoutDecider } from 'src/components/common/LayoutDecider';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import { TableNavBar } from 'src/components/common/TableNavBar';
import { HeadToHeadBanner } from 'src/components/headtohead/HeadToHeadBanner';
import { HeadToHeadInnerBanner } from 'src/components/headtohead/HeadToHeadInnerBanner';
import MobileHeadToHeadTeamTable from 'src/components/headtohead/MobileHeadToHeadTeamTable';
import { TeamStatsDisplay } from 'src/components/headtohead/TeamStatsDisplay';
import TeamTable from 'src/components/headtohead/TeamTable';
import { CollapsiblePlayer } from 'src/components/lockerRoom/MobileRosterTable';
import { SeriesGameList } from 'src/components/tournaments/series/SeriesGameList';
import { TournamentSeriesHeader } from 'src/components/tournaments/series/TournamentSeriesHeader';
import { useBoxScore } from 'src/hooks/useBoxScore';
import { PlayByPlayBoxScore, PlayByPlayBoxScores } from 'src/hooks/usePlayByPlay';
import { ApiService, Result, TournamentDetail, TournamentLineup, TournamentLineupModel, TournamentSeriesDetail, User } from 'src/lib/api';
import { trackPageLanding } from 'src/lib/tracking';
import { getBestOf, getBestOfAmount, getTeamLogoFinalResolutionPath, getUserDetail } from 'src/lib/utils';
import { PlayerBoxScore } from 'src/models/player-box-score';
import { ReadonlyPlayer } from 'src/services/PlayerService';

const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL || '/';

const SeriesPage: NextPage<{ id: string; roundId: string; seriesId: string }> = ({ id, roundId, seriesId }) => {
    const router = useRouter();
    const { section } = router.query;
    const [loading, setLoading] = useState<boolean>(true);
    const [, setUser] = useState<User>();
    const [firstHeaderColor, setFirstHeaderColor] = useState<string>('');
    const [secondHeaderColor, setSecondHeaderColor] = useState<string>('');
    const [tournament, setTournament] = useState<TournamentDetail>();
    const [serie, setSerie] = useState<TournamentSeriesDetail>();
    const { lineupOnePlayerScores, lineupTwoPlayerScores, game } = useBoxScore(false);
    const [emptyBoxScore, setEmptyBoxScore] = useState<PlayByPlayBoxScores>();
    const [lineupOneBoxScore, setLineupOneBoxScore] = useState<PlayByPlayBoxScore[]>();
    const [lineupTwoBoxScore, setLineupTwoBoxScore] = useState<PlayByPlayBoxScore[]>();
    const [bestOf, setBestOf] = useState<string>('');
    const routesToUse = [
        { title: 'Average Player Stats', path: `/tournament/${id}/round/${roundId}/series/${seriesId}/player-stats`, section: 'player-stats' },
        { title: 'Average Team Stats', path: `/tournament/${id}/round/${roundId}/series/${seriesId}/team-stats`, section: 'team-stats' },
    ];
    const [winner, setWinner] = useState<number>();

    const extractPlayerId = (key: string): number | null => {
        const match = key.match(/player_(\d+)_box_score/);
        return match ? parseInt(match[1], 10) : null;
    };

    const getPlayerBoxScore = (key: string, boxScore: PlayerBoxScore, lineup_1: TournamentLineupModel, lineup_2: TournamentLineupModel): PlayByPlayBoxScore => {
        let player: ReadonlyPlayer | null = null;

        if (key.startsWith('lineup_1_player_')) {
            const playerId = extractPlayerId(key.replace('lineup_1_', ''));
            player = lineup_1[`player_${playerId}`] as ReadonlyPlayer;
        } else if (key.startsWith('lineup_2_player_')) {
            const playerId = extractPlayerId(key.replace('lineup_2_', ''));
            player = lineup_2[`player_${playerId}`] as ReadonlyPlayer;
        }

        return {
            player: player as ReadonlyPlayer,
            boxScore,
        };
    };

    const accumulateLineupStats = (lineupStats: any, playerBoxScore: any): void => {
        const playerId = playerBoxScore.player.id;

        if (!lineupStats[playerId]) {
            lineupStats[playerId] = {};
        }

        Object.entries(playerBoxScore.boxScore).forEach(([statKey, statValue]) => {
            if (!lineupStats[playerId][statKey]) {
                lineupStats[playerId][statKey] = 0;
            }
            lineupStats[playerId][statKey] += statValue as number;
        });
    };

    const getAverageBoxScoresWithPlayerInfo = (games: Result[], lineup_1: TournamentLineupModel, lineup_2: TournamentLineupModel) => {
        const lineupOneStats: { [playerId: number]: PlayerBoxScore } = {};
        const lineupTwoStats: { [playerId: number]: PlayerBoxScore } = {};

        games.forEach((game) => {
            Object.entries(game).forEach(([key, value]) => {
                const playerId = extractPlayerId(key);

                if (playerId === null) {
                    return;
                }

                const playerBoxScore = getPlayerBoxScore(key, value as PlayerBoxScore, lineup_1, lineup_2);

                if (key.startsWith('lineup_1_player_') && key.endsWith('_box_score')) {
                    accumulateLineupStats(lineupOneStats, playerBoxScore);
                } else if (key.startsWith('lineup_2_player_') && key.endsWith('_box_score')) {
                    accumulateLineupStats(lineupTwoStats, playerBoxScore);
                }
            });
        });

        Object.values(lineupOneStats).forEach((stats) => {
            Object.keys(stats).forEach((statKey) => {
                stats[statKey] = parseFloat(((stats[statKey] as number) / games.length).toFixed(1));
            });
        });

        Object.values(lineupTwoStats).forEach((stats) => {
            Object.keys(stats).forEach((statKey) => {
                stats[statKey] = parseFloat(((stats[statKey] as number) / games.length).toFixed(1));
            });
        });

        const lineupOneAverage: PlayByPlayBoxScore[] = Object.entries(lineup_1)
            .filter(([key]) => key.startsWith('player_'))
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([_key, player]) => ({
                player: player as ReadonlyPlayer,
                boxScore: lineupOneStats[(player as ReadonlyPlayer).id],
            }));

        const lineupTwoAverage: PlayByPlayBoxScore[] = Object.entries(lineup_2)
            .filter(([key]) => key.startsWith('player_'))
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([_key, player]) => ({
                player: player as ReadonlyPlayer,
                boxScore: lineupTwoStats[(player as ReadonlyPlayer).id],
            }));

        return {
            lineupOne: lineupOneAverage,
            lineupTwo: lineupTwoAverage,
        };
    };

    const getEmptyBoxScore = (boxScore: PlayByPlayBoxScores): PlayByPlayBoxScores => {
        return {
            lineupOneBoxScore: boxScore?.lineupOneBoxScore?.map((player) => ({
                ...player,
                boxScore: {
                    ast: 0,
                    blk: 0,
                    drb: 0,
                    fg: 0,
                    fg_pct: 0,
                    fga: 0,
                    ft: 0,
                    ft_pct: 0,
                    fta: 0,
                    orb: 0,
                    pf: 0,
                    pts: 0,
                    stl: 0,
                    three_p: 0,
                    three_p_pct: 0,
                    three_pa: 0,
                    tov: 0,
                    trb: 0,
                    two_p: 0,
                    two_p_pct: 0,
                    two_pa: 0,
                },
            })),
            lineupTwoBoxScore: boxScore?.lineupTwoBoxScore?.map((player) => ({
                ...player,
                boxScore: {
                    ast: 0,
                    blk: 0,
                    drb: 0,
                    fg: 0,
                    fg_pct: 0,
                    fga: 0,
                    ft: 0,
                    ft_pct: 0,
                    fta: 0,
                    orb: 0,
                    pf: 0,
                    pts: 0,
                    stl: 0,
                    three_p: 0,
                    three_p_pct: 0,
                    three_pa: 0,
                    tov: 0,
                    trb: 0,
                    two_p: 0,
                    two_p_pct: 0,
                    two_pa: 0,
                },
            })),
        };
    };

    const getInitialData = async (): Promise<void> => {
        const user = getUserDetail();
        setUser(user);
        await getGame();
    };

    const getTextColor = (color: string) => {
        if (color) {
            const c = color.substring(1);
            const rgb = parseInt(c, 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;

            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
            if (luma > 128) {
                return 'text-black';
            } else {
                return 'text-white';
            }
        }
    };

    const getGame = async (): Promise<void> => {
        try {
            // Wait for both the round and series to be queried
            const [tournament, series] = await Promise.all([
                ApiService.apiGameTournamentRead(id as string),
                ApiService.apiGameTournamentRoundSeriesRead(roundId as string, seriesId as string, id as string),
            ]);
            setTournament(tournament);
            setBestOf(getBestOf(tournament, Number(roundId)));
            if (series.id) {
                const newBestOfGames = new Array(getBestOfAmount(tournament, Number(roundId))).fill(null).map((_, index) => {
                    if (index < series?.games.length) {
                        const game = series?.games[index];
                        return {
                            ...game,
                            revealed: false,
                        };
                    }
                    return null;
                });
                setSerie({ ...series, games: [...newBestOfGames] });
                setWinner(getOverallWinner(series.games));
            }
        } catch (err) {
            console.error('Error getting players: ' + err);
        } finally {
            setLoading(false);
        }
    };

    const getRound = (): string => {
        if (!tournament) return '';
        const roundAmount = tournament.rounds.length;
        const roundIndex = tournament.rounds.findIndex((round) => round.id === Number(roundId));
        if (roundIndex === -1) return '';
        return `Round of ${Math.pow(2, roundAmount - roundIndex)}`;
    };

    useEffect(() => {
        if (serie) {
            const filteredSeriesGames = serie.games?.filter(
                (game: any) => game && game.lineup_1_box_score && game.lineup_2_box_score && game.revealed
            );
            if (filteredSeriesGames?.length) {
                const parsedBoxScores = getAverageBoxScoresWithPlayerInfo(
                    serie.games?.filter((game: any) => game && game.lineup_1_box_score && game.lineup_2_box_score && game.revealed),
                    serie.lineup_1,
                    serie.lineup_2
                );
                setLineupOneBoxScore(parsedBoxScores.lineupOne);
                setLineupTwoBoxScore(parsedBoxScores.lineupTwo);
            } else {
                const lineupBoxScores = { lineupOneBoxScore: lineupOnePlayerScores, lineupTwoBoxScore: lineupTwoPlayerScores };
                const emptyBoxScore = getEmptyBoxScore(lineupBoxScores);
                setEmptyBoxScore(emptyBoxScore);
                setLineupOneBoxScore(emptyBoxScore.lineupOneBoxScore);
                setLineupTwoBoxScore(emptyBoxScore.lineupTwoBoxScore);
            }
        }
    }, [serie?.games]);

    useEffect(() => {
        const lineupBoxScores = { lineupOneBoxScore: lineupOnePlayerScores, lineupTwoBoxScore: lineupTwoPlayerScores };
        const emptyBoxScore = getEmptyBoxScore(lineupBoxScores);
        setEmptyBoxScore(emptyBoxScore);
        setLineupOneBoxScore(emptyBoxScore.lineupOneBoxScore);
        setLineupTwoBoxScore(emptyBoxScore.lineupTwoBoxScore);
    }, [lineupOnePlayerScores, lineupTwoPlayerScores]);

    useEffect(() => {
        if (!router.isReady) return;
        trackPageLanding(`Tournament Series`);
        getInitialData();
    }, [router.isReady]);

    const getOverallWinner = (games) => {
        let team_1_wins = 0;
        let team_2_wins = 0;

        for (const game of games) {
            if (game.lineup_1_score > game.lineup_2_score) {
                team_1_wins++;
            } else if (game.lineup_1_score < game.lineup_2_score) {
                team_2_wins++;
            }
        }

        if (team_1_wins > team_2_wins) {
            return 0;
        } else if (team_1_wins < team_2_wins) {
            return 1;
        } else {
            return 2;
        }
    };

    return (
        <PageLoadingWrapper loading={loading}>
            <LayoutDecider>
                {/* Header */}
                {/* Subheader */}
                {/* Content */}
                {serie?.id ? (
                    <>
                        <TournamentSeriesHeader
                            id={id}
                            teamOneName={serie?.team_1?.name}
                            teamTwoName={serie?.team_2?.name}
                            roundText={getRound()}
                            bestOfText={bestOf}
                        />
                        <div className="relative h-full flex flex-col items-center justify-start pb-32 pt-3 gap-6 bg-black">
                            <div className="h-20 inset-0 absolute z-0 bg-off-black" />
                            {/* Banner */}
                            <div className="z-10 max-w-6xl w-full px-2">
                                <HeadToHeadBanner animateHeader={false}>
                                    <HeadToHeadInnerBanner
                                        loading={loading}
                                        won={winner === 0}
                                        teamId={Number(serie?.team_1?.id)}
                                        isFinal={true}
                                        revealScore={
                                            serie?.games?.filter((game: any) => game && game?.revealed)?.length >=
                                            serie?.games?.filter((game) => game && game.lineup_2_box_score && game.lineup_2_box_score)?.length
                                        }
                                        isHeadToHead={false}
                                        animateHeader={false}
                                        teamLogo={
                                            serie?.team_1?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(serie?.team_1?.path)}` : null
                                        }
                                        lineupNumber={1}
                                        teamName={serie?.team_1?.name}
                                        score={serie?.games?.filter((game) => game?.lineup_1_score > game?.lineup_2_score).length.toString()}
                                        headerColor={firstHeaderColor}
                                        headerDefaultColor="#13FF0D"
                                        onColorExtracted={(color: string) => setFirstHeaderColor(color)}
                                        direction="left"
                                    />
                                    <div className="flex col-span-2 md:text-lg md:col-span-1 flex-col md:justify-between md:gap-6 order-3 md:order-2 items-center h-full pt-0">
                                        {/* Tournament Logo */}
                                        <div className="flex flex-col items-center justify-center sm:justify-start">
                                            {/* <div className="w-[200px] sm:w-[280px]">
                                                <Image
                                                    width={280}
                                                    height={100}
                                                    className="aspect-video w-full h-full"
                                                    src="/images/swooper_bowl_logo_text_only.png"
                                                />
                                            </div> */}
                                            <h1 className="text-black heading-three sm:heading-tow text-center mt-4">Series</h1>
                                            <div className="sm:hidden flex flex-row items-center justify-between w-full mt-3 gap-10">
                                                {/* Round information */}
                                                <div className="text-black subheading-one text-left">{getRound()}</div>
                                                <div className="text-black subheading-one text-right">{bestOf}</div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex flex-row items-center justify-between w-full gap-10">
                                            {/* Round information */}
                                            <div className="text-black subheading-one text-left">{getRound()}</div>
                                            <div className="text-black subheading-one text-right">{bestOf}</div>
                                        </div>
                                    </div>
                                    <HeadToHeadInnerBanner
                                        loading={loading}
                                        teamId={Number(serie?.team_2?.id)}
                                        won={winner === 1}
                                        isHeadToHead={false}
                                        isFinal={true}
                                        revealScore={
                                            serie?.games?.filter((game: any) => game && game?.revealed)?.length >=
                                            serie?.games?.filter((game) => game && game.lineup_2_box_score && game.lineup_2_box_score)?.length
                                        }
                                        animateHeader={false}
                                        lineupNumber={2}
                                        teamLogo={
                                            serie?.team_2?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(serie?.team_2?.path)}` : null
                                        }
                                        teamName={serie?.team_2?.name}
                                        score={serie?.games?.filter((game) => game?.lineup_2_score > game?.lineup_1_score).length.toString()}
                                        headerColor={secondHeaderColor}
                                        headerDefaultColor="#4E4E4E"
                                        direction="right"
                                        onColorExtracted={(color: string) => setSecondHeaderColor(color)}
                                    />
                                </HeadToHeadBanner>
                            </div>
                            {/* Game List */}
                            <div className="flex flex-col items-center justify-center px-2 w-full">
                                <SeriesGameList serie={serie} setSerie={setSerie} />
                            </div>
                            {/* Stats Section */}
                            <div className="w-full flex flex-col items-start justify-center max-w-6xl mt-3">
                                <div className="flex flex-col items-start justify-start h-full w-full">
                                    <TableNavBar routesToUse={routesToUse} />
                                    {section !== 'team-stats' && (
                                        <div className="flex flex-col h-full w-full">
                                            <div className="h-full mt-1">
                                                <div className="flex flex-col items-center justify-center w-full h-full">
                                                    <div className="hidden w-full sm:flex flex-row items-center justify-between px-2 pt-2.5 pb-2.5 rounded-t-lg text-black bg-white subheading-three md:subheading-two max-w-screen-7xl">
                                                        <div className="flex flex-row items-center justify-start gap-2 max-w-[50%]">
                                                            {(
                                                                serie?.team_1?.path
                                                                    ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(serie?.team_1?.path)}`
                                                                    : null
                                                            ) ? (
                                                                <img
                                                                    src={`${imageBaseUrl}${getTeamLogoFinalResolutionPath(serie?.team_1?.path)}`}
                                                                    className="aspect-square h-8 w-8 rounded-full"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="flex flex-col items-center justify-center aspect-square h-8 w-8 rounded-full"
                                                                    style={{ backgroundColor: firstHeaderColor }}
                                                                >
                                                                    <TrophyIcon
                                                                        className={classNames('w-5 h-5', getTextColor(firstHeaderColor || '#13FF0D'))}
                                                                    />
                                                                </div>
                                                            )}
                                                            <span>{serie?.team_1?.name}</span>
                                                        </div>
                                                    </div>
                                                    <TeamTable
                                                        shouldAnimate={false}
                                                        hideHeader={true}
                                                        className="border rounded-t-lg"
                                                        teamId={Number(serie?.team_1?.id)}
                                                        gameClock={''}
                                                        teamName={serie?.team_1?.name}
                                                        availablePlayers={
                                                            lineupOneBoxScore?.length > 0 ? lineupOneBoxScore : emptyBoxScore?.lineupOneBoxScore
                                                        }
                                                        addDecimalPlaces={true}
                                                    />
                                                </div>
                                                <div className="flex flex-col items-center justify-center w-full h-full">
                                                    <div className="hidden w-full sm:flex flex-row items-center justify-between px-2 pt-2.5 pb-2.5 rounded-t-lg text-black bg-white subheading-three md:subheading-two">
                                                        <div className="flex flex-row items-center justify-start gap-2 max-w-[50%]">
                                                            {(
                                                                serie?.team_2?.path
                                                                    ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(serie?.team_2?.path)}`
                                                                    : null
                                                            ) ? (
                                                                <img
                                                                    src={`${imageBaseUrl}${getTeamLogoFinalResolutionPath(serie?.team_2?.path)}`}
                                                                    className="aspect-square h-8 w-8 rounded-full"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="flex flex-col items-center justify-center aspect-square h-8 w-8 rounded-full"
                                                                    style={{ backgroundColor: secondHeaderColor }}
                                                                >
                                                                    <TrophyIcon
                                                                        className={classNames(
                                                                            'w-5 h-5',
                                                                            getTextColor(secondHeaderColor || '#4E4E4E')
                                                                        )}
                                                                    />
                                                                </div>
                                                            )}
                                                            <span>{serie?.team_2?.name}</span>
                                                        </div>
                                                    </div>
                                                    <TeamTable
                                                        shouldAnimate={false}
                                                        hideHeader={true}
                                                        className="border-b border-x rounded-b-lg"
                                                        teamId={Number(serie?.team_2?.id)}
                                                        gameClock={''}
                                                        teamName={serie?.team_2?.name}
                                                        availablePlayers={
                                                            lineupTwoBoxScore?.length > 0 ? lineupTwoBoxScore : emptyBoxScore?.lineupTwoBoxScore
                                                        }
                                                        addDecimalPlaces={true}
                                                    />
                                                </div>
                                                <div id="lineupOne"></div>
                                                <MobileHeadToHeadTeamTable
                                                    hideTeamStats={true}
                                                    className="border-b border-x rounded-b-lg"
                                                    teamId={Number(serie?.team_1?.id)}
                                                    teamName={serie?.team_1?.name}
                                                    availablePlayers={
                                                        lineupOneBoxScore?.length > 0
                                                            ? (lineupOneBoxScore as {
                                                                  player: CollapsiblePlayer;
                                                                  boxScore: PlayerBoxScore;
                                                              }[])
                                                            : (emptyBoxScore?.lineupOneBoxScore as {
                                                                  player: CollapsiblePlayer;
                                                                  boxScore: PlayerBoxScore;
                                                              }[])
                                                    }
                                                />
                                                <div id="lineupTwo"></div>
                                                <MobileHeadToHeadTeamTable
                                                    hideTeamStats={true}
                                                    className="border-b border-x rounded-b-lg"
                                                    teamId={Number(serie?.team_2?.id)}
                                                    teamName={serie?.team_2?.name}
                                                    availablePlayers={
                                                        lineupTwoBoxScore?.length > 0
                                                            ? (lineupTwoBoxScore as {
                                                                  player: CollapsiblePlayer;
                                                                  boxScore: PlayerBoxScore;
                                                              }[])
                                                            : (emptyBoxScore?.lineupTwoBoxScore as {
                                                                  player: CollapsiblePlayer;
                                                                  boxScore: PlayerBoxScore;
                                                              }[])
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {section === 'team-stats' && (
                                        <div id="team-stats" className="flex flex-col w-full">
                                            <div className="h-full overflow-auto flex flex-col w-full">
                                                <TeamStatsDisplay
                                                    game={game}
                                                    addDecimalPlaces={true}
                                                    lineupOneName={serie?.team_1?.name}
                                                    lineupTwoName={serie?.team_2?.name}
                                                    firstHeaderColor={firstHeaderColor}
                                                    secondHeaderColor={secondHeaderColor}
                                                    lineupOneBoxScore={lineupOneBoxScore}
                                                    lineupTwoBoxScore={lineupTwoBoxScore}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-6 md:p-12 w-full pl-12 rounded-lg flex items-center justify-center">
                        <div>
                            <img className="hidden sm:inline-block" src="/images/StackedCard.png" width={300} />
                        </div>

                        <div className="flex flex-col">
                            <h1 className="subheading-one sm:heading-two text-white text-left sm:w-96 w-84">Series hasn't started yet</h1>
                        </div>
                    </div>
                )}
            </LayoutDecider>
        </PageLoadingWrapper>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id, roundId, seriesId } = context.query;
    return {
        props: {
            id,
            roundId,
            seriesId,
        },
    };
};

export default SeriesPage;

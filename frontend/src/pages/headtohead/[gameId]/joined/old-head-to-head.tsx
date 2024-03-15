import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { LayoutDecider } from 'src/components/common/LayoutDecider';
import { HeadToHeadHeader } from 'src/components/headtohead/HeadToHeadHeader';
import { EmbeddedNavbarRoute } from 'src/components/common/EmbeddedNavBar';
import MatchupTable from 'src/components/headtohead/MatchupTable';
import TeamTable from 'src/components/headtohead/TeamTable';
import ReverseMatchupTable from 'src/components/headtohead/ReverseMatchupTable';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import { TableNavBar } from 'src/components/common/TableNavBar';
import { ApiService, Lineup, Player, Result, Team, User, Game, Contest } from 'src/lib/api';
import PlayerService, { ReadonlyPlayer } from 'src/services/PlayerService';
import { getUserDetail } from 'src/lib/utils';
import { trackPageLanding } from '../../../../lib/tracking';
import { PlayByPlayTable } from 'src/components/headtohead/PlayByPlayTable';
import { PlayerBoxScore } from 'src/models/player-box-score';
import { Banner } from 'src/components/headtohead/Banner';
import MobileHeadToHeadTeamTable from 'src/components/headtohead/MobileHeadToHeadTeamTable';
import { CollapsiblePlayer } from 'src/components/lockerRoom/MobileRosterTable';
import { HeadToHeadYouLostNotice } from 'src/components/headtohead/HeadToHeadYouLostNotice';
import { HeadToHeadYouWonNotice } from 'src/components/headtohead/HeadToHeadYouWonNotice';
import { HeadToHeadStartingSoonNotice } from 'src/components/headtohead/HeadToHeadStartingSoonNotice';
import { HeadToHeadWaitingForOpponentNotice } from 'src/components/headtohead/HeadToHeadWaitingForOpponentNotice';
import MobileMatchupTable from 'src/components/headtohead/MobileMatchupTable';

const Games = (): ReactElement => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const { section, gameId } = router.query;
    const { isReady } = router;
    const [lineupOnePlayerScores, setLineupOnePlayerScores] = useState<{ player: ReadonlyPlayer; boxScore: PlayerBoxScore }[]>();
    const [lineupTwoPlayerScores, setLineupTwoPlayerScores] = useState<{ player: ReadonlyPlayer; boxScore: PlayerBoxScore }[]>();
    const [user, setUser] = useState<User>();
    const [game, setGame] = useState<Game>();
    const routes: EmbeddedNavbarRoute[] =
        game?.contest.status === Contest.status.COMPLETE
            ? [
                  {
                      path: `/headtohead/${gameId}/joined/boxscore`,
                      section: 'boxscore',
                      title: 'Box Score',
                  },
                  {
                      path: `/headtohead/${gameId}/joined/play-by-play`,
                      section: 'play-by-play',
                      title: 'Play by Play',
                  },
              ]
            : [
                  {
                      path: `/headtohead/${gameId}/joined/matchup`,
                      section: 'matchup',
                      title: 'Matchup',
                  },
              ];

    const getInitialData = async (): Promise<void> => {
        const user = getUserDetail();
        setUser(user);
        await getGame();
    };

    const getGame = async (): Promise<void> => {
        try {
            const gameDB = await ApiService.apiGameRead(gameId.toString());
            setGame(gameDB);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.error('Error getting players: ' + err);
        }
    };

    const convertLineupToPlayers = (lineup: Lineup): ReadonlyPlayer[] => {
        if (lineup) {
            const sortedPlayerKeys: string[] = Object.keys(lineup)
                .filter((key: string) => key.includes('player'))
                .sort((keyOne, keyTwo) => keyOne.toLowerCase().localeCompare(keyTwo.toLowerCase()));
            const players: Player[] = [];
            sortedPlayerKeys.forEach((key: string) => players.push(lineup[key]));
            return players.map(PlayerService.fromBackend);
        }
    };

    const getLineupScore = (lineupNumber: number, result: Result): string => {
        const points = [];
        const playerScores = [];
        if (game) {
            for (let i = 1; i < 6; i++) {
                if (!result || (result?.lineup_1_score === null && result?.lineup_2_score === null)) {
                    const emptyBoxScore = {
                        ast: 0,
                        blk: 0,
                        drb: 0,
                        orb: 0,
                        tov: 0,
                        trb: 0,
                        two_p: 0,
                        two_p_pct: 0,
                        two_pa: 0,
                        three_p: 0,
                        three_p_pct: 0,
                        three_pa: 0,
                        fg_pct: 0,
                        fga: 0,
                        fg: 0,
                        ft_pct: 0,
                        fta: 0,
                        ft: 0,
                        pf: 0,
                        pts: 0,
                        stl: 0,
                    };

                    if (game[`lineup_${lineupNumber}`]) {
                        const player = game[`lineup_${lineupNumber}`][`player_${i}`];
                        playerScores.push({ player, emptyBoxScore });
                        points.push(0);
                    }
                } else {
                    const boxScore = result[`lineup_${lineupNumber}_player_${i}_box_score`];
                    if (boxScore) {
                        const player = game[`lineup_${lineupNumber}`][`player_${i}`];
                        playerScores.push({ player, boxScore });
                        points.push(boxScore.pts);
                    }
                }
            }
        }
        if (lineupNumber === 1) {
            setLineupOnePlayerScores(playerScores);
        } else {
            setLineupTwoPlayerScores(playerScores);
        }
        return points?.reduce((a, b) => a + b, 0).toString();
    };

    const lineup1Won = (): boolean => game?.results?.lineup_1_score > game?.results?.lineup_2_score;
    const lineup2Won = (): boolean => game?.results?.lineup_2_score > game?.results?.lineup_1_score;
    const isFinal = (): boolean => game && game?.contest?.status === 'COMPLETE';
    const userWon = (): boolean =>
        (user?.team?.id === game?.lineup_1?.team?.id && lineup1Won()) || (user?.team?.id === game?.lineup_2?.team?.id && lineup2Won());

    useEffect(() => {
        if (!isReady) return;
        trackPageLanding(`Head-to-head in lobby`);
        getInitialData();
    }, [isReady]);

    useEffect(() => {
        if (game) {
            if (isFinal()) {
                router.push(`/headtohead/${gameId}/joined/boxscore`);
            }
            getLineupScore(1, game.results);
            getLineupScore(2, game.results);
        }
    }, [game]);

    const isUserTeam = (team: Team): boolean => user?.team?.id === team?.id;

    const handleTeamName = (team?: Team): string => {
        return team?.name?.length > 0 ? team?.name : isUserTeam(team) ? 'Your team' : 'Unnamed';
    };

    const userIsOwnerOfEitherTeam = (): boolean => {
        return user?.team?.id !== undefined && (user?.team?.id === game?.lineup_1?.team?.id || user?.team?.id === game?.lineup_2?.team?.id);
    };

    const bannerText = isFinal() ? 'Final' : 'VS';
    return (
        <PageLoadingWrapper loading={loading}>
            <LayoutDecider>
                <div className="h-screen w-full bg-black pb-12">
                    <HeadToHeadHeader date={game?.contest?.played_at} />
                    <Banner
                        bannerText={bannerText}
                        game={game}
                        handleTeamName={handleTeamName}
                        lineup1Won={lineup1Won}
                        lineup2Won={lineup2Won}
                        isFinal={isFinal}
                    />
                    <div className="px-2 sm:px-24">
                        {isFinal() && (
                            <div>
                                {userIsOwnerOfEitherTeam() && userWon() && <HeadToHeadYouWonNotice onClick={() => router.push('/games/open')} />}
                                {userIsOwnerOfEitherTeam() && !userWon() && <HeadToHeadYouLostNotice onClick={() => router.push('/games/open')} />}
                            </div>
                        )}
                        {userIsOwnerOfEitherTeam() && !isFinal() && game?.lineup_1 && game?.lineup_2 && (
                            <HeadToHeadStartingSoonNotice onClick={() => window.location.reload()} />
                        )}
                        {!isFinal() && game?.lineup_1 && !game?.lineup_2 && <HeadToHeadWaitingForOpponentNotice />}
                    </div>
                    <div className="px-2 sm:px-24 mt-20 sm:mt-12">
                        <TableNavBar routesToUse={routes} isGameCompleted={isFinal()} />
                    </div>
                    {section === 'matchup' && (
                        <div className="sm:px-24 flex flex-col sm:flex-row">
                            <MatchupTable
                                lineupNumber={1}
                                teamName={handleTeamName(game?.lineup_1?.team)}
                                availablePlayers={convertLineupToPlayers(game?.lineup_1)}
                            />
                            <ReverseMatchupTable
                                teamName={handleTeamName(game?.lineup_2?.team)}
                                availablePlayers={convertLineupToPlayers(game?.lineup_2)}
                            />
                            <MobileMatchupTable
                                teamName={handleTeamName(game?.lineup_1?.team)}
                                availablePlayers={convertLineupToPlayers(game?.lineup_1) as CollapsiblePlayer[]}
                            />
                            <MobileMatchupTable
                                teamName={handleTeamName(game?.lineup_2?.team)}
                                availablePlayers={convertLineupToPlayers(game?.lineup_2) as CollapsiblePlayer[]}
                            />
                        </div>
                    )}
                    {section === 'boxscore' && (
                        <div className="sm:px-24">
                            <TeamTable
                                shouldAnimate={false}
                                className="border rounded-t-lg"
                                teamId={game?.lineup_1?.team?.id}
                                teamName={handleTeamName(game?.lineup_1?.team)}
                                availablePlayers={lineupOnePlayerScores}
                            />
                            <TeamTable
                                shouldAnimate={false}
                                className="border-b border-x rounded-b-lg"
                                teamId={game?.lineup_2?.team?.id}
                                teamName={handleTeamName(game?.lineup_2?.team)}
                                availablePlayers={lineupTwoPlayerScores}
                            />
                            <MobileHeadToHeadTeamTable
                                className="border-b border-x rounded-b-lg"
                                teamId={game?.lineup_1?.team?.id}
                                teamName={handleTeamName(game?.lineup_1?.team)}
                                availablePlayers={lineupOnePlayerScores as { player: CollapsiblePlayer; boxScore: PlayerBoxScore }[]}
                            />
                            <MobileHeadToHeadTeamTable
                                className="border-b border-x rounded-b-lg"
                                teamId={game?.lineup_2?.team?.id}
                                teamName={handleTeamName(game?.lineup_1?.team)}
                                availablePlayers={lineupTwoPlayerScores as { player: CollapsiblePlayer; boxScore: PlayerBoxScore }[]}
                            />
                        </div>
                    )}
                    {section === 'play-by-play' && (
                        <div className="px-2 sm:px-24">
                            <PlayByPlayTable game={game} />
                        </div>
                    )}
                </div>
            </LayoutDecider>
        </PageLoadingWrapper>
    );
};

export default Games;

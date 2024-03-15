/* eslint-disable @typescript-eslint/no-empty-function */
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import PlayerGamesTable from 'src/components/lockerRoom/PlayerGamesTable';
import PlayerService, { ReadonlyPlayer } from 'src/services/PlayerService';
import { trackPageLanding } from '../../../lib/tracking';
import { LayoutDecider } from 'src/components/common/LayoutDecider';
import { isUserLoggedIn } from 'src/lib/utils';
import LockerRoomHeader from 'src/components/lockerRoom/LockerRoomHeader';
import { ApiService, Team } from 'src/lib/api';
import FourOhFour from '../../../pages/404';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlayerGame } from 'src/models/player-game';
import { LoadingSpinner } from 'src/components/common/LoadingSpinner';
import MobilePlayerGamesTable from 'src/components/playerDetail/MobilePlayerGamesTable';
import { Helmet } from 'react-helmet';
import { useAllTimeStatsSort } from 'src/hooks/useAllTimeStatsSort';
import MobileAllTimeStatsTable from 'src/components/playerDetail/MobileAllTimeStatsTable';
import AllTimeStatsTable from 'src/components/playerDetail/AllTimeStatsTable';
import { SeasonStatsWithSeason } from 'src/models/player-detail/season-stats';
import { TutorialProgress } from 'src/components/common/TutorialProgress';
import dynamic from 'next/dynamic';
import { PlayerBackCard } from 'src/components/playerDetail/PlayerBackCard';
import { PlayerAverageStats } from 'src/components/playerDetail/PlayerAverageStats';

type TourComponent = {
    steps: any[];
    isOpen: boolean;
    showNavigation: boolean;
    maskClassName: string;
    className: string;
    rounded: number;
    accentColor: string;
    showButtons: boolean;
    showCloseButton: boolean;
    onRequestClose: any;
    goToStep: any;
    getCurrentStep: any;
};

const Tour = dynamic<TourComponent>(() => import('reactour'), { ssr: false });

const accentColor = '#13FF0D';

const tourConfig = [
    {
        selector: '[data-tut="player-detail-intro"]',
        content: ({ goTo }) => (
            <div>
                Welcome to the <b>PLAYER DETAIL PAGE </b>.Here you will find a player’s stats for the season, as well as their skill ratings.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(1)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="swoopster-naming"]',
        content: ({ goTo }) => (
            <div>
                Owners have the right to name their Swoopsters. No two Swoopsters can have the same name.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(2)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="name-change-submission"]',
        content: ({ goTo }) => (
            <div>
                Once a <b> NAME CHANGE REQUEST </b> has been submitted and accepted, that Swoopster’s name will be updated everywhere its name is
                shown.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(3)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="swoopster-categories"]',
        content: ({ goTo }) => (
            <div>
                Swoopsters typically fall into one of three positional categories: <b>GUARD</b>, <b>FORWARD</b>, and <b>CENTER</b>. Some of our more
                versatile Swoopsters will have the ability to fill two adjacent positions, such as a <b>GUARD/FORWARD</b>, or a <b>FORWARD/CENTER</b>.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(4)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="swoopster-age-season"]',
        content: ({ goTo }) => (
            <div>
                A Swoopster’s age is represented by the season they are in. A player in their 5thseason is 5-years-old. A Swoopster reveals one skill
                rating per season, which means a 5-year-old Swoopster will have 5 revealed skill ratings.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(5)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="swoopster-attributes"]',
        content: ({ goTo }) => (
            <div>
                Swoopsters are rated from one to five stars — with five being the strongest rating. Though the higher star rating signals a higher
                ceiling and chance of success, five-star players are not guaranteed to have elite-level success nor are one-star players guaranteed to
                have modest careers.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(6)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="swoopster-attributes-all"]',
        content: ({ goTo }) => (
            <div>
                Swoopsters come with 15 skill scores that help determine performance on the court. A new skill score is revealed each season. A
                Swoopster’s top-3 skill scores have a <b className="text-yellow-400">GOLD TROPHY</b> next to them.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(7)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="swoopster-attributes-all"]',
        content: ({ goTo }) => (
            <div>
                At the end of each Swoops season, every Swoopster’s skill scores evolve during an event we call Player Evolution Day. On that day a
                new skill score is revealed.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(8)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="swoopster-stats-game-log"]',
        content: ({ goTo }) => (
            <div>
                You can find your Swoopster's average stats for the current season below their attributes. Also, each Swoopster's game log can be
                found under their player card.
                <button
                    className="subheading-tree btn-rounded-green float-right mt-6"
                    onClick={() => {
                        setTimeout(() => {
                            goTo(9);
                        }, 500);
                    }}
                >
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="locker-room-intro"]',
        position: 'bottom',
        content: ({ goTo }) => (
            <div>
                Let’s head to your <b>LOCKER-ROOM</b>.{' '}
                <b>
                    Please click on <b>LOCKER-ROOM</b> to continue.
                </b>
                {/* <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(8)}>
                    Next
                </button> */}
            </div>
        ),
    },
];

export interface CollapsiblePlayerGame extends PlayerGame {
    shouldDisplayStats: boolean;
}

const mapPlayerGame = (game: any, lineupNumber: number, playerId: number) => {
    const otherLineupNumber = lineupNumber === 1 ? 2 : 1;
    if (game.player_lineup_number === lineupNumber) {
        return {
            game_id: game.id,
            player_id: playerId,
            is_lineup_1: lineupNumber === 1,
            team_id: game.results[`lineup_${lineupNumber}_team_id`],
            team_name: game.results[`lineup_${lineupNumber}_team_name`],
            opponent_team_id: game.results[`lineup_${otherLineupNumber}_team_id`],
            opponent_team_name: game.results[`lineup_${otherLineupNumber}_team_name`],
            game_status: game.status,
            played_at: game.played_at,
            lineup_1_score: game.results?.lineup_1_score,
            lineup_2_score: game.results?.lineup_2_score,
            won: game.results[`lineup_${lineupNumber}_score`] > game.results[`lineup_${otherLineupNumber}_score`],
            player_box_score: game.box_score,
        };
    }
};

const PlayerDetailPage: NextPage<{ query: { id: string; section: string } }> = ({ query }): ReactElement => {
    const router = useRouter();
    const [loadingGames, setLoadingGames] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [player, setPlayer] = useState<ReadonlyPlayer>(null);
    const [userLoggedIn, setUserLoggedIn] = useState<boolean>();
    const [games, setGames] = useState<PlayerGame[]>([]);
    const [error, setError] = useState();
    const [team, setTeam] = useState<Team>();
    const { onboarding } = router.query;
    const { tableHeaders, seasonStats: sortableSeasonStats, updateSortDirection, setSeasonStats } = useAllTimeStatsSort();
    const [totalStats, setTotalStats] = useState<SeasonStatsWithSeason>(undefined);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const getFullSeasonName = (season: string): string => {
        if (season && season.length === 2) {
            const seasonSplit = season.split('');
            return `SSN${seasonSplit[1]}`;
        }
        return season;
    };

    const convertJsonToStatsArray = (json: Record<string, string | null>): SeasonStatsWithSeason[] => {
        if (Object.entries(json).length > 0) {
            const statsArray: Record<string, string | null>[] = [];
            Object.keys(json).forEach((key) => {
                const stat = json[key];
                if (stat && typeof stat === 'object') {
                    const statArray: Record<string, string | null> = {};
                    statArray.season = getFullSeasonName(key);
                    Object.keys(stat).forEach((statKey) => {
                        if (stat) statArray[statKey] = stat[statKey] as string;
                    });
                    statsArray.push(statArray);
                }
            });
            return statsArray;
        }
    };

    const getGames = async (): Promise<void> => {
        try {
            setLoadingGames(true);
            const games = await PlayerService.getPlayerGames(query.id);
            const mappedPlayerGames = [];
            games.forEach((game) => {
                let mappedGame = mapPlayerGame(game, 1, parseInt(query.id));
                if (mappedGame && mappedPlayerGames.findIndex((pg) => pg.game_id === mappedGame.game_id) === -1) {
                    mappedPlayerGames.push(mappedGame);
                } else {
                    mappedGame = mapPlayerGame(game, 2, parseInt(query.id));
                    if (mappedPlayerGames.findIndex((pg) => pg.game_id === mappedGame.game_id) === -1) {
                        mappedPlayerGames.push(mappedGame);
                    }
                }
            });
            setGames(mappedPlayerGames);
            setLoadingGames(false);
        } catch (error) {
            console.error(error);
            setLoadingGames(false);
        }
    };

    const getPlayer = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(undefined);
            const player = await PlayerService.getPlayerByTokenId(query.id);
            setPlayer(player);
            setIsTourOpen(onboarding === 'true');
            try {
                const seasonStats = [...(convertJsonToStatsArray(player.historical_stats) || [])];
                if (player.current_season_stats && Object.entries(player.current_season_stats).length > 0) {
                    seasonStats.push({ season: 'SSN2', ...player.current_season_stats });
                }
                setSeasonStats(seasonStats);
                setTotalStats({ ...player.career_average, season: 'Totals' });
            } catch (error) {
                console.error(error);
            }
            if (playerNameChanged) {
                toast.success('Your Player was succesfully named!');
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setError(err);
            console.error('Error getting player: ' + err);
        }
    };

    const getTeam = async (): Promise<void> => {
        try {
            setError(undefined);
            const team = await ApiService.apiGameTeamRead(Number(player.team));
            setTeam(team);
        } catch (err) {
            console.error('Error getting team' + err);
        }
    };

    useEffect(() => {
        if (!player?.id) return;
        getTeam();
    }, [player]);

    const getInitialData = async (): Promise<void> => {
        await Promise.all([getPlayer(), getGames()]);
    };

    useEffect(() => {
        if (!router.isReady) return;
        trackPageLanding(`Player profile`);
        getInitialData();

        if (onboarding === 'true') {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'scroll';
            };
        }
    }, [router.isReady]);

    const { section, playerNameChanged } = router.query;

    // const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_IMAGE_BASEURL;

    // const imageLoader = ({ src, width, quality }) => {
    //     return `${imageBaseUrl}s1/${src}?w=${width}&q=${quality || 75}&d=${performance.now()}`;
    // };

    useEffect(() => {
        setUserLoggedIn(isUserLoggedIn());
    }, []);

    return (
        <PageLoadingWrapper loading={loading}>
            {isTourOpen && <TutorialProgress currentStep={3} />}
            <Helmet>
                <title> {player?.full_name || 'Player Detail'} | Swoops</title>
            </Helmet>
            {error && <FourOhFour noRedirect />}
            {!error && (
                <LayoutDecider>
                    <LockerRoomHeader
                        title={`${player?.full_name ?? ''}`}
                        teamId={player?.team}
                        playerRename={player?.first_named_on}
                        playerId={query.id}
                        userLoggedIn={userLoggedIn}
                    >
                        <div className="pt-2 pb-4 md:pb-8 md:pt-4 md:px-8 flex flex-col items-center w-full">
                            {/* <Image loader={imageLoader} width={1200} height={675} src={`${query.id}_back_card.png`} className="my-6 w-full h-full" /> */}
                            <PlayerBackCard player={player} withGradient={true} playerImageURL={`${query.id}_no_bg.png`} />
                            <PlayerAverageStats player={player} team={team} />
                        </div>
                    </LockerRoomHeader>

                    {section === 'current' && !loadingGames && (
                        <>
                            <PlayerGamesTable games={games} />
                            <MobilePlayerGamesTable games={games as CollapsiblePlayerGame[]} setGames={setGames} />
                        </>
                    )}
                    {section === 'current' && loadingGames && (
                        <div className="w-full h-60 bg-black flex flex-col items-center justify-center">
                            <LoadingSpinner className="h-8 w-8" bgColor="transparent" fill="white" />
                        </div>
                    )}
                    {section === 'all-time' && !loading && (
                        <>
                            <MobileAllTimeStatsTable
                                teamId={team?.id}
                                tableHeaders={tableHeaders}
                                updateSortDirection={updateSortDirection}
                                seasonStats={sortableSeasonStats}
                                totalStats={totalStats}
                            />
                            <AllTimeStatsTable
                                teamId={team?.id}
                                tableHeaders={tableHeaders}
                                updateSortDirection={updateSortDirection}
                                seasonStats={sortableSeasonStats}
                                totalStats={totalStats}
                            />
                        </>
                    )}
                </LayoutDecider>
            )}
            {Tour && (
                <Tour
                    steps={tourConfig}
                    isOpen={isTourOpen}
                    showNavigation={false}
                    maskClassName="mask"
                    className="helper"
                    showButtons={false}
                    rounded={4}
                    getCurrentStep={(step) => setCurrentStep(step)}
                    accentColor={accentColor}
                    showCloseButton={false}
                    onRequestClose={() => {}}
                    goToStep={currentStep}
                />
            )}
        </PageLoadingWrapper>
    );
};

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const { query } = context;
    return {
        props: { query },
    };
};

export default PlayerDetailPage;

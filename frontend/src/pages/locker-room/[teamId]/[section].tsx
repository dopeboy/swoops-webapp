import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { Team, GameListing, ApiService, TournamentListing } from 'src/lib/api';
import { EducationalModal } from 'src/components/lockerRoom/EducationalModal';
import { getEducationalModalViewed, setEducationalModalViewed } from 'src/lib/utils';
import GamesTable from 'src/components/lockerRoom/GamesTable';
import PlayerService, { ReadonlyPlayer } from 'src/services/PlayerService';
import { TableLoadingSpinner } from 'src/components/common/TableLoadingSpinner';
import { trackPageLanding } from '../../../lib/tracking';
import { NextPage } from 'next';
import { LayoutDecider } from 'src/components/common/LayoutDecider';
import FourOhFour from 'src/pages/404';
import GameService from 'src/services/GameService';
import MobileRosterTable, { CollapsiblePlayer } from 'src/components/lockerRoom/MobileRosterTable';
import MobileTeamRecord from 'src/components/lockerRoom/MobileTeamRecord';
import RosterTable from 'src/components/lockerRoom/RosterTable';
import PlayerRecord from 'src/components/lockerRoom/PlayerRecord';
import LockerRoomHeader from 'src/components/lockerRoom/LockerRoomHeader';
import { useTableSort } from 'src/hooks/useTableSort';
import _ from 'lodash';
import { playerTableHeaders } from 'src/lib/constants';
import MobileGamesTable from 'src/components/lockerRoom/MobileGamesTable';
import TourneyTable from 'src/components/lockerRoom/TourneyTable';
import MobileTourneyTable from 'src/components/lockerRoom/MobileTourneyTable';
import Button from 'src/components/common/button/Button';
import { ChipPosition, ColorTheme } from 'src/components/common/button/types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Helmet } from 'react-helmet';
import { ChallengeList } from 'src/components/lockerRoom/ChallengeList';
import dynamic from 'next/dynamic';
import { TutorialProgress } from 'src/components/common/TutorialProgress';

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
    disableInteraction: boolean;
};

const tourConfig = [
    {
        selector: '[data-tut="locker-room-intros"]',
        content: ({ goTo }) => (
            <div>
                Your <b>LOCKER-ROOM</b> is where you will learn about your team and players. In addition, it’s here where you can name your team and
                add a team logo.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(1)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="submit-team-details"]',
        content: ({ goTo }) => (
            <div>
                Submit your team name and team logo for approval here.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(2)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="current-season-record"]',
        content: ({ goTo }) => (
            <div>
                View your current season record here.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(3)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="challenge-progress"]',
        content: ({ goTo }) => (
            <div>
                Each week you will be able to track your progress towards new in-game challenges. Completing these challenges will earn you{' '}
                <b>SWOOPER POINTS</b>, which determine who qualifies for the <b>SWOOPER POINTS</b>; our end of season, big money tournament.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(4)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="challenge-progress-leaderboard"]',
        position: 'bottom',
        content: ({ goTo }) => (
            <div>
                You can see where your <b>Swooper Points</b> rank against your fellow owners via the <b>LEADERBOARD</b>. At the end of the regular
                season, the top-64 teams by total Swooper Points will qualify for the <b>SWOOPER POINTS</b>.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(5)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="head-to-head-results"]',
        position: 'bottom',
        content: ({ goTo }) => (
            <div>
                You can find your previously entered contest results in the <b>HEAD-TO-HEAD</b> tab.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(6)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="tourney-results"]',
        content: ({ goTo }) => (
            <div>
                You can find your previously entered tournament results in the <b>TOURNEY</b> tab.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(7)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="current-roster-view"]',
        content: ({ goTo }) => (
            <div>
                You can view your current roster, along with their stats from the ongoing season, here.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(8)}>
                    Next
                </button>
            </div>
        ),
    },
    // {
    //     selector: '[data-tut="challenge-progress"]',
    //     content: ({ goTo }) => (
    //         <div>
    //             <b className="subheading-one">Congratulations!</b> <br /> You have reached the end of your Swoops Rookie Training! To graduate your player into a fully-fledged Swoopster, you will need to <b>EARN 1000 SWOOPER POINTS.</b>
    //             <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(8)}>
    //                 Next
    //             </button>
    //         </div>
    //     ),
    // },
    {
        selector: '[data-tut="start-head-to-head"]',
        position: 'bottom',
        stepInteraction: true,
        content: ({ goTo }) => (
            <div>
                Let’s wrap up your new owner training by visiting the <b>HEAD-TO-HEAD</b> lobby. Please select <b>HEAD-TO-HEAD</b> to continue.
            </div>
        ),
    },
];

const Tour = dynamic<TourComponent>(() => import('reactour'), { ssr: false });

const accentColor = '#13FF0D';

const LockerRoom: NextPage = (): ReactElement => {
    const router = useRouter();
    const [games, setGames] = useState<GameListing[]>([]);
    const [tournaments, setTournaments] = useState<TournamentListing[]>([]);
    const [currentTeam, setCurrentTeam] = useState<Team>();
    const [players, setPlayers] = useState<ReadonlyPlayer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userOwnsAnOffchainPlayer, setUserOwnsAnOffchainPlayer] = useState<boolean>(false);
    const [loadingTournaments, setLoadingTournaments] = useState<boolean>(true);
    const [educationalModalOpen, setEducationalModalOpen] = useState<boolean>(false);
    const [areGamesToReveal, setAreGameToReveal] = useState<boolean>(false);
    const [error, setError] = useState<string>();
    const [showPlayerEvolutionBanner] = useState<boolean>(false);
    const [pageGames, setPageGames] = useState<number>(1);
    const [pageTournaments, setPageTournaments] = useState<number>(1);
    const [openChallengeDropdown, setOpen] = useState(true);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [challenges, setChallenges] = useState([
        {
            name: 'play_5_games',
            title: 'Play 5 Games',
            current: 0,
            goal: 5,
            challenge_type: 'DAILY',
            expiration_date: 'EXPIRED',
            sp_reward: 150,
        },
        {
            name: 'win_25_games',
            title: 'Win 25 Games',
            current: 0,
            goal: 25,
            challenge_type: 'WEEKLY',
            expiration_date: 'EXPIRED',
            sp_reward: 300,
        },
        {
            name: 'play_35_matchmade_games',
            title: 'Play 35 Matchmade Games',
            current: 0,
            goal: 35,
            challenge_type: 'WEEKLY',
            expiration_date: 'EXPIRED',
            sp_reward: 150,
        },
        {
            name: 'earn_1000_sp',
            title: 'Earn 1000 Swooper Points',
            current: 0,
            goal: 1000,
            challenge_type: 'TRAINING',
            expiration_date: 'NO_LIMIT',
            // We're using 99999 to mark this as a training challenge
            sp_reward: 99999,
        },
        {
            name: 'rotating_player_three_p',
            title: 'MAKE 350 3 POINTERS BY A SINGLE SWOOPSTER',
            current: 0,
            goal: 350,
            challenge_type: 'ROTATING',
            expiration_date: 'EXPIRED',
            sp_reward: 100,
        },
    ]);
    const { teamId, section, onboarding, showTutorialProgress } = router.query;
    const {
        tableHeaders,
        players: sortablePlayers,
        updateSortDirection,
        setPlayers: setSortablePlayers,
    } = useTableSort(players as CollapsiblePlayer[], _.cloneDeep(playerTableHeaders));

    useEffect(() => {
        setIsLargeScreen(window?.innerWidth > 640);

        const handleResize = () => {
            setIsLargeScreen(window.innerWidth > 640);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const revealAllGames = () => {
        const newGames = [...games];
        setGames(
            newGames.map((game) => {
                const newGame = { ...game };
                newGame.revealed = true;
                return newGame;
            })
        );
    };

    const checkIfUserOwnsAnOffchainPlayer = (players: ReadonlyPlayer[]) => {
        if (players.length === 0) {
            return false;
        }

        const offchainPlayer = players.find((player) => player.kind.toUpperCase() === 'OFF_CHAIN');

        return offchainPlayer !== undefined;
    };

    const getPlayers = async (): Promise<void> => {
        try {
            const players = await PlayerService.getPlayerRoster(Number(teamId));
            setUserOwnsAnOffchainPlayer(checkIfUserOwnsAnOffchainPlayer(players));
            setPlayers(players);
            shouldShowEvolutionBanner();
            setSortablePlayers(players as CollapsiblePlayer[]);
        } catch (err) {
            console.error('Error getting players: ' + err);
        }
    };

    const getGames = async (): Promise<void> => {
        try {
            const gamesResults = await GameService.getGames(currentTeam.id, GameListing.status.COMPLETE, pageGames);
            setPageGames(pageGames + 1);
            const currentGames = [...games, ...gamesResults];
            setAreGameToReveal(currentGames.some((game) => game.revealed === false));
            setGames(currentGames);
            setLoading(false);
        } catch (err) {
            console.error('Error getting games: ' + err);
        }
    };

    const getTournaments = async (): Promise<void> => {
        try {
            const { results: tournamentsResults } = await ApiService.apiGameTeamTournamentsList(currentTeam.id.toString(), pageTournaments);
            setPageTournaments(pageTournaments + 1);
            const currentTournaments = [...tournaments, ...tournamentsResults];
            setTournaments(currentTournaments);
            setLoadingTournaments(false);
        } catch (err) {
            console.error('Error getting tournaments: ' + err);
        }
    };

    const getInitialInfo = async (): Promise<void> => {
        try {
            await Promise.all([getPlayers()]);
            setIsTourOpen(onboarding === 'true');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    };

    const getTeam = async (): Promise<void> => {
        try {
            setError(undefined);
            const team = await ApiService.apiGameTeamRead(Number(teamId));
            setCurrentTeam(team);
            setChallenges((prev) => {
                return prev.map((challenge) => {
                    if (challenge.challenge_type === 'DAILY') {
                        const current = team.played_today || 0;
                        return {
                            ...challenge,
                            current,
                        };
                    } else if (challenge.challenge_type === 'WEEKLY') {
                        if (challenge.name === 'play_35_matchmade_games') {
                            const current = team.mm_games_this_week || 0;
                            return {
                                ...challenge,
                                current,
                            };
                        } else if (challenge.name === 'win_25_games') {
                            const current = team.won_this_week || 0;
                            return {
                                ...challenge,
                                current,
                            };
                        }
                    } else if (challenge.challenge_type === 'TRAINING') {
                        const current = team.total_sp || 0;
                        return {
                            ...challenge,
                            current,
                        };
                    } else if (challenge.challenge_type === 'ROTATING') {
                        const current = team.rotating_player_three_p || 0;
                        return {
                            ...challenge,
                            current,
                        };
                    } else {
                        return challenge;
                    }
                });
            });
            setLoadingTournaments(true);
            getTournaments();
        } catch (err) {
            console.error('Error getting team' + err);
        }
    };

    useEffect(() => {
        if (!currentTeam?.id) return;
        getInitialInfo();
    }, [currentTeam?.id]);

    useEffect(() => {
        if (!router.isReady) return;
        if (!getEducationalModalViewed()) {
            // setEducationalModalOpen(true);
            // setEducationalModalViewed();
        }
        getTeam();

        if (onboarding === 'true') {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'scroll';
            };
        }
        trackPageLanding(`Roster`);
    }, [router.isReady]);

    useEffect(() => {
        if (currentTeam?.id && section === 'tourney') {
            setPageTournaments(1);
            setTournaments([]);
            setLoadingTournaments(true);
            getTournaments();
        }

        if (section === 'games') {
            setPageGames(1);
            setGames([]);
            getGames();
            setLoading(true);
        }
    }, [currentTeam, section]);

    const shouldShowEvolutionBanner = () => {
        // const currentTime = new Date().getTime();
        // const showEvolutionBannerDate = new Date('2023-05-16T11:00:00Z').getTime();
        // const remainingDayTimeToShowBanner = showEvolutionBannerDate - currentTime;
        // if (remainingDayTimeToShowBanner < 0) {
        //     setShowPlayerEvolutionBanner(true);
        // }
    };

    return (
        <>
            <Helmet>
                <title> {currentTeam?.name || 'Locker Room'} | Swoops</title>
            </Helmet>
            {showTutorialProgress && <TutorialProgress currentStep={4} />}
            {error && <FourOhFour />}
            {!error && (
                <LayoutDecider>
                    <div className="dark">
                        <LockerRoomHeader
                            loadingRequest={loading}
                            areGamesToReveal={areGamesToReveal}
                            title="Locker Room"
                            teamId={currentTeam?.id}
                            subtitle={currentTeam?.name}
                            reloadGames={revealAllGames}
                        >
                            <>
                                {showPlayerEvolutionBanner && (
                                    <>
                                        <div className="hidden sm:flex p-6 mt-6 md:p-4 w-full pl-4 from-black/32 to-black border border-assist-green rounded-lg items-center justify-center gap-12">
                                            <div>
                                                <img className="hidden sm:inline-block" src="../../../images/StackedCard2.png" width={200} />
                                            </div>

                                            <div className="flex flex-col sm:w-1/3 w-84">
                                                <h1 className="subheading-one sm:heading-one text-white text-left">New Players Stats</h1>
                                                <span className="text-base text-gray-400 text-left">
                                                    Your players are developing and their stats are updating based on their performance. New stats are
                                                    revealed every season.
                                                </span>
                                            </div>
                                            {players.find((player) => player.token >= 0 && player.token < 3000) ? (
                                                <Button
                                                    chipPosition={ChipPosition.Right}
                                                    colorTheme={ColorTheme.AssistGreen}
                                                    onClick={() => router.push(`/player-evolution/${teamId}`)}
                                                >
                                                    View New Stats
                                                </Button>
                                            ) : (
                                                <a
                                                    href="https://opensea.io/collection/swoops"
                                                    target="_blank"
                                                    className="hidden md:block btn-rounded-white btn-text-one"
                                                >
                                                    Add players
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex sm:hidden p-6 mt-6 md:p-4 w-full pl-4 from-black/32 to-black border border-assist-green rounded-lg items-center flex-col justify-center gap-4 bg-assist-green/40">
                                            <div className="flex flex-row justify-space-around">
                                                <div>
                                                    <img src="../../../images/StackedCard2.png" width={250} />
                                                </div>

                                                <div className="flex">
                                                    <h1 className="heading-two text-white text-left">New Players Stats</h1>
                                                </div>
                                            </div>
                                            <span className="text-base text-white text-left">
                                                Your players are developing and their stats are updating based on their performance. New stats are
                                                revealed every season.
                                            </span>
                                            {players.find((player) => player.token >= 0 && player.token < 3000) ? (
                                                <Button
                                                    className="text-base"
                                                    chipPosition={ChipPosition.Right}
                                                    colorTheme={ColorTheme.AssistGreen}
                                                    onClick={() => router.push(`/player-evolution/${teamId}`)}
                                                >
                                                    View New Stats
                                                </Button>
                                            ) : (
                                                <a
                                                    href="https://opensea.io/collection/swoops"
                                                    target="_blank"
                                                    className="hidden md:block btn-rounded-white btn-text-one"
                                                >
                                                    Add players
                                                </a>
                                            )}
                                        </div>
                                    </>
                                )}
                                {isLargeScreen ? <PlayerRecord team={currentTeam} /> : <MobileTeamRecord team={currentTeam} />}

                                <ChallengeList
                                    challenges={challenges}
                                    userOwnsAnOffchainPlayer={userOwnsAnOffchainPlayer}
                                    openChallengeDropdown={openChallengeDropdown}
                                    setOpen={setOpen}
                                />
                            </>
                        </LockerRoomHeader>
                        {/* <div>
                            <Button colorTheme={ColorTheme.AssistGreen} onClick={() => {}} isLoading={false} chipPosition={ChipPosition.Right} />
                        </div> */}
                        <div className="dark">
                            {section === 'roster' && !loading && (
                                <>
                                    {!isLargeScreen ? (
                                        <MobileRosterTable
                                            teamId={currentTeam?.id}
                                            tableHeaders={tableHeaders}
                                            updateSortDirection={updateSortDirection}
                                            availablePlayers={sortablePlayers as CollapsiblePlayer[]}
                                            setAvailablePlayers={setSortablePlayers}
                                        />
                                    ) : (
                                        <RosterTable
                                            teamId={currentTeam?.id}
                                            tableHeaders={tableHeaders}
                                            updateSortDirection={updateSortDirection}
                                            players={sortablePlayers as CollapsiblePlayer[]}
                                        />
                                    )}
                                </>
                            )}
                            {section === 'games' && !loading && (
                                <>
                                    <InfiniteScroll dataLength={games.length} next={getGames} hasMore={true} loader={<h4></h4>}>
                                        <GamesTable games={games} currentTeamId={currentTeam?.id} loadingGames={loading} reloadGames={getGames} />
                                        <MobileGamesTable
                                            games={games}
                                            currentTeamId={currentTeam?.id}
                                            loadingGames={loading}
                                            reloadGames={getGames}
                                        />
                                    </InfiniteScroll>
                                </>
                            )}
                            {section === 'tourney' && !loading && (
                                <>
                                    <InfiniteScroll dataLength={tournaments.length} next={getTournaments} hasMore={true} loader={<h4></h4>}>
                                        <TourneyTable loadingTournaments={loadingTournaments} tournaments={tournaments} />
                                        <MobileTourneyTable loadingTournaments={loadingTournaments} tournaments={tournaments} />
                                    </InfiniteScroll>
                                </>
                            )}
                            <TableLoadingSpinner loading={loading} />
                        </div>
                    </div>
                    <EducationalModal open={educationalModalOpen} setOpen={(openValue: boolean) => setEducationalModalOpen(openValue)} />
                    {Tour && (
                        <Tour
                            steps={tourConfig}
                            isOpen={isTourOpen}
                            showNavigation={false}
                            maskClassName="mask"
                            className="helper"
                            disableInteraction={true}
                            showButtons={false}
                            rounded={4}
                            getCurrentStep={(step) => setCurrentStep(step)}
                            accentColor={accentColor}
                            showCloseButton={false}
                            onRequestClose={() => {}}
                            goToStep={currentStep}
                        />
                    )}
                </LayoutDecider>
            )}
        </>
    );
};

export default LockerRoom;

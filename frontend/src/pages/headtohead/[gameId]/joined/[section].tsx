import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LayoutDecider } from 'src/components/common/LayoutDecider';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import { NextPage } from 'next';
import { HeadToHeadBanner } from 'src/components/headtohead/HeadToHeadBanner';
import { HeadToHeadInnerBanner } from 'src/components/headtohead/HeadToHeadInnerBanner';
import { HeadToHeadPlayByPlayList } from 'src/components/headtohead/HeadToHeadPlayByPlayList';
import TeamTable from 'src/components/headtohead/TeamTable';
import MobileHeadToHeadTeamTable from 'src/components/headtohead/MobileHeadToHeadTeamTable';
import { ApiService, Game, Lineup, Player, User, AccountsService } from 'src/lib/api';
import { getTeamLogoFinalResolutionPath, getUserDetail } from 'src/lib/utils';
import { CollapsiblePlayer } from 'src/components/lockerRoom/MobileRosterTable';
import { PlayerBoxScore } from 'src/models/player-box-score';
import { trackEvent, trackPageLanding } from 'src/lib/tracking';
import { PlayByPlayBoxScore, PlayByPlayBoxScores, ProgressiveQuarters, usePlayByPlay } from 'src/hooks/usePlayByPlay';
import { useBoxScore } from 'src/hooks/useBoxScore';
import { PlayByPlaySpeedControls } from 'src/components/headtohead/PlayByPlaySpeedControls';
import classNames from 'classnames';
import { HeadToHeadHeader } from 'src/components/headtohead/HeadToHeadHeader';
import MatchupTable from 'src/components/headtohead/MatchupTable';
import PlayerService, { ReadonlyPlayer } from 'src/services/PlayerService';
import MobileMatchupTable from 'src/components/headtohead/MobileMatchupTable';
import { HeadToHeadMiddleBanner } from 'src/components/headtohead/HeadToHeadMiddleBanner';
import { getSecondsFromGameClock, handleTeamName } from 'src/lib/playByPlayUtils';
import { ArrowDownIcon, ArrowUpIcon, TrophyIcon } from '@heroicons/react/24/solid';
import _ from 'lodash';
import { TableNavBar, TableNavBarRoute } from 'src/components/common/TableNavBar';
import { Helmet } from 'react-helmet';
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

const Tour = dynamic<TourComponent>(() => import('reactour'), { ssr: false });

const accentColor = '#13FF0D';

const tourConfig = [
    {
        selector: '[data-tut="welcome-page"]',
        content: ({ goTo }) => (
            <div>
                Welcome to the <b>HEAD-TO-HEAD MATCHUP</b> page. All contests are run through our proprietary simulator and typically provide results
                within only a few minutes.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(1)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="watch-contest"]',
        stepInteraction: true,
        content: ({ goTo }) => (
            <div>
                You can either watch the simulation play out at your own speed, by clicking the WATCH button, or skip straight to revealing the
                results, by clicking REVEAL.
                <b> Please select WATCH to continue.</b>
                {/* <button disabled className="subheading-tree btn-rounded-green float-right mt-6 disabled" onClick={() => goTo(2)}>
                    Next
                </button> */}
            </div>
        ),
    },
    {
        selector: '[data-tut="navigate-quarters"]',
        stepInteraction: true,
        content: ({ goTo }) => (
            <div>
                The quarter toggles allow you to skip ahead to the part of the game you want to watch. Let’s jump ahead to the 4th quarter.
                <b> Please select Q4 to continue.</b>
                {/* <button disabled className="subheading-tree btn-rounded-green float-right mt-6 disabled" onClick={() => goTo(3)}>
                    Next
                </button> */}
            </div>
        ),
    },
    {
        selector: '[data-tut="speed-control"]',
        stepInteraction: true,
        content: ({ goTo }) => (
            <div>
                The speed toggles allow one to speed-up or slow-down the play-by-play. <b>Please select 3X to continue.</b>
                {/* <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(4)}>
                    Next
                </button> */}
            </div>
        ),
    },
    {
        selector: '[data-tut="play-by-play-navigation"]',
        content: ({ goTo }) => (
            <div>
                As the game progresses, the play-by-play will take you through each moment of the action.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(5)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="stats-display"]',
        content: ({ goTo }) => (
            <div>
                Both player & team stats will rack up as the game goes on.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(6)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="game-summary"]',
        content: ({ goTo, close }) => (
            <div>
                Looks like we have a close one on our hands, let’s tune in for these closing minutes! Good luck!
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(7)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="complete-game"]',
        position: [800, 150],
        content: ({ goTo, close }) => (
            <div>
                <b>Watch and wait for the game to finish to continue.</b>
                {/* <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => close()}>
                    Next
                </button> */}
            </div>
        ),
    },
    {
        selector: '[data-tut="center"]',
        stepInteraction: true,
        content: ({ goTo }) => (
            <div>
                What a game! Your Swoopster really put the team on their back in a big moment!
                <button
                    className="subheading-tree btn-rounded-green float-right mt-6"
                    onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                        setTimeout(() => {
                            goTo(9);
                        }, 300);
                    }}
                >
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="start-head-to-head"]',
        stepInteraction: true,
        content: ({ goTo }) => (
            <div>
                You are off to a great start! Let’s go get in another game! Please select <b> HEAD-TO-HEAD </b> in the top white bar to continue.
            </div>
        ),
    },
    // {
    //     selector: '[data-tut="add-lineup-detail-previo"]',
    //     stepInteraction: true,
    //     content: ({ goTo }) => (
    //         <div>
    //             Select <b> VIEW</b> to continue.
    //             {/* <button disabled className="subheading-tree btn-rounded-green float-right mt-6 disabled" onClick={() => goTo(9)}>
    //                 Next
    //             </button> */}
    //         </div>
    //     ),
    // },
    // {
    //     selector: '[data-tut="add-lineup-detail"]',
    //     stepInteraction: true,
    //     content: ({ goTo }) => (
    //         <div>
    //             Select <b> VIEW DETAIL </b> to continue.
    //             {/* <button disabled className="subheading-tree btn-rounded-green float-right mt-6 disabled" onClick={() => goTo(9)}>
    //                 Next
    //             </button> */}
    //         </div>
    //     ),
    // },
];

const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL;

const HeadToHeadPage: NextPage = () => {
    const router = useRouter();
    const { gameId, playerTokenForOverwrite, onboarding } = router.query;
    const [user, setUser] = useState<User>();
    const [loading, setLoading] = useState<boolean>(true);
    const [firstHeaderColor, setFirstHeaderColor] = useState<string>('');
    const [secondHeaderColor, setSecondHeaderColor] = useState<string>('');
    const [revealScore, setRevealScore] = useState<boolean>(false);
    const [goToPbPButtonVisible, setGoToPbpButtonVisible] = useState<boolean>(false);
    const [goToPlayerStatsButtonVisible, setGoToPlayerStatsButtonVisible] = useState<boolean>(true);
    const [emptyBoxScore, setEmptyBoxScore] = useState<PlayByPlayBoxScores>();
    const [lineupOneBoxScore, setLineupOneBoxScore] = useState<PlayByPlayBoxScore[]>();
    const [lineupTwoBoxScore, setLineupTwoBoxScore] = useState<PlayByPlayBoxScore[]>();
    const [animateHeader, setAnimateHeader] = useState<boolean>(false);
    const [showWatchButton, setShowWatchButton] = useState<boolean>(true);
    const [rangeValue, setRangeValue] = useState<number>(0);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [progressiveQuartersRange, setProgressiveQuartersRange] = useState<ProgressiveQuarters>();
    const { lineupOnePlayerScores, lineupTwoPlayerScores, game, setGame, isFinal } = useBoxScore(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const {
        currentQuarter,
        shouldAnimate,
        isPaused,
        playByPlayData,
        playTotalAmount,
        setIsPaused,
        setBoxScore,
        progressiveQuarters,
        getEmptyBoxScore,
        speed,
        setSpeed,
        skipAnimation,
        setCurrentQuarter,
        setGame: setPlayByPlayGame,
    } = usePlayByPlay();
    const [selectedSection, setSelectedSection] = useState('player-stats');

    const statSectionHeader: TableNavBarRoute[] = [
        {
            title: 'Player Stats',
            path: `/headtohead/${gameId}/joined/player-stats`,
            section: 'player-stats',
        },
        {
            title: 'Team Stats',
            path: `/headtohead/${gameId}/joined/team-stats`,
            section: 'team-stats',
        },
    ];

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

    const getTeamBoxScoreSum = (lineup: PlayByPlayBoxScore[], stat: string): string => {
        const statSum = lineup?.reduce((accumulator, { boxScore }) => {
            if (boxScore && boxScore[stat]) {
                return accumulator + boxScore[stat];
            }
            return accumulator;
        }, 0);
        return statSum ? Math.round(Number(statSum))?.toFixed(0) : '0';
    };

    const evaluateStatWinner = (stat: string): string => {
        const lineupOneStat = Number(getTeamBoxScoreSum(lineupOneBoxScore, stat));
        const lineupTwoStat = Number(getTeamBoxScoreSum(lineupTwoBoxScore, stat));
        if (stat === 'pf' || stat === 'tov') {
            if (lineupOneStat < lineupTwoStat) {
                return 'lineupOne';
            } else if (lineupOneStat > lineupTwoStat) {
                return 'lineupTwo';
            } else {
                return 'tie';
            }
        } else if (lineupOneStat > lineupTwoStat) {
            return 'lineupOne';
        } else if (lineupOneStat < lineupTwoStat) {
            return 'lineupTwo';
        } else {
            return 'tie';
        }
    };

    useEffect(() => {
        const listener = () => {
            window.scrollY > (window.innerWidth > 390 ? 404 : 534) ? setAnimateHeader(true) : setAnimateHeader(false);
            window.scrollY < 965 ? setGoToPlayerStatsButtonVisible(true) : setGoToPlayerStatsButtonVisible(false);
            window.scrollY >= 965 ? setGoToPbpButtonVisible(true) : setGoToPbpButtonVisible(false);
        };
        window.addEventListener('scroll', listener);
        return () => {
            window.removeEventListener('scroll', listener);
        };
    }, []);

    const getInitialData = async (): Promise<void> => {
        const user = getUserDetail();
        setUser(user);
        await getGame();
    };

    const getGame = async (): Promise<void> => {
        try {
            const gameDB = await ApiService.apiGameRead(gameId.toString(), playerTokenForOverwrite && parseInt(playerTokenForOverwrite as string));
            setGame(gameDB);
            setPlayByPlayGame(gameDB);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.error('Error getting players: ' + err);
        }
    };

    useEffect(() => {
        if (!router.isReady) return;
        trackPageLanding(`Head-to-head`);
        getInitialData();
        setIsTourOpen(onboarding === 'true');

        if (onboarding === 'true') {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'scroll';
            };
        }
    }, [router.isReady]);

    useEffect(() => {
        if (progressiveQuarters.Q4.finished) {
            if (onboarding === 'true') {
                if (isLargeScreen) {
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                }

                setTimeout(() => {
                    setCurrentStep(8);
                    setIsTourOpen(true);
                }, 1000);
            }
            setRevealScore(true);
        }
    }, [progressiveQuarters.Q4]);

    const lastQuarter = (): string => {
        if (progressiveQuarters.Q4.finished && rangeValue !== 0) {
            if (
                progressiveQuartersRange.Q1.plays?.length === progressiveQuarters.Q1.plays?.length &&
                progressiveQuartersRange.Q2.plays?.length === progressiveQuarters.Q2.plays?.length &&
                progressiveQuartersRange.Q3.plays?.length === progressiveQuarters.Q3.plays?.length
            ) {
                return 'Q4';
            } else if (
                progressiveQuartersRange.Q1.plays?.length === progressiveQuarters.Q1.plays?.length &&
                progressiveQuartersRange.Q2.plays?.length === progressiveQuarters.Q2.plays?.length
            ) {
                return 'Q3';
            } else if (progressiveQuartersRange.Q1.plays?.length === progressiveQuarters.Q1.plays?.length) {
                return 'Q2';
            } else {
                return 'Q1';
            }
        } else if (progressiveQuarters.Q1.finished && progressiveQuarters.Q2.finished && progressiveQuarters.Q3.finished) {
            return 'Q4';
        } else if (progressiveQuarters.Q1.finished && progressiveQuarters.Q2.finished) {
            return 'Q3';
        } else if (progressiveQuarters.Q1.finished) {
            return 'Q2';
        } else {
            return 'Q1';
        }
    };

    const filterPlaysByNumber = (playsObject, number) => {
        let totalPlays = 0;
        for (const key in playsObject) {
            totalPlays += playsObject[key].plays.length;
        }
        if (number >= totalPlays) {
            return playsObject; // no filtering necessary
        }
        let remainingPlays = number;
        for (const key in playsObject) {
            const plays = playsObject[key].plays;
            if (remainingPlays > plays.length) {
                remainingPlays -= plays.length;
            } else {
                setCurrentQuarter(key);
                playsObject[key].plays = plays.slice(plays.length - remainingPlays, plays.length - 1);
                break;
            }
        }
        return playsObject;
    };

    const getLastQuarterGameClock = () => {
        if (progressiveQuarters.Q4.finished && rangeValue !== 0) {
            return rangeValue === playTotalAmount ? '0:00' : progressiveQuartersRange[currentQuarter].plays?.[0]?.gameclock || '9:00';
        } else {
            return progressiveQuarters.Q4.finished ? '0:00' : progressiveQuarters[lastQuarter()].plays?.[0]?.gameclock || '9:00';
        }
    };

    const handleScore = (game: Game, lineupNumber: number): string => {
        if (revealScore && isFinal() && game?.results?.lineup_1_score && game?.results?.lineup_2_score && rangeValue === playTotalAmount) {
            return lineupNumber === 1 ? game?.results?.lineup_1_score.toString() : game?.results?.lineup_2_score.toString();
        } else if (revealScore && isFinal() && game?.results?.lineup_1_score && game?.results?.lineup_2_score && rangeValue !== playTotalAmount) {
            return lineupNumber === 1
                ? progressiveQuartersRange[currentQuarter].plays.at(0)?.challenger_score?.toString()
                : progressiveQuartersRange[currentQuarter].plays.at(0)?.challenged_score?.toString();
        } else if (
            !revealScore &&
            progressiveQuarters[currentQuarter]?.plays &&
            progressiveQuarters[currentQuarter]?.plays?.length &&
            progressiveQuarters[currentQuarter]?.plays?.at(0)
        ) {
            return lineupNumber === 1
                ? progressiveQuarters[lastQuarter()].currentScores.challenger_score?.toString()
                : progressiveQuarters[lastQuarter()].currentScores?.challenged_score?.toString();
        }
    };
    // Map each stat in box score to have a changed stat key
    const mapChangedStats = (boxScore: PlayByPlayBoxScore[], previousBoxScore: PlayByPlayBoxScore[]): PlayByPlayBoxScore[] => {
        // Map each stat in box score to have a changed stat key
        return boxScore.map((playerBoxScore: PlayByPlayBoxScore) => {
            const previousPlayerBoxScore = previousBoxScore.find((p) => p.player.id === playerBoxScore.player.id);
            const changedStats = Object.keys(playerBoxScore.boxScore).reduce((acc, stat) => {
                return {
                    ...acc,
                    [stat]:
                        previousPlayerBoxScore?.boxScore[stat] !== undefined
                            ? previousPlayerBoxScore?.boxScore[stat] !== playerBoxScore.boxScore[stat]
                            : false,
                };
            }, {});
            return {
                ...playerBoxScore,
                changedStats,
            };
        });
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

    const getBoxScore = (lineupNumber: number, index: number): PlayByPlayBoxScore[] => {
        let boxScore;
        if (revealScore || rangeValue !== 0) {
            boxScore =
                progressiveQuartersRange[lastQuarter()]?.plays?.[index]?.progressiveBoxScore?.[`lineup${lineupNumber === 1 ? 'One' : 'Two'}BoxScore`];
        } else {
            boxScore =
                progressiveQuarters[lastQuarter()]?.plays?.[index]?.progressiveBoxScore?.[`lineup${lineupNumber === 1 ? 'One' : 'Two'}BoxScore`];
        }
        return boxScore || emptyBoxScore?.[`lineup${lineupNumber === 1 ? 'One' : 'Two'}BoxScore`];
    };

    const getAvailablePlayers = (lineupNumber: number): PlayByPlayBoxScore[] => {
        const currentBoxScore = getBoxScore(lineupNumber, 0);
        const previousBoxScore = getBoxScore(lineupNumber, 1);
        if (currentBoxScore && previousBoxScore) {
            return mapChangedStats(currentBoxScore, previousBoxScore);
        } else {
            return currentBoxScore;
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

    const userIsOwnerOfEitherTeam = (): boolean => {
        return user?.team?.id !== undefined && (user?.team?.id === game?.lineup_1?.team?.id || user?.team?.id === game?.lineup_2?.team?.id);
    };
    const lineup1Won = (): boolean => game?.results?.lineup_1_score > game?.results?.lineup_2_score;
    const lineup2Won = (): boolean => game?.results?.lineup_2_score > game?.results?.lineup_1_score;

    useEffect(() => {
        if (lineupOnePlayerScores && lineupTwoPlayerScores) {
            const lineupBoxScores = { lineupOneBoxScore: lineupOnePlayerScores, lineupTwoBoxScore: lineupTwoPlayerScores };
            setBoxScore(lineupBoxScores);
            setEmptyBoxScore(getEmptyBoxScore(lineupBoxScores));
        }
    }, [lineupOnePlayerScores, lineupTwoPlayerScores]);

    const scrollIntoPlayerStats = (id = 'lineupOne') => {
        trackEvent('Head-to-head page - Scroll into player stats');
        const playerStats = document.getElementById(id);
        if (playerStats) {
            playerStats.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollIntoPbP = () => {
        trackEvent('Head-to-head page - Scroll into play by play');
        const pbp = document.getElementById('play-by-play');
        if (pbp) {
            pbp.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (lastQuarter() === 'Q4' && getSecondsFromGameClock(getLastQuarterGameClock()) < 24) {
            // Set speed to 1x if we are in the last 24 seconds of the game
            if (isTourOpen) {
                setSpeed(200);
            } else {
                setSpeed(2000);
            }
        }
    }, [progressiveQuarters[lastQuarter()]?.plays?.length]);

    useEffect(() => {
        if (progressiveQuarters[currentQuarter]?.plays?.length) {
            setLineupOneBoxScore(getAvailablePlayers(1));
            setLineupTwoBoxScore(getAvailablePlayers(2));
        }
    }, [progressiveQuarters[currentQuarter]?.plays?.length, progressiveQuartersRange?.[currentQuarter]?.plays?.length]);

    useEffect(() => {
        setProgressiveQuartersRange(progressiveQuarters);
    }, [progressiveQuarters]);

    useEffect(() => {
        if (onboarding === 'true') {
            if (currentStep === 7) {
                document.body.style.overflow = 'auto';
            } else if (currentStep === 8) {
                document.body.style.overflow = 'hidden';
                setTimeout(() => {
                    if (isLargeScreen) {
                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    }
                }, 200);
            } else {
                document.body.style.overflow = 'hidden';
            }
        }
    }, [currentStep]);

    return (
        <PageLoadingWrapper loading={loading}>
            {isTourOpen && <TutorialProgress currentStep={2} />}
            <Helmet>
                <title>
                    {game?.lineup_1?.team?.id && game?.lineup_2?.team?.id ? `${game?.lineup_1?.team?.name} vs ${game?.lineup_2?.team?.name}` : 'Game'}
                    | Swoops
                </title>
            </Helmet>
            {!onboarding && (
                <div
                    className={classNames(
                        'md:hidden z-60 fixed bottom-8 bg-white font-bold rounded-lg shadow-lg uppercase px-3 py-2 flex flex-row items-center gap-2',
                        {
                            'w-[95%] right-2.5': userIsOwnerOfEitherTeam() && goToPlayerStatsButtonVisible && selectedSection !== 'team-stats',
                            'right-8': !userIsOwnerOfEitherTeam() || goToPbPButtonVisible || selectedSection === 'team-stats',
                        }
                    )}
                >
                    {goToPlayerStatsButtonVisible && selectedSection !== 'team-stats' && (
                        <div className="flex flex-row w-full items-center justify-between">
                            {userIsOwnerOfEitherTeam() && (
                                <button
                                    onClick={() => scrollIntoPlayerStats('lineupOne')}
                                    className="flex flex-row items-center justify-start gap-2 uppercase"
                                >
                                    <ArrowDownIcon className="h-5 w-5 text-black" />
                                    {user?.team?.id === game?.lineup_1?.team?.id && <span>My stats</span>}
                                    {user?.team?.id !== game?.lineup_1?.team?.id && <span>Opponent stats</span>}
                                </button>
                            )}
                            {userIsOwnerOfEitherTeam() && (
                                <button
                                    onClick={() => scrollIntoPlayerStats('lineupTwo')}
                                    className="flex flex-row items-center justify-start gap-2 uppercase"
                                >
                                    {user?.team?.id === game?.lineup_2?.team?.id && <span>My stats</span>}
                                    {user?.team?.id !== game?.lineup_2?.team?.id && <span>Opponent stats</span>}
                                    <ArrowDownIcon className="h-5 w-5 text-black" />
                                </button>
                            )}
                            {!userIsOwnerOfEitherTeam() && !onboarding && (
                                <button onClick={() => scrollIntoPlayerStats()} className="flex flex-row items-center justify-start gap-2 uppercase">
                                    <ArrowDownIcon className="h-5 w-5 text-black" />
                                    <span>Go to Stats</span>
                                </button>
                            )}
                        </div>
                    )}
                    {goToPlayerStatsButtonVisible && selectedSection === 'team-stats' && (
                        <>
                            <button
                                onClick={() => scrollIntoPlayerStats('team-stats')}
                                className="flex flex-row items-center justify-start gap-2 uppercase"
                            >
                                <ArrowDownIcon className="h-5 w-5 text-black" />
                                <span>Go to Team Stats</span>
                            </button>
                        </>
                    )}
                    {goToPbPButtonVisible && !onboarding && (
                        <button onClick={() => scrollIntoPbP()} className="flex flex-row items-center justify-start gap-2 uppercase">
                            <ArrowUpIcon className="h-5 w-5 text-black" />
                            <span>Go To Plays</span>
                        </button>
                    )}
                </div>
            )}
            <LayoutDecider>
                <div
                    data-tut="complete-game"
                    className="h-screen w-full flex flex-col items-center bg-black pb-12 banner-head-to-head [overflow-anchor:none]"
                >
                    <div
                        className={classNames('flex flex-col items-center w-full space-y-6 px-3 sm:px-24 pb-12', {
                            'mt-[420px] md:mt-[303px]': animateHeader,
                        })}
                    >
                        {!animateHeader && <HeadToHeadHeader date={game?.contest?.played_at} />}
                        <HeadToHeadBanner animateHeader={animateHeader}>
                            <HeadToHeadInnerBanner
                                teamId={game?.lineup_1?.team?.id}
                                loading={loading}
                                won={lineup1Won()}
                                isFinal={isFinal()}
                                revealScore={revealScore || progressiveQuarters.Q4.finished}
                                animateHeader={animateHeader}
                                teamLogo={
                                    game?.lineup_1?.team?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_1?.team?.path)}` : null
                                }
                                lineupNumber={1}
                                teamName={handleTeamName(user, game?.lineup_1?.team)}
                                score={handleScore(game, 1)}
                                headerColor={firstHeaderColor}
                                headerDefaultColor="#13FF0D"
                                onColorExtracted={(color: string) => setFirstHeaderColor(color)}
                                direction="left"
                            />
                            <HeadToHeadMiddleBanner
                                user={user}
                                animateHeader={animateHeader}
                                revealScore={revealScore}
                                isFinal={isFinal()}
                                lastQuarter={lastQuarter()}
                                lastQuarterGameClock={getLastQuarterGameClock()}
                                showWatchButton={showWatchButton}
                                loading={loading}
                                isOwnerOfEitherTeam={userIsOwnerOfEitherTeam()}
                                progressiveQuarters={revealScore || rangeValue !== 0 ? progressiveQuartersRange : progressiveQuarters}
                                game={game}
                                skipAnimation={skipAnimation}
                                setRevealScore={setRevealScore}
                                setIsPaused={setIsPaused}
                                setShowWatchButton={(watch) => {
                                    setCurrentStep(2);
                                    setShowWatchButton(watch);
                                }}
                                isPaused={isPaused}
                            />
                            <HeadToHeadInnerBanner
                                loading={loading}
                                teamId={game?.lineup_2?.team?.id}
                                won={lineup2Won()}
                                isFinal={isFinal()}
                                revealScore={revealScore || progressiveQuarters.Q4.finished}
                                animateHeader={animateHeader}
                                lineupNumber={2}
                                teamLogo={
                                    game?.lineup_2?.team?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_2?.team?.path)}` : null
                                }
                                teamName={handleTeamName(user, game?.lineup_2?.team)}
                                score={handleScore(game, 2)}
                                headerColor={secondHeaderColor}
                                headerDefaultColor="#4E4E4E"
                                direction="right"
                                onColorExtracted={(color: string) => setSecondHeaderColor(color)}
                            />
                        </HeadToHeadBanner>
                        {isFinal() && revealScore && progressiveQuarters.Q4.finished && (
                            <div className="hidden md:flex w-[90%] md:w-2/3 flex-col items-center -mt-6">
                                <label htmlFor="steps-range" className="block mb-2 subheading-one text-white">
                                    Scroll through Plays
                                </label>
                                <input
                                    id="steps-range"
                                    type="range"
                                    min={1}
                                    max={playTotalAmount}
                                    value={rangeValue === 0 ? playTotalAmount : rangeValue}
                                    onChange={(e) => {
                                        setProgressiveQuartersRange(filterPlaysByNumber(_.cloneDeep(progressiveQuarters), parseInt(e.target.value)));
                                        setRangeValue(parseInt(e.target.value));
                                    }}
                                    step={1}
                                    className="w-full h-3.5 rounded-lg range-lg accent-white appearance-none cursor-pointer bg-white/16"
                                />
                            </div>
                        )}
                        <div
                            id="play-by-play"
                            className="flex flex-col items-center md:items-start space-y-6 justify-center md:space-y-0 md:flex-row md:gap-2 w-full"
                        >
                            <div className="relative flex flex-col items-start h-full w-full md:w-[45%]">
                                <div className="subheading-one text-white pb-2 pl-1">Play by Play</div>
                                {!revealScore && (
                                    <PlayByPlaySpeedControls
                                        isPaused={isPaused}
                                        disabled={false}
                                        setIsPaused={(isPaused) => {
                                            if (!isTourOpen) {
                                                if (shouldAnimate) setIsPaused(isPaused);
                                            }
                                        }}
                                        speed={speed}
                                        setSpeed={(speed) => {
                                            if (isTourOpen) {
                                                if (isTourOpen && speed === 500) {
                                                    setCurrentStep(4);
                                                    setSpeed(200);
                                                }
                                            } else {
                                                setSpeed(speed);
                                            }
                                        }}
                                    />
                                )}
                                {isFinal() && revealScore && progressiveQuarters.Q4.finished && (
                                    <div className="flex md:hidden flex-col w-full items-center">
                                        <div className="flex md:hidden w-[90%] md:w-2/3 flex-col items-center mt-1 mb-4">
                                            <input
                                                id="steps-range"
                                                type="range"
                                                min={1}
                                                max={playTotalAmount}
                                                value={rangeValue === 0 ? playTotalAmount : rangeValue}
                                                onChange={(e) => {
                                                    setProgressiveQuartersRange(
                                                        filterPlaysByNumber(_.cloneDeep(progressiveQuarters), parseInt(e.target.value))
                                                    );
                                                    setRangeValue(parseInt(e.target.value));
                                                }}
                                                step={1}
                                                className="w-full h-3.5 rounded-lg range-lg accent-white appearance-none cursor-pointer bg-white/16"
                                            />
                                            <label htmlFor="steps-range" className="block mt-2 subheading-three text-white">
                                                Scroll through Plays
                                            </label>
                                        </div>
                                    </div>
                                )}
                                <HeadToHeadPlayByPlayList
                                    hasDataAvailable={playByPlayData?.length > 0}
                                    teamOneLogo={
                                        game?.lineup_1?.team?.path
                                            ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_1?.team?.path)}`
                                            : null
                                    }
                                    teamTwoLogo={
                                        game?.lineup_2?.team?.path
                                            ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_2?.team?.path)}`
                                            : null
                                    }
                                    quarters={revealScore || rangeValue !== 0 ? progressiveQuartersRange : progressiveQuarters}
                                    currentQuarter={currentQuarter}
                                    setCurrentQuarter={(value) => {
                                        if (isTourOpen) {
                                            if (value.toString() === 'Q4') {
                                                setCurrentStep(3);
                                                setCurrentQuarter(value.toString(), true);
                                            }
                                        } else {
                                            setCurrentQuarter(value.toString(), true);
                                        }
                                    }}
                                    firstHeaderColor={firstHeaderColor || '#13FF0D'}
                                    secondHeaderColor={secondHeaderColor || '#4E4E4E'}
                                />
                            </div>
                            <div className="flex flex-col items-start justify-start h-full w-full md:w-[55%]">
                                <div data-tut="stats-display">
                                    <TableNavBar
                                        changeTab={(section) => {
                                            setSelectedSection(section);
                                        }}
                                        useRoutes={false}
                                        routesToUse={statSectionHeader}
                                        buttonClassName="h-8"
                                    />
                                </div>
                                {(selectedSection === 'player-stats' || selectedSection === 'boxscore' || selectedSection === 'matchup') && (
                                    <div className="flex flex-col h-full w-full">
                                        {!isFinal() && (
                                            <div className="h-full overflow-auto">
                                                <MatchupTable
                                                    lineupNumber={1}
                                                    teamName={handleTeamName(user, game?.lineup_1?.team)}
                                                    availablePlayers={convertLineupToPlayers(game?.lineup_1)}
                                                />
                                                <MatchupTable
                                                    lineupNumber={2}
                                                    teamName={handleTeamName(user, game?.lineup_2?.team)}
                                                    availablePlayers={convertLineupToPlayers(game?.lineup_2)}
                                                />
                                                <MobileMatchupTable
                                                    teamName={handleTeamName(user, game?.lineup_1?.team)}
                                                    availablePlayers={convertLineupToPlayers(game?.lineup_1) as CollapsiblePlayer[]}
                                                />
                                                <MobileMatchupTable
                                                    teamName={handleTeamName(user, game?.lineup_2?.team)}
                                                    availablePlayers={convertLineupToPlayers(game?.lineup_2) as CollapsiblePlayer[]}
                                                />
                                            </div>
                                        )}
                                        {isFinal() && isLargeScreen && (
                                            <div className="h-full">
                                                <TeamTable
                                                    tutorialMode={onboarding === 'true'}
                                                    stopTour={() => {
                                                        /*
                                                        AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), {
                                                            tutorial: { completed_step_number: 400 },
                                                        });
                                                        */
                                                        setIsTourOpen(false);
                                                    }}
                                                    shouldAnimate={shouldAnimate}
                                                    className="border rounded-t-lg"
                                                    teamId={Number(game?.lineup_1?.team?.id)}
                                                    gameClock={getLastQuarterGameClock()}
                                                    teamName={handleTeamName(user, game?.lineup_1?.team)}
                                                    availablePlayers={
                                                        lineupOneBoxScore?.length > 0 ? lineupOneBoxScore : emptyBoxScore?.lineupOneBoxScore
                                                    }
                                                    selectPlayer={() => {
                                                        setTimeout(() => {
                                                            setCurrentStep(9);
                                                        }, 200);
                                                    }}
                                                />
                                                <TeamTable
                                                    shouldAnimate={shouldAnimate}
                                                    className="border-b border-x rounded-b-lg"
                                                    teamId={Number(game?.lineup_2?.team?.id)}
                                                    gameClock={getLastQuarterGameClock()}
                                                    teamName={handleTeamName(user, game?.lineup_2?.team)}
                                                    availablePlayers={
                                                        lineupTwoBoxScore?.length > 0 ? lineupTwoBoxScore : emptyBoxScore?.lineupTwoBoxScore
                                                    }
                                                />
                                            </div>
                                        )}
                                        {isFinal() && !isLargeScreen && (
                                            <div className="h-full">
                                                <div id="lineupOne"></div>
                                                <MobileHeadToHeadTeamTable
                                                    tutorialMode={onboarding === 'true'}
                                                    stopTour={() => {
                                                        /*
                                                        AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), {
                                                            tutorial: { completed_step_number: 400 },
                                                        });
                                                        */
                                                        setIsTourOpen(false);
                                                    }}
                                                    hideTeamStats={false}
                                                    className="border-b border-x rounded-b-lg"
                                                    teamId={Number(game?.lineup_1?.team?.id)}
                                                    teamName={handleTeamName(user, game?.lineup_1?.team)}
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
                                                    slideOver={() => {
                                                        setTimeout(() => {
                                                            setCurrentStep(11);
                                                        }, 200);
                                                    }}
                                                    selectPlayer={() => {
                                                        setTimeout(() => {
                                                            setCurrentStep(10);
                                                        }, 200);
                                                    }}
                                                />
                                                <div id="lineupTwo"></div>
                                                <MobileHeadToHeadTeamTable
                                                    hideTeamStats={false}
                                                    className="border-b border-x rounded-b-lg"
                                                    teamId={Number(game?.lineup_2?.team?.id)}
                                                    teamName={handleTeamName(user, game?.lineup_2?.team)}
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
                                        )}
                                    </div>
                                )}
                                {selectedSection === 'team-stats' && (
                                    <div id="team-stats" className="flex flex-col w-full">
                                        <div className="h-full overflow-auto flex flex-col w-full">
                                            <div className="grid grid-cols-4 w-full justify-between rounded-lg border border-white/16 subheading-one divide-y divide-white/16 text-white">
                                                <div className="col-span-4 flex flex-row items-center justify-between px-2 pt-2.5 pb-2.5 rounded-t-lg text-black bg-white subheading-three md:subheading-two">
                                                    <div className="flex flex-row items-center justify-start gap-2 max-w-[50%]">
                                                        {(
                                                            game?.lineup_1?.team?.path
                                                                ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_1?.team?.path)}`
                                                                : null
                                                        ) ? (
                                                            <img
                                                                src={`${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_1?.team?.path)}`}
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
                                                        <span>{game?.lineup_1?.team?.name}</span>
                                                    </div>
                                                    <div className="flex flex-row items-center justify-end max-w-[50%] text-right gap-2">
                                                        <span>{game?.lineup_2?.team?.name}</span>
                                                        {(
                                                            game?.lineup_2?.team?.path
                                                                ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_2?.team?.path)}`
                                                                : null
                                                        ) ? (
                                                            <img
                                                                src={`${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_2?.team?.path)}`}
                                                                className="aspect-square h-8 w-8 rounded-full"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="flex flex-col items-center justify-center aspect-square h-8 w-8 rounded-full"
                                                                style={{ backgroundColor: secondHeaderColor }}
                                                            >
                                                                <TrophyIcon
                                                                    className={classNames('w-5 h-5', getTextColor(secondHeaderColor || '#4E4E4E'))}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className={classNames('border-t border-white/16 col-span-1 text-start pl-3 md:pl-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('pts') === 'lineupOne',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupOneBoxScore, 'pts')}
                                                </div>
                                                <div className="col-span-2 text-center py-4">Points</div>
                                                <div
                                                    className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('pts') === 'lineupTwo',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupTwoBoxScore, 'pts')}
                                                </div>
                                                <div
                                                    className={classNames(
                                                        'flex flex-row items-center gap-0.5 col-span-1 text-start pl-3 md:pl-8 py-4',
                                                        {
                                                            'text-yellow-400': evaluateStatWinner('fg') === 'lineupOne',
                                                        }
                                                    )}
                                                >
                                                    <span>{getTeamBoxScoreSum(lineupOneBoxScore, 'fg')}</span>/
                                                    <span>{getTeamBoxScoreSum(lineupOneBoxScore, 'fga')}</span>
                                                </div>
                                                <div className="col-span-2 text-center py-4">Field Goals</div>
                                                <div
                                                    className={classNames(
                                                        'flex flex-row items-center justify-end gap-0.5 col-span-1 text-end pr-3 md:pr-8 py-4',
                                                        {
                                                            'text-yellow-400': evaluateStatWinner('fg') === 'lineupTwo',
                                                        }
                                                    )}
                                                >
                                                    <span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'fg')}</span>/
                                                    <span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'fga')}</span>
                                                </div>
                                                <div
                                                    className={classNames(
                                                        'flex flex-row items-center gap-0.5 col-span-1 text-start pl-3 md:pl-8 py-4',
                                                        {
                                                            'text-yellow-400': evaluateStatWinner('three_p') === 'lineupOne',
                                                        }
                                                    )}
                                                >
                                                    <span>{getTeamBoxScoreSum(lineupOneBoxScore, 'three_p')}</span>/
                                                    <span>{getTeamBoxScoreSum(lineupOneBoxScore, 'three_pa')}</span>
                                                </div>
                                                <div className="col-span-2 text-center py-4">3 Pointers</div>
                                                <div
                                                    className={classNames(
                                                        'flex flex-row items-center justify-end gap-0.5 col-span-1 text-end pr-3 md:pr-8 py-4',
                                                        {
                                                            'text-yellow-400': evaluateStatWinner('three_p') === 'lineupTwo',
                                                        }
                                                    )}
                                                >
                                                    <span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'three_p')}</span>/
                                                    <span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'three_pa')}</span>
                                                </div>
                                                <div
                                                    className={classNames(
                                                        'flex flex-row items-center gap-0.5 col-span-1 text-start pl-3 md:pl-8 py-4',
                                                        {
                                                            'text-yellow-400': evaluateStatWinner('ft') === 'lineupOne',
                                                        }
                                                    )}
                                                >
                                                    <span>{getTeamBoxScoreSum(lineupOneBoxScore, 'ft')}</span>/
                                                    <span>{getTeamBoxScoreSum(lineupOneBoxScore, 'fta')}</span>
                                                </div>
                                                <div className="col-span-2 text-center py-4">Free Throws</div>
                                                <div
                                                    className={classNames(
                                                        'flex flex-row items-center justify-end gap-0.5 col-span-1 text-end pr-3 md:pr-8 py-4',
                                                        {
                                                            'text-yellow-400': evaluateStatWinner('ft') === 'lineupTwo',
                                                        }
                                                    )}
                                                >
                                                    <span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'ft')}</span>/
                                                    <span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'fta')}</span>
                                                </div>
                                                <div
                                                    className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('ast') === 'lineupOne',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupOneBoxScore, 'ast')}
                                                </div>
                                                <div className="col-span-2 text-center py-4">Assists</div>
                                                <div
                                                    className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('ast') === 'lineupTwo',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupTwoBoxScore, 'ast')}
                                                </div>
                                                <div
                                                    className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('orb') === 'lineupOne',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupOneBoxScore, 'orb')}
                                                </div>
                                                <div className="col-span-2 text-center py-4">Offensive Rebounds</div>
                                                <div
                                                    className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('orb') === 'lineupTwo',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupTwoBoxScore, 'orb')}
                                                </div>
                                                <div
                                                    className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('drb') === 'lineupOne',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupOneBoxScore, 'drb')}
                                                </div>
                                                <div className="col-span-2 text-center py-4">Defensive Rebounds</div>
                                                <div
                                                    className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('drb') === 'lineupTwo',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupTwoBoxScore, 'drb')}
                                                </div>
                                                <div
                                                    className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('trb') === 'lineupOne',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupOneBoxScore, 'trb')}
                                                </div>
                                                <div className="col-span-2 text-center py-4">Total Rebounds</div>
                                                <div
                                                    className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('trb') === 'lineupTwo',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupTwoBoxScore, 'trb')}
                                                </div>
                                                <div
                                                    className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('stl') === 'lineupOne',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupOneBoxScore, 'stl')}
                                                </div>
                                                <div className="col-span-2 text-center py-4">Steals</div>
                                                <div
                                                    className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('stl') === 'lineupTwo',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupTwoBoxScore, 'stl')}
                                                </div>
                                                <div
                                                    className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('blk') === 'lineupOne',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupOneBoxScore, 'blk')}
                                                </div>
                                                <div className="col-span-2 text-center py-4">Blocks</div>
                                                <div
                                                    className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('blk') === 'lineupTwo',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupTwoBoxScore, 'blk')}
                                                </div>
                                                <div
                                                    className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('tov') === 'lineupOne',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupOneBoxScore, 'tov')}
                                                </div>
                                                <div className="col-span-2 text-center py-4">Turnovers</div>
                                                <div
                                                    className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('tov') === 'lineupTwo',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupTwoBoxScore, 'tov')}
                                                </div>
                                                <div
                                                    className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('pf') === 'lineupOne',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupOneBoxScore, 'pf')}
                                                </div>
                                                <div className="col-span-2 text-center py-4">Team Fouls</div>
                                                <div
                                                    className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                                                        'text-yellow-400': evaluateStatWinner('pf') === 'lineupTwo',
                                                    })}
                                                >
                                                    {getTeamBoxScoreSum(lineupTwoBoxScore, 'pf')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {Tour && (
                        <Tour
                            steps={tourConfig}
                            isOpen={isTourOpen}
                            showNavigation={false}
                            maskClassName="mask"
                            className="helper"
                            showButtons={false}
                            disableInteraction={true}
                            rounded={4}
                            getCurrentStep={(step) => setCurrentStep(step)}
                            accentColor={accentColor}
                            showCloseButton={false}
                            onRequestClose={() => {
                                if (currentStep === 8) {
                                    setIsTourOpen(false);
                                }
                            }}
                            goToStep={currentStep}
                        />
                    )}
                </div>
            </LayoutDecider>
        </PageLoadingWrapper>
    );
};

export default HeadToHeadPage;

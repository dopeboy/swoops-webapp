import { ReactElement, useState, useEffect } from 'react';
import withAuth from 'src/components/common/withAuth';
import PlayerSelectTable from 'src/components/gamelobby/PlayerSelectTable';
import { EmbeddedNavbarRoute } from 'src/components/common/EmbeddedNavBar';
import { useRouter } from 'next/router';
import { CurrentLineup } from '../../components/gamelobby/CurrentLineup';
import { createLineup, EmptyRosterPlayer, getUserDetail } from 'src/lib/utils';
import { Game, Reservation, PlayerV2, AccountsService } from 'src/lib/api';
import PlayerService, { ReadonlyPlayer } from 'src/services/PlayerService';
import GameLobbyHeader from 'src/components/gamelobby/GameLobbyHeader';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import { TableNavBar } from 'src/components/common/TableNavBar';
import classNames from 'classnames';
import 'react-toastify/dist/ReactToastify.css';
import { trackPageLanding } from '../../lib/tracking';
import { Position } from 'src/models/position.type';
import { toast } from 'react-toastify';
import MobileGameLobbyHeader from 'src/components/gamelobby/MobileGameLobbyHeader';
import { MobileCurrentLineup } from 'src/components/gamelobby/MobileCurrentLineup';
import MobilePlayerSelectTable from 'src/components/gamelobby/MobilePlayerSelectTable';
import { CollapsiblePlayer } from 'src/components/lockerRoom/MobileRosterTable';
import { useTableSort } from 'src/hooks/useTableSort';
import { playerTableHeaders } from 'src/lib/constants';
import _ from 'lodash';
import { usePositionFilters } from 'src/hooks';
import dynamic from 'next/dynamic';
import { TutorialModal } from 'src/components/gamelobby/TutorialModal';
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
};

const Tour = dynamic<TourComponent>(() => import('reactour'), { ssr: false });

const accentColor = '#13FF0D';

const tourConfig = [
    {
        selector: '[data-tut="select-your-squads"]',
        content: ({ goTo }) => (
            <div>
                Welcome to the <b>LINEUP SUBMISSION</b> page. Here you will build a lineup to submit against your opponent.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(1)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="team-formation"]',
        content: ({ goTo }) => (
            <div>
                Each team has 3-minutes to select <b>TWO GUARDS, TWO FORWARDS</b>, and <b>ONE CENTER</b>. You can filter by position by clicking in
                any blank lineup spots up top. Also, there are filters above the player pool labeled G/F/C.
                <button
                    className="subheading-tree btn-rounded-green float-right mt-6"
                    onClick={() => {
                        window.scrollTo(0, document.body.scrollHeight);
                        setTimeout(() => {
                            goTo(2);
                        }, 300);
                    }}
                >
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="available-players"]',
        position: 'bottom',
        content: ({ goTo }) => (
            <div>
                Your available roster with current season averages are down below. You can always click on a player to learn more about their
                underlying attributes. <b>Please click on a player now to continue.</b>
                {/* <button disabled className="subheading-tree btn-rounded-green disabled float-right mt-6 disabled" onClick={() => goTo(3)}>
                    Next
                </button> */}
            </div>
        ),
    },
    {
        selector: '[data-tut="add-lineup-detail"]',
        content: ({ goTo }) => (
            <div>
                Let’s get this player entered into a contest. <b>Please select ADD TO LINEUP to continue.</b>
                {/* <button disabled className="subheading-tree btn-rounded-green float-right mt-6 disabled" onClick={() => goTo(4)}>
                    Next
                </button> */}
            </div>
        ),
    },
    {
        selector: '[data-tut="use-free-agents"]',
        content: ({ goTo }) => (
            <div>
                If you have no more available players, no problem! There are always free-to-use free agent players to fill any lineup gaps. Let’s
                check them out! <b>Please select the FREE AGENTS tab to continue.</b>
                {/* <button disabled className="subheading-tree btn-rounded-green float-right mt-6 disabled" onClick={() => goTo(5)}>
                    Next
                </button> */}
            </div>
        ),
    },
    {
        selector: '[data-tut="add-lineup-list"]',
        content: ({ goTo }) => (
            <div>
                You can also enter a player into your lineup by selecting the “+” sign to the left of the player.{' '}
                <b>Please enter a player now to continue.</b>
                {/* <button disabled className="subheading-tree btn-rounded-green float-right mt-6 disabled" onClick={() => goTo(6)}>
                    Next
                </button> */}
            </div>
        ),
    },
    {
        selector: '[data-tut="remove-player"]',
        content: ({ goTo }) => (
            <div>
                If you change your mind, no problem, simply remove the player from your lineup up top.
                <button className="subheading-tree btn-rounded-green float-right mt-6" onClick={() => goTo(7)}>
                    Next
                </button>
            </div>
        ),
    },
    {
        selector: '[data-tut="select-guard-forward"]',
        position: [550, 400],
        content: ({ goTo }) => (
            <div>
                <b>Please fill IN the rest of your lineup now to continue.</b>
                {/* <button disabled className="subheading-tree btn-rounded-green float-right mt-6 disabled" onClick={() => goTo(8)}>
                    Next
                </button> */}
            </div>
        ),
    },
    {
        selector: '[data-tut="submit-lineup"]',
        content: ({ goTo }) => (
            <div>
                Now that all of your lineup spots are filled, <b>please click SUBMIT LINEUP </b> to start simulating your matchup!
                {/* <button disabled className="subheading-tree btn-rounded-green float-right mt-6 disabled" onClick={() => goTo(9)}>
                    Next
                </button> */}
            </div>
        ),
    },
];

const generateRoutes = (gameId: string): EmbeddedNavbarRoute[] => {
    return [
        {
            path: `/gamelobby-tutorial/roster`,
            title: 'Your Roster',
            section: 'roster',
        },
        {
            path: `/gamelobby-tutorial/freeagents`,
            title: 'Free agents',
            section: 'freeagents',
        },
    ];
};

const GameLobby = (): ReactElement => {
    const router = useRouter();
    const { isReady } = router;
    const { positions, selectPosition, selectedPosition } = usePositionFilters();
    const { gameId, reservationId } = router.query;
    const [hasSubmitted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [loadingLineupRequest, setLoadingLineupRequest] = useState<boolean>(false);
    const [reservation, setReservation] = useState<Reservation>();
    const [selectedPlayers, setSelectedPlayers] = useState<(ReadonlyPlayer | typeof EmptyRosterPlayer)[]>([
        EmptyRosterPlayer,
        EmptyRosterPlayer,
        EmptyRosterPlayer,
        EmptyRosterPlayer,
        EmptyRosterPlayer,
    ]);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [, setGameInfo] = useState<Partial<Game>>({});
    const [players, setPlayers] = useState<Array<ReadonlyPlayer>>([]);
    const [freeAgents, setFreeAgents] = useState<Array<ReadonlyPlayer>>([]);
    const [animateHeader, setAnimateHeader] = useState(false);
    const [cardPosition, setCardPosition] = useState<Position>();
    const [highlightFreeAgentsTab, setHighlightFreeAgentsTab] = useState<boolean>(false);
    const [showTutorialOpen, setShowTutorialOpen] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedSection, setSelectedSection] = useState('roster');
    const [currentPlayers, setCurrentPlayers] = useState<PlayerV2[]>([]);
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    const {
        tableHeaders: playerHeaders,
        players: availablePlayers,
        setPlayers: setAvailablePlayers,
        updateSortDirection: updatePlayerSortDirection,
    } = useTableSort(players as CollapsiblePlayer[], _.cloneDeep(playerTableHeaders));
    const {
        tableHeaders: freeAgentHeaders,
        players: availableFreeAgents,
        setPlayers: setAvailableFreeAgents,
        updateSortDirection: updateFreeAgentSortDirection,
    } = useTableSort(freeAgents as CollapsiblePlayer[], _.cloneDeep(playerTableHeaders));

    const isSubmitDisabled = false;

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

    const loadData = async (): Promise<void> => {
        try {
            let rosterPlayers = await PlayerService.getPlayerRoster(getUserDetail()?.team?.id);
            const freeAgentsRequest = await PlayerService.getFreeAgents();
            setFreeAgents(freeAgentsRequest);
            setAvailableFreeAgents(freeAgentsRequest as CollapsiblePlayer[]);
            setPlayers(rosterPlayers);
            setCurrentPlayers(rosterPlayers);
            rosterPlayers = [rosterPlayers[0]];
            setAvailablePlayers(rosterPlayers as CollapsiblePlayer[]);
            setLoading(false);
            setIsTourOpen(true);
        } catch (err) {
            setLoading(false);
            toast.error('There was an error retrieving the game. Please try again later. ');
            console.error(err);
        }
    };

    const addPlayerToSelection = (player: ReadonlyPlayer, shouldRemove: boolean): void => {
        // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        if (currentStep === 3) {
            setTimeout(() => {
                setCurrentStep(4);
            }, 500);
        }

        if (currentStep === 5) {
            setCurrentStep(6);
        }

        if (shouldRemove) {
            if (currentStep === 6) {
                setCurrentStep(7);
            }
            const indexToRemove = selectedPlayers.findIndex((p) => p && p !== EmptyRosterPlayer && p.id === player.id);
            if (indexToRemove >= 0) {
                const newPlayerArr = [...selectedPlayers];
                newPlayerArr[indexToRemove] = EmptyRosterPlayer;
                setSelectedPlayers(newPlayerArr);
            }
        } else if (selectedPlayers.filter((p) => p && p !== EmptyRosterPlayer).length >= 5) {
            toast.error('You can only have 5 players in your lineup.');
        } else if (
            reservation?.tokens_required &&
            player.token > 0 &&
            selectedPlayers.filter((p) => p && p !== EmptyRosterPlayer && p.token > 0).length >= reservation?.tokens_required
        ) {
            toast.error(
                `You can only enter ${reservation?.tokens_required} owned-swoopster${
                    reservation?.tokens_required > 1 ? 's' : ''
                } in your lineup for this contest.`
            );
        } else {
            const playersWithoutNewPlayer = [...selectedPlayers].filter((p) => p !== EmptyRosterPlayer);
            const playersWithNewPlayer = [...playersWithoutNewPlayer, player];
            const newLineup = createLineup(playersWithNewPlayer);
            if (newLineup) {
                setSelectedPlayers(newLineup);
            } else {
                toast.error('There is no more space for this player. Please remove another player first.');
            }
        }
    };

    useEffect(() => {
        if (selectedPlayers.filter((p) => p && p !== EmptyRosterPlayer).length >= 5) {
            document.body.style.overflow = 'hidden';
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            setTimeout(() => {
                setCurrentStep(8);
            }, 500);
        }
    }, [selectedPlayers]);

    useEffect(() => {
        if (currentStep === 7) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }, [currentStep]);

    const filterPlayerPosition = async (positions?: Array<Position>): Promise<void> => {
        try {
            if (!loading && getUserDetail()?.team?.id) {
                setLoadingRequest(true);
                const rosterPlayers = await PlayerService.getFilteredPlayers(getUserDetail()?.team?.id, positions);
                setPlayers(rosterPlayers);
                setAvailablePlayers(rosterPlayers as CollapsiblePlayer[]);
                const freeAgentsRequest = await PlayerService.getFreeAgents(positions);
                setFreeAgents(freeAgentsRequest);
                setAvailableFreeAgents(freeAgentsRequest as CollapsiblePlayer[]);
                setLoadingRequest(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('There was an error while filtering the players. Try again.');
            setLoadingRequest(false);
        }
    };

    useEffect(() => {
        if (!isReady) return;
        trackPageLanding(`Game lobby`);
        loadData();
    }, [isReady]);

    useEffect(() => {
        const listener = () => (window.scrollY > (window.innerWidth > 390 ? 10 : 80) ? setAnimateHeader(true) : setAnimateHeader(false));
        window.addEventListener('scroll', listener);
        return () => {
            window.removeEventListener('scroll', listener);
        };
    }, []);

    async function onSubmit(): Promise<void> {
        setIsTourOpen(false);
        //AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), { tutorial: { completed_step_number: 300 } });
        const offChainPlayer = currentPlayers.find((p) => p?.kind === PlayerV2.kind.OFF_CHAIN);
        if (offChainPlayer) {
            const positions = offChainPlayer?.positions;
            let url = `/headtohead/97/joined/boxscore?playerTokenForOverwrite=0&onboarding=true`;

            if (positions && positions.length > 0) {
                const gameId = positionToGameId(positions[0]);
                url = `/headtohead/${gameId}/joined/boxscore?playerTokenForOverwrite=${offChainPlayer.token}&onboarding=true`;
            }

            router.push(url);
        } else {
            router.push(`/headtohead/97/joined/boxscore?playerTokenForOverwrite=0&onboarding=true`);
        }
    }

    const positionToGameId = (position: 'G' | 'F' | 'C') => {
        // GUARD: game 244726 (subbing in the user player for THE BIG CHEESE)
        // FORWARD: game 302629 (subbing in the user player for SKYWALKER)
        // CENTER: game 146946 (subbing in the user player for THE MOZ)
        switch (position) {
            case 'G':
                return 244726;
            case 'F':
                return 302629;
            case 'C':
                return 146946;
            default:
                return null;
        }
    };

    const clickOnPlayer = () => {
        if (window.innerWidth > 640) {
            setTimeout(() => {
                setCurrentStep(3);
            }, 200);
        } else {
            // window.scrollTo({ top: 1000, left: 0, behavior: 'smooth' });
            setTimeout(() => {
                setCurrentStep(3);
            }, 200);
        }
    };

    useEffect(() => {
        if (selectPosition) {
            filterPlayerPosition([selectedPosition.value]);
        }
    }, [selectedPosition]);

    return (
        <PageLoadingWrapper loading={loading}>
            <TutorialProgress currentStep={1} />
            {!loading && (
                <>
                    <div className="bg-black">
                        <>
                            {!isLargeScreen ? (
                                <MobileGameLobbyHeader
                                    fixed={false}
                                    isLoading={loadingLineupRequest}
                                    gameId={gameId as string}
                                    reservationId={reservationId as string}
                                    animateHeader={false}
                                    isSubmitDisabled={isSubmitDisabled}
                                    onSubmit={onSubmit}
                                    timer={180}
                                />
                            ) : (
                                <GameLobbyHeader
                                    fixed={false}
                                    isLoading={loadingLineupRequest}
                                    gameId={gameId as string}
                                    reservationId={reservationId as string}
                                    animateHeader={false}
                                    isSubmitDisabled={isSubmitDisabled}
                                    onSubmit={onSubmit}
                                    timer={180}
                                />
                            )}
                        </>
                        <div
                            className={classNames('flex flex-col items-center transition-all ease-in-out duration-300', {
                                // 'mt-[120px]': !animateHeader,
                                'mt-[80px]': animateHeader,
                            })}
                        >
                            <div className="flex w-full justify-center max-w-7xl sm:px-4 pt-6" data-tut="team-formation">
                                {isLargeScreen ? (
                                    <CurrentLineup
                                        tokensRequired={reservation?.tokens_required}
                                        selectedPlayers={selectedPlayers.map((selectedPlayer) => {
                                            if (!selectedPlayer) return EmptyRosterPlayer;
                                            return { ...selectedPlayer };
                                        })}
                                        filterPosition={(position) => setCardPosition(position)}
                                        addPlayerToSelection={addPlayerToSelection}
                                    />
                                ) : (
                                    <MobileCurrentLineup
                                        tokensRequired={reservation?.tokens_required}
                                        selectedPlayers={selectedPlayers.map((selectedPlayer) => {
                                            if (!selectedPlayer) return EmptyRosterPlayer;
                                            return { ...selectedPlayer };
                                        })}
                                        filterPosition={(position) => setCardPosition(position)}
                                        addPlayerToSelection={addPlayerToSelection}
                                    />
                                )}
                            </div>
                            <div className="sm:mt-0 flex flex-col w-full max-w-7xl 2xl:min-w-[1420px] sm:px-4" data-tut="select-guard-forward">
                                <div className="mt-6">
                                    <TableNavBar
                                        changeTab={(section) => {
                                            if (section === 'freeagents') {
                                                setCurrentStep(5);
                                            }
                                            setSelectedSection(section);
                                        }}
                                        useRoutes={false}
                                        highlightFreeAgentsTab={highlightFreeAgentsTab}
                                        routesToUse={generateRoutes(gameId as string)}
                                        withQueryParams={true}
                                    />
                                </div>
                                <div className="w-full max-w-7xl 2xl:min-w-[1420px]">
                                    {selectedSection === 'roster' ? (
                                        <>
                                            {isLargeScreen ? (
                                                <PlayerSelectTable
                                                    loadingRequest={loadingRequest}
                                                    filterPlayerPosition={filterPlayerPosition}
                                                    selectedPlayers={selectedPlayers.map((selectedPlayer) => {
                                                        if (!selectedPlayer) return EmptyRosterPlayer;
                                                        return { ...selectedPlayer };
                                                    })}
                                                    availablePlayers={availablePlayers as CollapsiblePlayer[]}
                                                    setAvailablePlayers={setAvailablePlayers}
                                                    positions={positions}
                                                    selectPosition={selectPosition}
                                                    selectedPosition={selectedPosition}
                                                    tableHeaders={playerHeaders}
                                                    updateSortDirection={updatePlayerSortDirection}
                                                    isFreeAgentDisplay={false}
                                                    addPlayerToSelection={addPlayerToSelection}
                                                    cardPosition={cardPosition}
                                                    clickOnPlayer={clickOnPlayer}
                                                />
                                            ) : (
                                                <MobilePlayerSelectTable
                                                    loadingRequest={loadingRequest}
                                                    positions={positions}
                                                    selectPosition={selectPosition}
                                                    selectedPosition={selectedPosition}
                                                    filterPlayerPosition={filterPlayerPosition}
                                                    selectedPlayers={selectedPlayers.map((selectedPlayer) => {
                                                        if (!selectedPlayer) return EmptyRosterPlayer;
                                                        return { ...selectedPlayer };
                                                    })}
                                                    tableHeaders={playerHeaders}
                                                    updateSortDirection={updatePlayerSortDirection}
                                                    availablePlayers={availablePlayers as CollapsiblePlayer[]}
                                                    setAvailablePlayers={setAvailablePlayers}
                                                    isFreeAgentDisplay={false}
                                                    addPlayerToSelection={addPlayerToSelection}
                                                    cardPosition={cardPosition}
                                                    clickOnPlayer={clickOnPlayer}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {isLargeScreen ? (
                                                <PlayerSelectTable
                                                    loadingRequest={loadingRequest}
                                                    filterPlayerPosition={filterPlayerPosition}
                                                    positions={positions}
                                                    selectPosition={selectPosition}
                                                    selectedPosition={selectedPosition}
                                                    selectedPlayers={selectedPlayers.map((selectedPlayer) => {
                                                        if (!selectedPlayer) return EmptyRosterPlayer;
                                                        return { ...selectedPlayer };
                                                    })}
                                                    tableHeaders={freeAgentHeaders}
                                                    setAvailablePlayers={setAvailableFreeAgents}
                                                    updateSortDirection={updateFreeAgentSortDirection}
                                                    isFreeAgentDisplay
                                                    availablePlayers={availableFreeAgents as CollapsiblePlayer[]}
                                                    addPlayerToSelection={addPlayerToSelection}
                                                    cardPosition={cardPosition}
                                                />
                                            ) : (
                                                <MobilePlayerSelectTable
                                                    loadingRequest={loadingRequest}
                                                    filterPlayerPosition={filterPlayerPosition}
                                                    positions={positions}
                                                    selectPosition={selectPosition}
                                                    selectedPosition={selectedPosition}
                                                    selectedPlayers={selectedPlayers.map((selectedPlayer) => {
                                                        if (!selectedPlayer) return EmptyRosterPlayer;
                                                        return { ...selectedPlayer };
                                                    })}
                                                    tableHeaders={freeAgentHeaders}
                                                    setAvailablePlayers={setAvailableFreeAgents}
                                                    updateSortDirection={updateFreeAgentSortDirection}
                                                    isFreeAgentDisplay
                                                    availablePlayers={availableFreeAgents as CollapsiblePlayer[]}
                                                    addPlayerToSelection={addPlayerToSelection}
                                                    cardPosition={cardPosition}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
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
                            rounded={4}
                            getCurrentStep={(step) => setCurrentStep(step)}
                            accentColor={accentColor}
                            showCloseButton={false}
                            onRequestClose={() => {}}
                            goToStep={currentStep}
                        />
                    )}
                    <TutorialModal
                        open={showTutorialOpen}
                        setOpen={(openValue: boolean) => setShowTutorialOpen(openValue)}
                        startTour={() => {
                            setIsTourOpen(true);
                            setShowTutorialOpen(false);
                        }}
                    />
                </>
            )}
        </PageLoadingWrapper>
    );
};

export default withAuth(GameLobby);

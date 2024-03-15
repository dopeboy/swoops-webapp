import { ReactElement, useState, useEffect } from 'react';
import withAuth from 'src/components/common/withAuth';
import PlayerSelectTable from 'src/components/gamelobby/PlayerSelectTable';
import { EmbeddedNavbarRoute } from 'src/components/common/EmbeddedNavBar';
import { useRouter } from 'next/router';
import { CurrentLineup } from 'src/components/gamelobby/CurrentLineup';
import { createLineup, EmptyRosterPlayer, getUserDetail } from 'src/lib/utils';
import { ApiService, CreateLineup } from 'src/lib/api';
import PlayerService, { ReadonlyPlayer } from 'src/services/PlayerService';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import { TableNavBar } from 'src/components/common/TableNavBar';
import classNames from 'classnames';
import 'react-toastify/dist/ReactToastify.css';
import { trackEvent, trackPageLanding } from 'src/lib/tracking';
import { Position } from 'src/models/position.type';
import { toast } from 'react-toastify';
import { MobileCurrentLineup } from 'src/components/gamelobby/MobileCurrentLineup';
import MobilePlayerSelectTable from 'src/components/gamelobby/MobilePlayerSelectTable';
import { CollapsiblePlayer } from 'src/components/lockerRoom/MobileRosterTable';
import { useTableSort } from 'src/hooks/useTableSort';
import { playerTableHeaders } from 'src/lib/constants';
import _ from 'lodash';
import { usePositionFilters } from 'src/hooks';
import MobileMatchmakingLobbyHeader from './MobileGameLobbyHeader';
import MatchmakingLobbyHeader from './MatchmakingLobbyHeader';
import dynamic from 'next/dynamic';
import { TutorialModal } from 'src/components/gamelobby/TutorialModalMatchMake';

type TourComponent = {
    steps: any[];
    isOpen: boolean;
    showNavigation: boolean;
    maskClassName: string;
    className: string;
    rounded: number;
    accentColor: string;
};

const Tour = dynamic<TourComponent>(() => import('reactour'), { ssr: false });

const accentColor = '#13FF0D';

const tourConfig = [
    {
        selector: '[data-tut="select-your-squad"]',
        content: `You have 3 minutes to select your squad.`,
    },
    {
        selector: '[data-tut="team-formation"]',
        content: `Each team must play two guards, two forwards, and one center.`,
    },
    {
        selector: '[data-tut="filter-position"]',
        content: `Filter by position by clicking in the blank lineup spots. Click any empty lineup spot now.`,
    },
    {
        selector: '[data-tut="player-pool-filters"]',
        content: `Also, there are filters above the player pool. Click the All Positions filter to continue.`,
    },
    {
        selector: '[data-tut="available-players"]',
        content: `Your available players will always show down below. Here you can find their current season averages.`,
    },
    {
        selector: '[data-tut="player-attributes"]',
        content: `Click on a player to learn more about their underlying attributes.`,
    },
    {
        selector: '[data-tut="available-players"]',
        content: `Enter a player into your lineup by selecting the + sign. Enter your three players below now.`,
    },
    {
        selector: '[data-tut="use-free-agents"]',
        content: `Use free agent players to fill any gaps in your lineup. Free agents can be found here. Click in the tab`,
    },
    {
        selector: '[data-tut="select-guard-forward"]',
        content: `Our lineup still needs players. Let’s select the two available below.`,
    },
    {
        selector: '[data-tut="submit-lineup"]',
        content: `Once all lineup spots are filled, click submit.`,
    },
];

const generateRoutes = (): EmbeddedNavbarRoute[] => {
    return [
        {
            path: `/h2h-matchmake/roster`,
            title: 'Your Roster',
            section: 'roster',
        },
        {
            path: `/h2h-matchmake/freeagents`,
            title: 'Free agents',
            section: 'freeagents',
        },
    ];
};

const GameLobby = (): ReactElement => {
    const router = useRouter();
    const { isReady } = router;
    const { positions, selectPosition, selectedPosition } = usePositionFilters();
    const { onboarding } = router.query;
    const [hasSubmitted] = useState<boolean>(false);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [loadingLineupRequest, setLoadingLineupRequest] = useState<boolean>(false);
    const [showTutorialOpen, setShowTutorialOpen] = useState<boolean>(false);
    const [selectedPlayers, setSelectedPlayers] = useState<(ReadonlyPlayer | typeof EmptyRosterPlayer)[]>([
        EmptyRosterPlayer,
        EmptyRosterPlayer,
        EmptyRosterPlayer,
        EmptyRosterPlayer,
        EmptyRosterPlayer,
    ]);
    const [players, setPlayers] = useState<Array<ReadonlyPlayer>>([]);
    const [freeAgents, setFreeAgents] = useState<Array<ReadonlyPlayer>>([]);
    const [animateHeader, setAnimateHeader] = useState(false);
    const [cardPosition, setCardPosition] = useState<Position>();
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
    const [selectedSection, setSelectedSection] = useState('roster');

    const isSubmitDisabled =
        hasSubmitted || selectedPlayers.some((p) => p === EmptyRosterPlayer) || !selectedPlayers.some((selectedPlayer) => selectedPlayer?.team);

    const loadData = async (): Promise<void> => {
        try {
            const rosterPlayers = await PlayerService.getPlayerRoster(getUserDetail()?.team?.id);
            const freeAgentsRequest = await PlayerService.getFreeAgents();
            setFreeAgents(freeAgentsRequest);
            setAvailableFreeAgents(freeAgentsRequest as CollapsiblePlayer[]);
            setPlayers(rosterPlayers);
            setAvailablePlayers(rosterPlayers as CollapsiblePlayer[]);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            toast.error('There was an error retrieving the game. Please try again later. ');
            console.error(err);
        }
    };

    const addPlayerToSelection = (player: ReadonlyPlayer, shouldRemove: boolean): void => {
        if (shouldRemove) {
            const indexToRemove = selectedPlayers.findIndex((p) => p && p !== EmptyRosterPlayer && p.id === player.id);
            if (indexToRemove >= 0) {
                const newPlayerArr = [...selectedPlayers];
                newPlayerArr[indexToRemove] = EmptyRosterPlayer;
                setSelectedPlayers(newPlayerArr);
            }
        } else if (selectedPlayers.filter((p) => p && p !== EmptyRosterPlayer).length >= 5) {
            toast.error('You can only have 5 players in your lineup.');
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
        if (router.isReady) {
            setShowTutorialOpen(onboarding === 'true');
        }
    }, [router]);

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
        try {
            if (!isSubmitDisabled) {
                setLoadingLineupRequest(true);
                const createdLineup: CreateLineup = {
                    player_1: null,
                    player_2: null,
                    player_3: null,
                    player_4: null,
                    player_5: null,
                };
                selectedPlayers.forEach((selectedPlayer: ReadonlyPlayer, index: number) => {
                    createdLineup[`player_${index + 1}`] = selectedPlayer.id;
                });
                try {
                    await ApiService.apiGameHeadtoheadmatchmakeEnrollCreate({ lineup: createdLineup });
                } catch (error) {
                    console.error(error);
                    if (error?.status === 400) {
                        if (error?.body[0] === 'Game lineup is completely filled') {
                            toast.error('This game has already been filled. Try another.');
                        } else {
                            toast.error(error?.body[0]);
                        }
                        trackEvent('Lineup submitted - daily cap exceeded');
                        setLoadingLineupRequest(false);
                        return;
                    }
                }
                trackEvent('Lineup submitted');
                toast.success("Lineup submitted! You're now in the matchmaking queue.");
                router.push(`/games/open`);
                setLoadingLineupRequest(false);
            }
        } catch (error) {
            console.error(error);
            setLoadingLineupRequest(false);
            toast.error('There was an error when trying to submit your team. Please try again later.');
        }
    }

    useEffect(() => {
        if (selectPosition) {
            filterPlayerPosition([selectedPosition.value]);
        }
    }, [selectedPosition]);

    return (
        <PageLoadingWrapper loading={loading}>
            {!loading && (
                <>
                    <div className="bg-black overflow-auto">
                        <>
                            <MobileMatchmakingLobbyHeader
                                isLoading={loadingLineupRequest}
                                animateHeader={animateHeader}
                                isSubmitDisabled={isSubmitDisabled}
                                onSubmit={onSubmit}
                            />
                            <MatchmakingLobbyHeader
                                isLoading={loadingLineupRequest}
                                animateHeader={animateHeader}
                                isSubmitDisabled={isSubmitDisabled}
                                onSubmit={onSubmit}
                            />
                        </>
                        <div
                            className={classNames('flex flex-col items-center transition-all ease-in-out duration-300', {
                                'mt-[120px]': !animateHeader,
                                'mt-[80px] sm:mt-[120px]': animateHeader,
                            })}
                        >
                            <div className="flex w-full justify-center max-w-7xl sm:px-4 pt-6" data-tut="team-formation">
                                <CurrentLineup
                                    tokensRequired={5}
                                    selectedPlayers={selectedPlayers.map((selectedPlayer) => {
                                        if (!selectedPlayer) return EmptyRosterPlayer;
                                        return { ...selectedPlayer };
                                    })}
                                    filterPosition={(position) => setCardPosition(position)}
                                    addPlayerToSelection={addPlayerToSelection}
                                />
                                <MobileCurrentLineup
                                    tokensRequired={5}
                                    selectedPlayers={selectedPlayers.map((selectedPlayer) => {
                                        if (!selectedPlayer) return EmptyRosterPlayer;
                                        return { ...selectedPlayer };
                                    })}
                                    filterPosition={(position) => setCardPosition(position)}
                                    addPlayerToSelection={addPlayerToSelection}
                                />
                            </div>
                            <div className="sm:mt-0 flex flex-col w-full max-w-7xl 2xl:min-w-[1420px] sm:px-4">
                                <div className="mt-6">
                                    <TableNavBar
                                        changeTab={(section) => {
                                            setSelectedSection(section);
                                        }}
                                        useRoutes={false}
                                        routesToUse={generateRoutes()}
                                        withQueryParams={true}
                                    />
                                </div>
                                <div className="w-full max-w-7xl 2xl:min-w-[1420px]">
                                    {selectedSection === 'roster' ? (
                                        <>
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
                                            />
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
                                            />
                                        </>
                                    ) : (
                                        <>
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
                            showNavigation={true}
                            maskClassName="mask"
                            className="helper"
                            rounded={4}
                            accentColor={accentColor}
                            // onAfterOpen={this.disableBody}
                            // onBeforeClose={this.enableBody}
                        />
                    )}
                </>
            )}
            <TutorialModal
                open={showTutorialOpen}
                setOpen={(openValue: boolean) => setShowTutorialOpen(openValue)}
                startTour={() => {
                    setIsTourOpen(true);
                    setShowTutorialOpen(false);
                }}
            />
        </PageLoadingWrapper>
    );
};

export default withAuth(GameLobby);

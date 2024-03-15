import { useState, useEffect } from 'react';
import PlayerSelectTable from 'src/components/gamelobby/PlayerSelectTable';
import { EmbeddedNavbarRoute } from 'src/components/common/EmbeddedNavBar';
import { useRouter } from 'next/router';
import { CurrentLineup } from '../../gamelobby/CurrentLineup';
import { createLineup, EmptyRosterPlayer, getUserDetail, isUserLoggedIn } from 'src/lib/utils';
import { ApiService, CreateLineup, TournamentDetail } from 'src/lib/api';
import PlayerService, { ReadonlyPlayer } from 'src/services/PlayerService';
import { TimeoutModal } from './TimeoutModal';
import GameLobbyHeader from './GameLobbyHeader';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import { TableNavBar } from 'src/components/common/TableNavBar';
import classNames from 'classnames';
import 'react-toastify/dist/ReactToastify.css';
import { trackEvent, trackPageLanding } from '../../../lib/tracking';
import { Position } from 'src/models/position.type';
import { toast } from 'react-toastify';
import MobileGameLobbyHeader from './MobileGameLobbyHeader';
import { MobileCurrentLineup } from 'src/components/gamelobby/MobileCurrentLineup';
import MobilePlayerSelectTable from 'src/components/gamelobby/MobilePlayerSelectTable';
import { CollapsiblePlayer } from 'src/components/lockerRoom/MobileRosterTable';
import { useTableSort } from 'src/hooks/useTableSort';
import { playerTableHeaders } from 'src/lib/constants';
import _ from 'lodash';
import { usePositionFilters } from 'src/hooks';

const generateRoutes = (id: string | string[], round: number): EmbeddedNavbarRoute[] => {
    return [
        {
            path: `/tournament/${id}/line-up-roster/${round || 64}`,
            title: 'Your Roster',
            section: 'line-up-roster',
        },
        {
            path: `/tournament/${id}/line-up-freeagent/${round || 64}`,
            title: 'Free agents',
            section: 'line-up-freeagent',
        },
    ];
};

interface TournamentLineupSelectionProps {
    tournament: TournamentDetail;
    round: string | string[];
    id: string | string[];
    shouldDisplay: boolean;
    submissionCutoff: string;
    tokensRequired: number;
    lineupCreated: () => void;
    reservationExpiresAt: string;
}

export const TournamentLineupSelection: React.FC<TournamentLineupSelectionProps> = ({
    id,
    shouldDisplay,
    tournament,
    tokensRequired,
    round,
    submissionCutoff,
    lineupCreated,
    reservationExpiresAt,
}) => {
    const router = useRouter();
    const { isReady } = router;
    const { positions, selectPosition, selectedPosition } = usePositionFilters();
    const [hasSubmitted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [timer, setTimer] = useState<number>(180);
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [timeoutModalOpen, setTimeoutModalOpen] = useState<boolean>(false);
    const [loadingLineupRequest, setLoadingLineupRequest] = useState<boolean>(false);
    const [lineupSubmitted, setLineupSubmitted] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<(ReadonlyPlayer | typeof EmptyRosterPlayer)[]>([
        EmptyRosterPlayer,
        EmptyRosterPlayer,
        EmptyRosterPlayer,
        EmptyRosterPlayer,
        EmptyRosterPlayer,
    ]);
    const [players, setPlayers] = useState<Array<ReadonlyPlayer>>([]);
    const [freeAgents, setFreeAgents] = useState<Array<ReadonlyPlayer>>([]);
    const [animateHeader] = useState(false);
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
    const [tab, setTab] = useState('line-up-roster');

    const isSubmitDisabled =
        hasSubmitted || selectedPlayers.some((p) => p === EmptyRosterPlayer) || !selectedPlayers.some((selectedPlayer) => selectedPlayer?.team);

    const loadData = async (): Promise<void> => {
        try {
            if (!isUserLoggedIn()) {
                setLoading(false);
            } else {
                const rosterPlayers = await PlayerService.getPlayerRoster(getUserDetail()?.team?.id);
                const freeAgentsRequest = await PlayerService.getFreeAgents();
                setFreeAgents(freeAgentsRequest);
                setAvailableFreeAgents(freeAgentsRequest as CollapsiblePlayer[]);
                setPlayers(rosterPlayers);
                setAvailablePlayers(rosterPlayers as CollapsiblePlayer[]);
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
            toast.error('There was an error retrieving the game. Please try again later. ');
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
        } else if (
            tokensRequired &&
            player.token > 0 &&
            selectedPlayers.filter((p) => p && p !== EmptyRosterPlayer && p.token > 0).length >= tokensRequired
        ) {
            toast.error(`You can only enter ${tokensRequired} owned-swoopster${tokensRequired > 1 ? 's' : ''} in your lineup for this contest.`);
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
        if (!isReady) return;
        trackPageLanding(`Game lobby`);
        loadData();
    }, [isReady]);

    useEffect(() => {
        let interval;

        const countdown = () => {
            const diff = getNowTimestampDifferenceInSeconds();
            if (diff <= 0) {
                setTimer(0);
                if (interval) {
                    clearInterval(interval);
                }
                setTimeoutModalOpen(true);
            } else if (diff === 30) {
                toast.warning('Just 30 seconds left!');
                setTimer(diff);
            } else {
                setTimer(diff);
            }
        };

        if (router.isReady && !loading && !lineupSubmitted) {
            countdown(); // initialize the countdown
            interval = setInterval(countdown, 1000); // start the countdown
        }

        // cleanup function to clear the interval
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [loading, reservationExpiresAt]);

    const getNowTimestampDifferenceInSeconds = (): number => {
        const now = new Date();
        const nowTimestamp = now.getTime();
        const reservationTimestamp = new Date(reservationExpiresAt).getTime();
        const difference = reservationTimestamp - nowTimestamp;
        return Math.floor(difference / 1000);
    };

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
                await ApiService.apiGameTournamentLineupCreate(tournament.id.toString(), createdLineup);
                setLineupSubmitted(true);
                toast.success("You've successfully submitted your lineup for the Tournament!");
                lineupCreated();
                trackEvent('Lineup submitted');
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
                    <div
                        className={classNames('bg-black w-full', {
                            hidden: !shouldDisplay,
                        })}
                    >
                        <>
                            <MobileGameLobbyHeader
                                submissionCutoff={submissionCutoff}
                                isLoading={loadingLineupRequest}
                                animateHeader={animateHeader}
                                isSubmitDisabled={isSubmitDisabled}
                                onSubmit={onSubmit}
                                timer={timer}
                                kind={tournament?.kind}
                            />
                            <GameLobbyHeader
                                submissionCutoff={submissionCutoff}
                                isLoading={loadingLineupRequest}
                                animateHeader={animateHeader}
                                isSubmitDisabled={isSubmitDisabled}
                                onSubmit={onSubmit}
                                timer={timer}
                                kind={tournament?.kind}
                            />
                        </>
                        <div
                            className={classNames('flex flex-col items-center transition-all ease-in-out duration-300', {
                                'mt-[50-px]': !animateHeader,
                                'mt-[80px] sm:mt-[120px]': animateHeader,
                            })}
                        >
                            <div className="flex w-full max-w-7xl sm:px-4 pt-6">
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
                                        routesToUse={generateRoutes(id as string, Number(round))}
                                        withQueryParams={false}
                                        useRoutes={false}
                                        changeTab={(tab) => setTab(tab)}
                                    />
                                </div>
                                <div className="w-full max-w-7xl 2xl:min-w-[1420px]">
                                    {tab === 'line-up-roster' ? (
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
                    <TimeoutModal open={timeoutModalOpen} />
                </>
            )}
        </PageLoadingWrapper>
    );
};

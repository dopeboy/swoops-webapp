import { ReactElement, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LayoutDecider } from 'src/components/common/LayoutDecider';
import 'rc-tabs/assets/index.css';
import { ApiService, PlayerV2, TeamLeaderboardListing, Team, PlayerProgression } from 'src/lib/api';
import { TableLoadingSpinner } from 'src/components/common/TableLoadingSpinner';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Button from 'src/components/common/button/Button';
import { ChipPosition, ColorTheme } from 'src/components/common/button/types';
import PlayerService, { ReadonlyPlayer } from 'src/services/PlayerService';
import { PlayerBackCard } from 'src/components/playerDetail/PlayerBackCard';
import { PlayerBackCardDelta } from 'src/components/playerDetail/PlayerBackCardDelta';
import { PlayerAverageStats } from 'src/components/playerDetail/PlayerAverageStats';
import { getSortedPositions } from 'src/lib/utils';
import deltaData from './playerDelta.json';

export interface TeamLeaderboardListingWithRank extends TeamLeaderboardListing {
    rank: number;
}

export interface PlayersLeaderboardWithRank extends PlayerV2 {
    rank: number;
}

export interface PlayersWithRevealStats extends ReadonlyPlayer {
    revealed: boolean;
}

const PlayerNewStats = (): ReactElement => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [player, setPlayer] = useState<PlayersWithRevealStats>(null);
    const [playersWithReveal, setPlayersWithReveal] = useState<PlayersWithRevealStats[]>([]);
    const { teamId } = router.query;
    const [currentTeam, setCurrentTeam] = useState<Team>();
    const [loadingImage, setLoadingImage] = useState<boolean>(true);
    const [deltaPlayer, setDeltaPlayer] = useState<PlayerProgression>();

    const getPlayers = async (): Promise<void> => {
        try {
            const allPlayers = await PlayerService.getPlayerRoster(Number(teamId));
            const newPlayers = [...allPlayers]
                .filter((p) => p.token >= 0 && p.token < 3000)
                .map((p) => {
                    return {
                        ...p,
                        revealed: false,
                    };
                });
            setPlayersWithReveal(newPlayers);
            setPlayer(newPlayers[0]);
            getDeltaPlayer(newPlayers[0]);
        } catch (err) {
            console.error('Error getting players: ' + err);
        }
    };

    const getDeltaPlayer = async (p) => {
        setLoadingImage(true);
        const deltaPlayerResult = await ApiService.apiGamePlayerTokenProgressionRead(p.token.toString());
        // const deltaPlayerResult = deltaData;
        setLoadingImage(false);
        setLoading(false);
        setDeltaPlayer(deltaPlayerResult as PlayerProgression);
    };

    const getInitialInfo = async (): Promise<void> => {
        try {
            await getPlayers();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    };

    const getTeam = async (): Promise<void> => {
        try {
            const team = await ApiService.apiGameTeamRead(Number(teamId));
            setCurrentTeam(team);
        } catch (err) {
            console.error('Error getting team' + err);
        }
    };

    useEffect(() => {
        if (!router.isReady) return;
        getTeam();
    }, [router.isReady]);

    useEffect(() => {
        if (!currentTeam?.id) return;
        getInitialInfo();
    }, [currentTeam?.id]);

    const nextPlayer = () => {
        const playerIndex = playersWithReveal.findIndex((p) => p?.id === player?.id);
        if (playersWithReveal[playerIndex + 1]) {
            setPlayer(playersWithReveal[playerIndex + 1]);
            getDeltaPlayer(playersWithReveal[playerIndex + 1]);
        }
    };

    const previousPlayer = () => {
        const playerIndex = playersWithReveal.findIndex((p) => p?.id === player?.id);
        if (playersWithReveal[playerIndex - 1]) {
            setPlayer(playersWithReveal[playerIndex - 1]);
            getDeltaPlayer(playersWithReveal[playerIndex - 1]);
        }
    };

    const hasNextPlayer = () => {
        const playerIndex = playersWithReveal.findIndex((p) => p?.id === player?.id);
        if (playersWithReveal[playerIndex + 1]) {
            return true;
        }
        return false;
    };

    const hasPreviousPlayer = () => {
        const playerIndex = playersWithReveal.findIndex((p) => p?.id === player?.id);
        if (playersWithReveal[playerIndex - 1]) {
            return true;
        }
        return false;
    };

    const revealStatsOfPlayer = (playerId: number) => {
        const newPlayers = playersWithReveal.map((p) => {
            if (p.id === playerId) {
                return {
                    ...p,
                    revealed: true,
                };
            }
            return p;
        });
        setPlayersWithReveal(newPlayers);
        setPlayer({
            ...player,
            revealed: true,
        });
    };

    return (
        <LayoutDecider>
            <div className="pl-2 z-10 sm:pl-12 flex flex-row items-center justify-start gap-2 sm:gap-6 w-full">
                <div
                    onClick={() => router.push({ pathname: `/locker-room` })}
                    className="rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-white/16"
                >
                    <ChevronLeftIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col gap-2 sm:gap-0">
                    <span className="text-white heading-two md:heading-one">New Player Stats</span>
                    <div className="flex flex-row items-center justify-start gap-2 text-white/64 subheading-three sm:subheading-two">
                        <span>{currentTeam?.name}</span>
                    </div>
                </div>
            </div>
            <div className="h-12" />
            <div className="dark bg-black pt-6">
                {!loading ? (
                    <>
                        <div className="actions flex justify-center gap-6">
                            <button
                                onClick={() => {
                                    if (hasPreviousPlayer()) {
                                        previousPlayer();
                                    }
                                }}
                                className={`flex flex-col w-52 items-center subheading-two font-normal text-black bg-transparent justify-center p-2 md:p-2`}
                            >
                                <div
                                    className={classNames(
                                        'flex flex-col items-center text-white border-white justify-center w-full h-full border-2 border-white py-3 px-3 rounded-lg bg-transparent',
                                        !hasPreviousPlayer() ? 'border-white/30 text-white/30' : ''
                                    )}
                                >
                                    Previous
                                </div>
                            </button>
                            <button
                                onClick={() => {
                                    if (hasNextPlayer()) {
                                        nextPlayer();
                                    }
                                }}
                                className={`flex flex-col w-52 items-center subheading-two font-normal text-black bg-transparent justify-center p-2 md:p-2`}
                            >
                                <div
                                    className={classNames(
                                        'flex flex-col items-center text-white border-white justify-center w-full h-full border-2 border-white py-3 px-3 rounded-lg bg-transparent',
                                        !hasNextPlayer() ? 'border-white/30 text-white/30' : ''
                                    )}
                                >
                                    Next
                                </div>
                            </button>
                        </div>
                        <div className="flex justify-center flex-col text-center items-center mt-6">
                            <h1 className="text-white heading-two"> {player?.full_name || 'Unamed'} </h1>
                            <p className="text-white/60 font-bold">
                                {getSortedPositions(player?.positions || []).map((position: string, index: number) => (
                                    <span key={position + index} className="text-[10px] capitalize detail-one mt-2 -mb-1.5 text-gray-400">
                                        {position}
                                        {index !== player?.positions.length - 1 ? ' /' : ''}
                                    </span>
                                ))}
                            </p>
                        </div>
                        {/* {!loadingImage && (
                            <div className="reveal-action flex justify-center mt-6">
                                {!player?.revealed ? (
                                    <Button
                                        disabled={loadingImage}
                                        className="text-base"
                                        chipPosition={ChipPosition.Right}
                                        colorTheme={ColorTheme.AssistGreen}
                                        onClick={() => {
                                            revealStatsOfPlayer(player?.id);
                                        }}
                                    >
                                        Reveal New Stat
                                    </Button>
                                ) : (
                                    <></>
                                )}
                            </div>
                        )} */}

                        {!loadingImage ? (
                            <div className="pt-2 pb-4 md:pb-8 md:pt-4 md:px-8 flex flex-col items-center w-full">
                                <PlayerBackCardDelta
                                    player={player}
                                    withGradient={true}
                                    playerImageURL={`${player.token}_no_bg.png`}
                                    delta={deltaPlayer}
                                />
                                <PlayerAverageStats player={player} team={currentTeam} />
                            </div>
                        ) : (
                            <TableLoadingSpinner loading={loadingImage} />
                        )}
                    </>
                ) : (
                    <TableLoadingSpinner loading={loading} />
                )}
            </div>
        </LayoutDecider>
    );
};

export default PlayerNewStats;

import _ from 'lodash';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { ApiService, Game } from 'src/lib/api';
import {
    getPlayerObject,
    getPlayerFromPlay,
    replaceUuidWithPlayerName,
    getActionFromPlay,
    getActionTypeFromPlay,
    getTeamFromPlay,
} from 'src/lib/playByPlayUtils';
import { PlayerBoxScore } from 'src/models/player-box-score';
import { ReadonlyPlayer } from 'src/services/PlayerService';

interface CompleteQuarters {
    Q1: any[];
    Q2: any[];
    Q3: any[];
    Q4: any[];
}

interface ProgressiveBoxScore {
    player: ReadonlyPlayer;
    boxScore: PlayerBoxScore;
}

export interface ProgressiveBoxScores {
    lineupOneBoxScore: ProgressiveBoxScore[];
    lineupTwoBoxScore: ProgressiveBoxScore[];
}
interface ProgressiveQuarter {
    finished: boolean;
    plays: any[];
    finalScores: { challenger_score: number; challenged_score: number };
    currentScores: { challenger_score: number; challenged_score: number };
    progressiveBoxScores: ProgressiveBoxScores;
}
export interface ProgressiveQuarters {
    Q1: ProgressiveQuarter;
    Q2: ProgressiveQuarter;
    Q3: ProgressiveQuarter;
    Q4: ProgressiveQuarter;
}

export interface PlayByPlayBoxScore {
    player: ReadonlyPlayer;
    boxScore: PlayerBoxScore;
    changedStats?: { [key: string]: boolean };
}

export interface PlayByPlayBoxScores {
    lineupOneBoxScore: PlayByPlayBoxScore[];
    lineupTwoBoxScore: PlayByPlayBoxScore[];
}

interface UsePlayByPlay {
    playByPlayData: any[];
    playTotalAmount: number;
    progressiveQuarters: ProgressiveQuarters;
    speed: number;
    setSpeed: (speed: number) => void;
    isPaused: boolean;
    shouldAnimate: boolean;
    skipAnimation: () => void;
    getEmptyBoxScore: (boxScore: PlayByPlayBoxScores) => PlayByPlayBoxScores;
    setIsPaused: (isPaused: boolean) => void;
    completeQuarters: CompleteQuarters;
    currentQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    setCurrentQuarter: (quarter: string, userTriggered?: boolean) => void;
    setGame: (game: Game) => void;
    setProgressiveQuarters: (progressiveQuarters: ProgressiveQuarters) => void;
    setBoxScore: (boxScores: ProgressiveBoxScores) => void;
}

export const usePlayByPlay = (): UsePlayByPlay => {
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const isPausedRef = useRef<boolean>(true);
    const speedRef = useRef<number>(1000);
    const shouldAnimateRef = useRef<boolean>(true);
    const currentQuarterRef = useRef<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
    const waitingForBoxScoreRef = useRef<boolean>(true);
    const [waitingForBoxScore, setWaitingForBoxScore] = useState<boolean>(true);
    const progressiveQuartersRef = useRef({
        Q1: { finished: false, plays: [] },
        Q2: { finished: false, plays: [] },
        Q3: { finished: false, plays: [] },
        Q4: { finished: false, plays: [] },
    });
    const [playByPlayData, setPlayByPlayData] = useState<any[]>([]);
    const [currentQuarter, setCurrentQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [speed, setSpeed] = useState<number>(1000);
    const [boxScore, setBoxScore] = useState<PlayByPlayBoxScores>(null);
    const [shouldAnimate, setShouldAnimate] = useState<boolean>(true);
    const [, setPlayerObject] = useState({});
    const [game, setGame] = useState<Game>(null);
    const [progressiveQuarters, setProgressiveQuarters] = useState<ProgressiveQuarters>({
        Q1: {
            finished: false,
            plays: [],
            finalScores: { challenger_score: 0, challenged_score: 0 },
            currentScores: { challenger_score: 0, challenged_score: 0 },
            progressiveBoxScores: { lineupOneBoxScore: [], lineupTwoBoxScore: [] },
        },
        Q2: {
            finished: false,
            plays: [],
            finalScores: { challenger_score: 0, challenged_score: 0 },
            currentScores: { challenger_score: 0, challenged_score: 0 },
            progressiveBoxScores: { lineupOneBoxScore: [], lineupTwoBoxScore: [] },
        },
        Q3: {
            finished: false,
            plays: [],
            finalScores: { challenger_score: 0, challenged_score: 0 },
            currentScores: { challenger_score: 0, challenged_score: 0 },
            progressiveBoxScores: { lineupOneBoxScore: [], lineupTwoBoxScore: [] },
        },
        Q4: {
            finished: false,
            plays: [],
            finalScores: { challenger_score: 0, challenged_score: 0 },
            currentScores: { challenger_score: 0, challenged_score: 0 },
            progressiveBoxScores: { lineupOneBoxScore: [], lineupTwoBoxScore: [] },
        },
    });

    const [completeQuarters, setCompleteQuarters] = useState<CompleteQuarters>({
        Q1: [],
        Q2: [],
        Q3: [],
        Q4: [],
    });

    const markGameAsRevealed = (): void => {
        // Purposefully not awaiting this call
        try {
            if (!game?.reveal) {
                ApiService.apiGamePartialUpdate([{ id: game?.id }]);
            }
        } catch {
            // Do nothing
        }
    };

    const gamePlayByPlayReadProxy = async (gameId: number): Promise<any> => {
        return ApiService.apiGamePlayByPlayRead(gameId);
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

    const getProgressiveBoxScoreFromPlay = (play: any, boxScore: PlayByPlayBoxScores): PlayByPlayBoxScores => {
        const { player, action, action_type, team } = play;

        let newProgressiveBoxScore: ProgressiveBoxScores;
        switch (action) {
            case '2PT':
                if (action_type === 'missed') {
                    newProgressiveBoxScore = getProgressiveBoxScoreIncrement(
                        boxScore,
                        [
                            { key: 'two_pa', increment: 1 },
                            { key: 'fga', increment: 1 },
                        ],
                        player.uuid,
                        team?.lineupNumber
                    );
                } else {
                    newProgressiveBoxScore = getProgressiveBoxScoreIncrement(
                        boxScore,
                        [
                            { key: 'two_pa', increment: 1 },
                            { key: 'fga', increment: 1 },
                            { key: 'two_p', increment: 1 },
                            { key: 'fg', increment: 1 },
                            { key: 'pts', increment: 2 },
                        ],
                        player.uuid,
                        team?.lineupNumber
                    );
                }
                break;
            case '3PT':
                if (action_type === 'missed') {
                    newProgressiveBoxScore = getProgressiveBoxScoreIncrement(
                        boxScore,
                        [
                            { key: 'three_pa', increment: 1 },
                            { key: 'fga', increment: 1 },
                        ],
                        player.uuid,
                        team?.lineupNumber
                    );
                } else {
                    newProgressiveBoxScore = getProgressiveBoxScoreIncrement(
                        boxScore,
                        [
                            { key: 'three_pa', increment: 1 },
                            { key: 'fga', increment: 1 },
                            { key: 'three_p', increment: 1 },
                            { key: 'fg', increment: 1 },
                            { key: 'pts', increment: 3 },
                        ],
                        player.uuid,
                        team?.lineupNumber
                    );
                }
                break;
            case 'FT':
                if (action_type === 'missed') {
                    newProgressiveBoxScore = getProgressiveBoxScoreIncrement(
                        boxScore,
                        [{ key: 'fta', increment: 1 }],
                        player.uuid,
                        team?.lineupNumber
                    );
                } else {
                    newProgressiveBoxScore = getProgressiveBoxScoreIncrement(
                        boxScore,
                        [
                            { key: 'fta', increment: 1 },
                            { key: 'ft', increment: 1 },
                            { key: 'pts', increment: 1 },
                        ],
                        player.uuid,
                        team?.lineupNumber
                    );
                }
                break;
            case 'AST':
                newProgressiveBoxScore = getProgressiveBoxScoreIncrement(boxScore, [{ key: 'ast', increment: 1 }], player.uuid, team?.lineupNumber);
                break;
            case 'STL':
                newProgressiveBoxScore = getProgressiveBoxScoreIncrement(boxScore, [{ key: 'stl', increment: 1 }], player.uuid, team?.lineupNumber);
                break;
            case 'BLK':
                newProgressiveBoxScore = getProgressiveBoxScoreIncrement(boxScore, [{ key: 'blk', increment: 1 }], player.uuid, team?.lineupNumber);
                break;
            case 'TO':
                newProgressiveBoxScore = getProgressiveBoxScoreIncrement(boxScore, [{ key: 'tov', increment: 1 }], player.uuid, team?.lineupNumber);
                break;
            case 'FOUL':
                newProgressiveBoxScore = getProgressiveBoxScoreIncrement(boxScore, [{ key: 'pf', increment: 1 }], player.uuid, team?.lineupNumber);
                break;
            case 'OREB':
                newProgressiveBoxScore = getProgressiveBoxScoreIncrement(
                    boxScore,
                    [
                        { key: 'orb', increment: 1 },
                        { key: 'trb', increment: 1 },
                    ],
                    player.uuid,
                    team?.lineupNumber
                );
                break;
            case 'DREB':
                newProgressiveBoxScore = getProgressiveBoxScoreIncrement(
                    boxScore,
                    [
                        { key: 'drb', increment: 1 },
                        { key: 'trb', increment: 1 },
                    ],
                    player.uuid,
                    team?.lineupNumber
                );
                break;
        }
        return newProgressiveBoxScore;
    };

    const fetchPlayByPlayData = async (): Promise<void> => {
        try {
            if (game?.id && boxScore) {
                const response = await gamePlayByPlayReadProxy(game?.id);
                const playerObject = { ...getPlayerObject(game, 1), ...getPlayerObject(game, 2) };
                setPlayerObject(playerObject);

                if (response?.feed) {
                    const augmentedFeed = response.feed?.map((play, index) => {
                        if (play?.detail?.toLowerCase()?.includes('start') || play?.detail?.toLowerCase()?.includes('end')) {
                            if (play?.detail?.toLowerCase()?.includes('period')) {
                                play.detail = play.detail.replace('Period', 'Quarter');
                            }
                            return play;
                        }
                        const { name, uuid } = getPlayerFromPlay(game, play);
                        const augmentedPlay = {
                            ...play,
                            detail: replaceUuidWithPlayerName(play.detail, name, uuid),
                            player: { name, uuid },
                            token: playerObject[name]?.token,
                            action: getActionFromPlay(play),
                            action_type: getActionTypeFromPlay(play),
                            index,
                        };
                        if (augmentedPlay?.team) {
                            augmentedPlay.team = getTeamFromPlay(game, augmentedPlay);
                        } else {
                            augmentedPlay.team = playerObject[augmentedPlay.player?.name];
                        }
                        return augmentedPlay;
                    });
                    let progressiveBoxScores = getEmptyBoxScore(boxScore);
                    // Generate the progressive box score for each player and play inside augmented play by play
                    const augmentedFeedWithProgressiveBoxScore = augmentedFeed.map((play, index) => {
                        if (index === 0) {
                            return {
                                ...play,
                                progressiveBoxScore: getEmptyBoxScore(boxScore),
                            };
                        } else if (
                            play?.detail?.toLowerCase()?.includes('start of quarter') ||
                            play?.detail?.toLowerCase()?.includes('end of game') ||
                            play?.detail?.toLowerCase()?.includes('end of quarter')
                        ) {
                            return {
                                ...play,
                                progressiveBoxScore: progressiveBoxScores,
                            };
                        }
                        const { lineupOneBoxScore, lineupTwoBoxScore } = getProgressiveBoxScoreFromPlay(play, progressiveBoxScores);
                        progressiveBoxScores = {
                            lineupOneBoxScore,
                            lineupTwoBoxScore,
                        };

                        return {
                            ...play,
                            progressiveBoxScore: {
                                lineupOneBoxScore,
                                lineupTwoBoxScore,
                            },
                        };
                    });

                    setPlayByPlayData(augmentedFeedWithProgressiveBoxScore);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getFullProgressiveQuarter = (quarter: string): ProgressiveQuarter => {
        const quarterData = _.cloneDeep(completeQuarters[quarter]).reverse();
        return {
            currentScores: progressiveQuarters[quarter].finalScores,
            finalScores: progressiveQuarters[quarter].finalScores,
            finished: true,
            plays: quarterData,
            progressiveBoxScores: progressiveQuarters[quarter].progressiveBoxScores,
        };
    };

    const lastQuarter = (): 'Q1' | 'Q2' | 'Q3' | 'Q4' => {
        if (progressiveQuartersRef.current.Q1.finished && progressiveQuartersRef.current.Q2.finished && progressiveQuartersRef.current.Q3.finished) {
            return 'Q4';
        } else if (progressiveQuartersRef.current.Q1.finished && progressiveQuartersRef.current.Q2.finished) {
            return 'Q3';
        } else if (progressiveQuartersRef.current.Q1.finished) {
            return 'Q2';
        } else {
            return 'Q1';
        }
    };

    const skipAnimation = (): void => {
        const fullQuarters = {
            Q1: getFullProgressiveQuarter('Q1'),
            Q2: getFullProgressiveQuarter('Q2'),
            Q3: getFullProgressiveQuarter('Q3'),
            Q4: getFullProgressiveQuarter('Q4'),
        };
        setProgressiveQuarters((prev: any) => {
            return {
                ...prev,
                Q1: {
                    finished: true,
                    plays: fullQuarters.Q1.plays,
                    currentScores: fullQuarters.Q1.currentScores,
                    finalScores: fullQuarters.Q1.finalScores,
                },
                Q2: {
                    finished: true,
                    plays: fullQuarters.Q2.plays,
                    currentScores: fullQuarters.Q2.currentScores,
                    finalScores: fullQuarters.Q2.finalScores,
                },
                Q3: {
                    finished: true,
                    plays: fullQuarters.Q3.plays,
                    currentScores: fullQuarters.Q3.currentScores,
                    finalScores: fullQuarters.Q3.finalScores,
                },
                Q4: {
                    finished: true,
                    plays: fullQuarters.Q4.plays,
                    currentScores: fullQuarters.Q4.currentScores,
                    finalScores: fullQuarters.Q4.finalScores,
                },
            };
        });

        setCurrentQuarter('Q4');
        setIsPaused(true);
        setShouldAnimate(false);
    };

    const animateData = async (timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | undefined>): Promise<void> => {
        if (
            !waitingForBoxScoreRef.current &&
            shouldAnimateRef.current &&
            !isPausedRef.current &&
            completeQuarters[currentQuarterRef.current].length > 0
        ) {
            if (progressiveQuartersRef.current[currentQuarterRef.current].finished) {
                const lastQuarterKey = lastQuarter();
                if (lastQuarterKey !== currentQuarterRef.current) {
                    currentQuarterRef.current = lastQuarterKey;
                }
            }
            const quarterData = _.cloneDeep(completeQuarters[currentQuarterRef.current]);
            const lastPosition = progressiveQuartersRef.current[currentQuarterRef.current].plays.length;
            const quarterDataToFill = quarterData.slice(lastPosition, quarterData.length);
            if (quarterDataToFill.length !== 0) {
                setProgressiveQuarters((prev) => {
                    const currentPlay = quarterDataToFill.shift();
                    return {
                        ...prev,
                        [currentQuarterRef.current]: {
                            finished: prev[currentQuarterRef.current].finished,
                            plays: [currentPlay, ...prev[currentQuarterRef.current].plays],
                            finalScores: prev[currentQuarterRef.current].finalScores,
                            currentScores: {
                                challenger_score: currentPlay.challenger_score,
                                challenged_score: currentPlay.challenged_score,
                            },
                        },
                    };
                });
            }
            if (quarterDataToFill.length === 0) {
                setProgressiveQuarters((prev) => {
                    return {
                        ...prev,
                        [currentQuarterRef.current]: {
                            finished: true,
                            plays: [...prev[currentQuarterRef.current].plays],
                            finalScores: prev[currentQuarterRef.current].finalScores,
                            currentScores: prev[currentQuarterRef.current].finalScores,
                        },
                    };
                });
                switch (currentQuarterRef.current) {
                    case 'Q1':
                        setCurrentQuarter('Q2');
                        break;
                    case 'Q2':
                        setCurrentQuarter('Q3');
                        break;
                    case 'Q3':
                        setCurrentQuarter('Q4');
                        break;
                    case 'Q4':
                        setIsPaused(true);
                        setShouldAnimate(false);
                        markGameAsRevealed();
                        break;
                }
            }
        }

        if (!progressiveQuarters.Q4.finished) {
            timeoutRef.current = setTimeout(() => animateData(timeoutRef), Math.random() * speedRef.current + speedRef.current / 2);
        } else {
            clearTimeout(timeoutRef.current);
        }
    };

    const updateCurrentQuarter = (quarter: string, userTriggered = false): void => {
        if (!waitingForBoxScore) {
            switch (quarter) {
                case 'Q1':
                    setCurrentQuarter('Q1');
                    break;
                case 'Q2':
                    if (userTriggered && !progressiveQuarters.Q2.finished) {
                        const q1 = getFullProgressiveQuarter('Q1');
                        setProgressiveQuarters((prev: any) => {
                            return {
                                ...prev,
                                Q1: { finished: true, plays: q1.plays, currentScores: q1.currentScores, finalScores: q1.finalScores },
                            };
                        });
                    }
                    setCurrentQuarter('Q2');
                    break;
                case 'Q3':
                    if (userTriggered && !progressiveQuarters.Q3.finished) {
                        const twoFirstQuarters = { Q1: getFullProgressiveQuarter('Q1'), Q2: getFullProgressiveQuarter('Q2') };
                        setProgressiveQuarters((prev: any) => {
                            return {
                                ...prev,
                                Q1: {
                                    finished: true,
                                    plays: twoFirstQuarters.Q1.plays,
                                    currentScores: twoFirstQuarters.Q1.currentScores,
                                    finalScores: twoFirstQuarters.Q1.finalScores,
                                },
                                Q2: {
                                    finished: true,
                                    plays: twoFirstQuarters.Q2.plays,
                                    currentScores: twoFirstQuarters.Q2.currentScores,
                                    finalScores: twoFirstQuarters.Q2.finalScores,
                                },
                            };
                        });
                    }
                    setCurrentQuarter('Q3');
                    break;
                case 'Q4':
                    if (userTriggered && !progressiveQuarters.Q4.finished) {
                        const threeFirstQuarters = {
                            Q1: getFullProgressiveQuarter('Q1'),
                            Q2: getFullProgressiveQuarter('Q2'),
                            Q3: getFullProgressiveQuarter('Q3'),
                        };
                        setProgressiveQuarters((prev: any) => {
                            return {
                                ...prev,
                                Q1: {
                                    finished: true,
                                    plays: threeFirstQuarters.Q1.plays,
                                    currentScores: threeFirstQuarters.Q1.currentScores,
                                    finalScores: threeFirstQuarters.Q1.finalScores,
                                },
                                Q2: {
                                    finished: true,
                                    plays: threeFirstQuarters.Q2.plays,
                                    currentScores: threeFirstQuarters.Q2.currentScores,
                                    finalScores: threeFirstQuarters.Q2.finalScores,
                                },
                                Q3: {
                                    finished: true,
                                    plays: threeFirstQuarters.Q3.plays,
                                    currentScores: threeFirstQuarters.Q3.currentScores,
                                    finalScores: threeFirstQuarters.Q3.finalScores,
                                },
                            };
                        });
                    }
                    setCurrentQuarter('Q4');
                    break;
            }
        }
    };

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        waitingForBoxScoreRef.current = waitingForBoxScore;
    }, [waitingForBoxScore]);

    useEffect(() => {
        shouldAnimateRef.current = shouldAnimate;
    }, [shouldAnimate]);

    useEffect(() => {
        currentQuarterRef.current = currentQuarter;
    }, [currentQuarter]);

    useEffect(() => {
        progressiveQuartersRef.current = progressiveQuarters;
    }, [progressiveQuarters]);

    useEffect(() => {
        if (completeQuarters[currentQuarter].length > 0) {
            animateData(timeoutRef);
        }
        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, [completeQuarters]);

    useEffect(() => {
        if (playByPlayData.length > 0) {
            const quarters = [1, 2, 3, 4];
            const filteredQuarterData = quarters.map((quarter: any) => {
                const currentQuarterDataFromState = playByPlayData
                    ?.filter((play) => play.quarter === quarter)
                    ?.sort((a, b) => b.gameclock - a.gameclock);
                const currentQuarterFinalScores = {
                    challenger_score: currentQuarterDataFromState.at(currentQuarterDataFromState.length - 1).challenger_score,
                    challenged_score: currentQuarterDataFromState.at(currentQuarterDataFromState.length - 1).challenged_score,
                };
                return { plays: currentQuarterDataFromState, finalScores: currentQuarterFinalScores };
            });
            setProgressiveQuarters((prev) => {
                return {
                    Q1: { ...prev.Q1, finalScores: filteredQuarterData[0].finalScores },
                    Q2: { ...prev.Q2, finalScores: filteredQuarterData[1].finalScores },
                    Q3: { ...prev.Q3, finalScores: filteredQuarterData[2].finalScores },
                    Q4: { ...prev.Q4, finalScores: filteredQuarterData[3].finalScores },
                };
            });
            setCompleteQuarters(() => {
                return {
                    Q1: filteredQuarterData[0].plays,
                    Q2: filteredQuarterData[1].plays,
                    Q3: filteredQuarterData[2].plays,
                    Q4: filteredQuarterData[3].plays,
                };
            });
        }
    }, [playByPlayData]);

    const getProgressiveBoxScoreIncrement = (
        progressiveBoxScore: ProgressiveBoxScores,
        keysToIncrement: { key: string; increment: number }[],
        playerUuid: any,
        lineupNumber: number
    ): ProgressiveBoxScores => {
        const boxScoreIncremented = {};
        keysToIncrement.forEach(({ key, increment }) => {
            const lineupBoxScore = progressiveBoxScore[`lineup${lineupNumber === 1 ? 'One' : 'Two'}BoxScore`].find(
                (progressiveBoxScore) => progressiveBoxScore.player.uuid === playerUuid
            );
            if (lineupBoxScore) {
                boxScoreIncremented[key] = Number(lineupBoxScore.boxScore[key]) + increment;
            }
        });

        const newProgressiveBoxScore = {
            ...progressiveBoxScore,
            [`lineup${lineupNumber === 1 ? 'One' : 'Two'}BoxScore`]: [
                ...progressiveBoxScore[`lineup${lineupNumber === 1 ? 'One' : 'Two'}BoxScore`].map((progressiveBoxScore) => {
                    if (progressiveBoxScore.player.uuid === playerUuid)
                        return {
                            ...progressiveBoxScore,
                            boxScore: {
                                ...progressiveBoxScore.boxScore,
                                ...boxScoreIncremented,
                            },
                        };
                    else return progressiveBoxScore;
                }),
            ],
        };
        return newProgressiveBoxScore;
    };

    useEffect(() => {
        if (boxScore) {
            setWaitingForBoxScore(false);
        }
    }, [boxScore]);

    useEffect(() => {
        setCurrentQuarter('Q1');
    }, [game, playByPlayData]);

    useEffect(() => {
        if (game && boxScore && boxScore.lineupOneBoxScore && boxScore.lineupTwoBoxScore) {
            fetchPlayByPlayData();
        }
    }, [game, boxScore]);

    return {
        playByPlayData,
        playTotalAmount: playByPlayData.length,
        progressiveQuarters,
        setProgressiveQuarters,
        speed,
        setSpeed,
        isPaused,
        setBoxScore,
        skipAnimation,
        setIsPaused,
        completeQuarters,
        getEmptyBoxScore,
        currentQuarter,
        setCurrentQuarter: updateCurrentQuarter,
        setGame,
        shouldAnimate,
    };
};

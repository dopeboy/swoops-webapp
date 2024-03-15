import { useEffect, useRef, useState } from 'react';
import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import { RevisedGame } from 'src/models/revised-game';
// import { PlayByPlayDataDisplay } from './PlayByPlayDataDisplay';
import { ApiService } from 'src/lib/api';
import { useRouter } from 'next/router';
import { PlayByPlaySpeedControls } from './PlayByPlaySpeedControls';
import { PlayByPlayStackedList } from './PlayByPlayStackedList';

interface PlayByPlayTableProps {
    game?: RevisedGame;
    shouldAnimate: boolean;
    stopAnimation: () => void;
}
export const PlayByPlayTable: React.FC<PlayByPlayTableProps> = ({ game, shouldAnimate, stopAnimation }) => {
    const refObject = useRef({});
    const router = useRouter();
    const timeoutRef = useRef([]);
    const [playByPlayData, setPlayByPlayData] = useState<any[]>([]);
    const [incrementalPlayByPlay, setIncrementalPlayByPlay] = useState([]);
    const [currentAnimatedIndex, setCurrentAnimatedIndex] = useState(0);
    const [currentQuarter, setCurrentQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [speed, setSpeed] = useState<number>(2000);
    const [completedQuarters, setCompletedQuarters] = useState<number>(0);
    const [quarterMaxLength, setQuarterMaxLength] = useState<number>(0);
    const [, setPlayerObject] = useState({});
    const [quarters, setQuarters] = useState({
        Q1: [],
        Q2: [],
        Q3: [],
        Q4: [],
    });

    const isCurrentQuarter = (quarter: number): boolean => {
        switch (currentQuarter) {
            case 'Q1':
                return quarter === 1;
            case 'Q2':
                return quarter === 2;
            case 'Q3':
                return quarter === 3;
            case 'Q4':
                return quarter === 4;
        }
    };

    const animateData = (i: number, data: any[]): NodeJS.Timeout => {
        return setTimeout(() => {
            if (!isPaused && shouldAnimate && i < data.length && isCurrentQuarter(data[i].quarter)) {
                setQuarters((prev) => {
                    return {
                        ...prev,
                        [currentQuarter]: [...prev[currentQuarter], { ...data[i] }],
                    };
                });
                setIncrementalPlayByPlay((prev) => [...prev, data[i]]);
                setCurrentAnimatedIndex(i);
            }
        }, Math.random() * speed);
    };

    const scrollToBottom = (): void => {
        refObject.current[currentQuarter]?.scrollIntoView({ behavior: 'smooth' });
    };

    const gamePlayByPlayReadProxy = async (gameId: number): Promise<any> => {
        return ApiService.apiGamePlayByPlayRead(gameId);
    };

    const getPlayerObject = (lineupNumber: number): any => {
        const playerObject = {};
        for (let i = 1; i < 6; i++) {
            if (game?.[`lineup_${lineupNumber}`]) {
                const player = game?.[`lineup_${lineupNumber}`]?.[`player_${i}`];
                if (player?.full_name) {
                    playerObject[player?.full_name] = {
                        id: game?.[`lineup_${lineupNumber}`]?.team?.id,
                        name: game?.[`lineup_${lineupNumber}`]?.team?.name,
                    };
                }
            }
        }
        return playerObject;
    };

    const getPlayerFromPlay = (play: any): string => {
        if (play?.detail) {
            if (play?.detail?.toLowerCase()?.includes('by')) {
                const splitDetail = play?.detail?.split(' ');
                const index = splitDetail.findIndex((word) => word?.toLowerCase()?.includes('by'));
                if (play?.detail?.toLowerCase()?.includes('from')) {
                    const index2 = splitDetail.findIndex((word) => word?.toLowerCase()?.includes('from'));
                    let playerName = '';
                    for (let i = index + 1; i < index2; i++) {
                        playerName += `${splitDetail[i]} `;
                    }
                    return playerName.trim();
                } else {
                    let playerName = '';
                    for (let i = index + 1; i < splitDetail.length; i++) {
                        playerName += `${splitDetail[i]} `;
                    }
                    return playerName.trim();
                }
            } else if (play?.detail?.toLowerCase()?.includes('on')) {
                const splitDetail = play?.detail?.split(' ');
                const index = splitDetail.findIndex((word) => word.includes('on'));
                let playerName = '';
                for (let i = index + 1; i < splitDetail.length; i++) {
                    playerName += `${splitDetail[i]} `;
                }
                return playerName.trim();
            }
        }
        return '';
    };

    const getActionFromPlay = (play: any): string => {
        if (play?.detail) {
            if (play?.detail?.toLowerCase()?.includes('start')) {
                return 'Start';
            } else if (play?.detail?.toLowerCase()?.includes('two')) {
                return '2PT';
            } else if (play?.detail?.toLowerCase()?.includes('three')) {
                return '3PT';
            } else if (play?.detail?.toLowerCase()?.includes('free')) {
                return 'FT';
            } else if (play?.detail?.toLowerCase()?.includes('rebound')) {
                return 'REB';
            } else if (play?.detail?.toLowerCase()?.includes('assist')) {
                return 'AST';
            } else if (play?.detail?.toLowerCase()?.includes('steal')) {
                return 'STL';
            } else if (play?.detail?.toLowerCase()?.includes('block')) {
                return 'BLK';
            } else if (play?.detail?.toLowerCase()?.includes('turnover')) {
                return 'TO';
            } else if (play?.detail?.toLowerCase()?.includes('foul')) {
                return 'FOUL';
            }
        }
        return '';
    };

    const getActionTypeFromPlay = (play: any): string => {
        if (play?.detail) {
            if (play?.detail?.toLowerCase()?.includes('made')) {
                return 'made';
            } else if (play?.detail?.toLowerCase()?.includes('missed')) {
                return 'missed';
            } else if (play?.detail?.toLowerCase()?.includes('rebound')) {
                return 'rebound';
            } else if (play?.detail?.toLowerCase()?.includes('assist')) {
                return 'assist';
            } else if (play?.detail?.toLowerCase()?.includes('steal')) {
                return 'steal';
            } else if (play?.detail?.toLowerCase()?.includes('block')) {
                return 'block';
            } else if (play?.detail?.toLowerCase()?.includes('turnover')) {
                return 'turnover';
            } else if (play?.detail?.toLowerCase()?.includes('foul')) {
                return 'foul';
            }
        }
        return '';
    };

    const fetchPlayByPlayData = async (): Promise<void> => {
        try {
            if (game?.id) {
                const response = await gamePlayByPlayReadProxy(game?.id);
                const playerObject = { ...getPlayerObject(1), ...getPlayerObject(2) };
                setPlayerObject(playerObject);

                if (response?.feed) {
                    const augmentedFeed = response.feed?.map((play) => {
                        const augmentedPlay = {
                            ...play,
                            player: getPlayerFromPlay(play),
                            action: getActionFromPlay(play),
                            action_type: getActionTypeFromPlay(play),
                        };
                        augmentedPlay.team = playerObject[augmentedPlay.player];
                        return augmentedPlay;
                    });
                    setPlayByPlayData(augmentedFeed);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (playByPlayData.length > 0 && shouldAnimate) {
            timeoutRef.current.forEach((timeout) => clearTimeout(timeout));
            timeoutRef.current.push(animateData(currentAnimatedIndex, playByPlayData));
        }
    }, [speed]);

    useEffect(() => {
        if (playByPlayData.length > 0 && shouldAnimate) {
            if (isPaused) {
                timeoutRef.current.forEach((timeout) => clearTimeout(timeout));
            } else if (!isPaused) {
                timeoutRef.current.forEach((timeout) => clearTimeout(timeout));
                timeoutRef.current.push(animateData(currentAnimatedIndex + 1, playByPlayData));
            }
        }
    }, [isPaused]);

    useEffect(() => {
        if (playByPlayData.length > 0) {
            const currentQuarterDataFromState = playByPlayData
                .filter((play) => isCurrentQuarter(play.quarter))
                ?.sort((a, b) => b.gameclock - a.gameclock);
            setQuarterMaxLength(currentQuarterDataFromState.length);
            if (timeoutRef) {
                timeoutRef.current.forEach((timeout) => clearTimeout(timeout));
            }
            if (shouldAnimate && currentQuarter === 'Q4' && quarters[currentQuarter]?.length === currentQuarterDataFromState?.length) {
                stopAnimation();
                timeoutRef.current.forEach((timeout) => clearTimeout(timeout));
            } else if (shouldAnimate && quarters[currentQuarter]?.length < currentQuarterDataFromState?.length) {
                timeoutRef.current.push(animateData(0, currentQuarterDataFromState));
            } else if (!shouldAnimate) {
                setQuarters((prev) => {
                    return {
                        ...prev,
                        [currentQuarter]: currentQuarterDataFromState,
                    };
                });
            }
            scrollToBottom();
        }
    }, [playByPlayData, currentQuarter]);

    useEffect(() => {
        scrollToBottom();
        if (shouldAnimate && quarters[currentQuarter]?.length === quarterMaxLength) {
            if (completedQuarters === 4) {
                stopAnimation();
            } else {
                setCompletedQuarters((prev) => prev + 1);
            }
        } else {
            timeoutRef.current.forEach((timeout) => clearTimeout(timeout));
            timeoutRef.current.push(animateData(incrementalPlayByPlay?.length + 1, playByPlayData));
        }
    }, [quarters[currentQuarter]]);

    useEffect(() => {
        setCurrentQuarter('Q1');
    }, [playByPlayData]);

    useEffect(() => {
        if (router.isReady) {
            fetchPlayByPlayData();
        }
    }, [router.isReady]);

    return (
        <div className="w-full flex flex-col items-center justify-center py-3 sm:px-0">
            {/* <PlayByPlayDataDisplay data={incrementalPlayByPlay} /> */}
            <PlayByPlaySpeedControls
                isPaused={!shouldAnimate || isPaused}
                disabled={!shouldAnimate}
                setIsPaused={(isPaused) => setIsPaused(isPaused)}
                speed={speed}
                setSpeed={setSpeed}
            />
            <div className="w-full">
                <Tab.Group>
                    <Tab.List className="flex space-x-0.5 rounded-lg bg-black/20 p-1">
                        {Object.keys(quarters).map((quarter, index) => (
                            <Tab
                                onClick={() => setCurrentQuarter(quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4')}
                                disabled={completedQuarters < index + 1}
                                key={index}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full py-2.5 rounded-t-md text-sm subheading-two font-medium leading-5',
                                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-white focus:outline-none focus:ring-2',
                                        selected
                                            ? 'bg-white/[0.12] border-b-2 border-white shadow text-white'
                                            : 'text-white  bg-white/[0.05] hover:bg-white/[0.10]'
                                    )
                                }
                            >
                                {quarter}
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels className="mt-1">
                        {Object.values(quarters).map((quarterData, idx) => (
                            <Tab.Panel
                                key={idx}
                                className={classNames(
                                    'rounded-md bg-off-black py-1',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-white focus:outline-none focus:ring-2'
                                )}
                            >
                                <div className="min-h-[384px] max-h-96 relative h-full overflow-y-scroll overflow-x-hidden">
                                    {playByPlayData?.length > 0 && (
                                        <>
                                            <ul>
                                                <PlayByPlayStackedList playByPlayData={quarters[currentQuarter]} />
                                            </ul>
                                            <div ref={(el) => (refObject.current[currentQuarter] = el)} />
                                        </>
                                    )}
                                    {playByPlayData?.length === 0 && (
                                        <div className="flex flex-col justify-center items-center h-96">
                                            <div className="text-white subheading-two">No data available</div>
                                        </div>
                                    )}
                                </div>
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
};

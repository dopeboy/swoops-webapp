import { useEffect, useRef, useState } from 'react';
import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import { RevisedGame } from 'src/models/revised-game';
import { ApiService } from 'src/lib/api';
import { useRouter } from 'next/router';
import { PlayByPlayStackedList } from './PlayByPlayStackedList';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

interface PlayByPlayTableProps {
    game?: RevisedGame;
}
export const PlayByPlayTable: React.FC<PlayByPlayTableProps> = ({ game }) => {
    const refObject = useRef({});
    const router = useRouter();
    const [playByPlayData, setPlayByPlayData] = useState<any[]>([]);
    const [currentQuarter, setCurrentQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
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
                        token: game?.[`lineup_${lineupNumber}`]?.team?.token,
                        lineupNumber,
                    };
                }
            }
        }
        return playerObject;
    };

    const findPlayerName = (lineupNumber: number, playerUuid: string): string => {
        for (let i = 1; i < 6; i++) {
            if (game?.[`lineup_${lineupNumber}`]) {
                const player = game?.[`lineup_${lineupNumber}`]?.[`player_${i}`];
                if (player?.uuid === playerUuid) {
                    return player?.full_name;
                }
            }
        }
        return '';
    };

    const getPlayerFromPlay = (play: any): { name: string; uuid: string } => {
        if (play?.detail && play?.detail?.toLowerCase()?.includes('{')) {
            const splitDetail = play?.detail?.split(' ');
            if (splitDetail) {
                const index = splitDetail.findIndex((word) => word?.toLowerCase()?.includes('{'));
                const playerUuid = splitDetail[index]?.replace('{', '')?.replace('}', '');
                const playerNameInLineupOne = findPlayerName(1, playerUuid);
                if (playerNameInLineupOne) {
                    return { name: playerNameInLineupOne, uuid: playerUuid };
                }
                const playerNameInLineupTwo = findPlayerName(2, playerUuid);
                if (playerNameInLineupTwo) {
                    return { name: playerNameInLineupTwo, uuid: playerUuid };
                }
            }
        }
        return { name: '', uuid: '' };
    };

    const replaceUuidWithPlayerName = (detail: string, playerName: string, playerUuid: string): any => {
        return detail?.replace(`{${playerUuid}}`, playerName);
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
                    const augmentedFeed = response?.feed
                        ?.filter((play) => !play?.detail?.toLowerCase()?.includes('start'))
                        ?.map((play) => {
                            const { name, uuid } = getPlayerFromPlay(play);
                            const augmentedPlay = {
                                ...play,
                                detail: replaceUuidWithPlayerName(play.detail, name, uuid),
                                player: name,
                                token: playerObject[name]?.token,
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
        if (playByPlayData.length > 0) {
            const currentQuarterDataFromState = playByPlayData
                .filter((play) => isCurrentQuarter(play.quarter))
                ?.sort((a, b) => b.gameclock - a.gameclock);
            setQuarters((prev) => {
                return {
                    ...prev,
                    [currentQuarter]: currentQuarterDataFromState,
                };
            });
        }
    }, [playByPlayData, currentQuarter]);

    useEffect(() => {
        setCurrentQuarter('Q1');
    }, [playByPlayData]);

    useEffect(() => {
        if (router.isReady) {
            fetchPlayByPlayData();
        }
    }, [router.isReady]);

    return (
        <div className="w-full flex flex-col items-center justify-center pt-3 pb-24 sm:px-0">
            <div className="w-full">
                <Tab.Group>
                    <Tab.List className="flex space-x-0.5 rounded-lg bg-black/20 p-1">
                        {Object.keys(quarters).map((quarter, index) => (
                            <Tab
                                onClick={() => setCurrentQuarter(quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4')}
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
                        <div className="flex flex-row items-center justify-between w-full py-3 bg-white rounded-md mb-2 divide-x-2 divide-black">
                            <div className="flex flex-row items-center justify-center gap-2 w-1/2">
                                <ShieldCheckIcon className=" flex-shrink-0 -mt-1 h-5 w-5" aria-hidden="true" />
                                <span className="subheading-one text-center">{game?.lineup_1.team?.name || 'Unnamed'}</span>
                            </div>
                            <div className="flex flex-row items-center justify-center gap-2 w-1/2">
                                <ShieldCheckIcon className=" flex-shrink-0 -mt-1 h-5 w-5" aria-hidden="true" />
                                <span className="subheading-one text-center">{game?.lineup_2.team?.name || 'Unnamed'}</span>
                            </div>
                        </div>
                        {Object.values(quarters).map((quarterData, idx) => (
                            <Tab.Panel
                                key={idx}
                                className={classNames(
                                    'rounded-md bg-off-black py-1',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-white focus:outline-none focus:ring-2'
                                )}
                            >
                                <div className="h-[484px] relative overflow-y-scroll overflow-x-hidden">
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

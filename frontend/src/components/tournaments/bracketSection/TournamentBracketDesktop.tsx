import { TournamentDetail, TournamentRound } from 'src/lib/api';
import { useRef, useState, useEffect, useMemo } from 'react';
import { PanZoom } from 'react-easy-panzoom';
import { MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/solid';
import { TournamentBracketSectionCard } from './TournamentBracketSectionCard';
import classNames from 'classnames';
import { getTeamLogoFinalResolutionPath, getDivisionButtonsForRoundAmount, getFilteredRounds } from 'src/lib/utils';
import { TournamentChampionshipBracketSectionCardTeam } from './TournamentChampionshipBracketSectionCardTeam';
import { trackEvent } from 'src/lib/tracking';

interface TournamentBracketDesktopProps {
    tournament: TournamentDetail;
    round: string | string[];
    id: string | string[];
    className: string;
    revealAllSeries: boolean;
}

interface Bracket {
    left_rounds: any[];
    final_round: any;
    right_rounds: any[];
}

const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL || '/';

const RoundComponent = ({ id, roundId, bracket, position, revealSerie, fullBracket }) => {
    const isParentSerieRevealed = (tree, serieId) => {
        if (!tree || !tree.children || tree.children.length === 0) {
            return false;
        }

        for (const child of tree.children) {
            if (child.series.id === serieId) {
                return tree.series.revealed;
            }

            const parentRevealed = isParentSerieRevealed(child, serieId);
            if (parentRevealed !== false) {
                return parentRevealed;
            }
        }

        return false;
    };

    return (
        <div className={`item-childrens ${position}`}>
            {bracket?.map((parent, index) => (
                <div className={`item-child ${position}`}>
                    <div className={`item ${position}`}>
                        <div className={`item-parent ${position} ${parent?.children?.length === 0 ? 'last' : ''}`}>
                            <TournamentBracketSectionCard
                                id={id}
                                games={parent?.series?.games}
                                status={parent?.series?.status}
                                roundId={parent?.roundId}
                                seriesId={parent?.series?.id}
                                key={index}
                                revealed={parent?.series?.revealed}
                                teams={[parent?.series?.team_1, parent?.series?.team_2]}
                                className="game"
                                revealSerie={(e) => revealSerie(e)}
                                isFirstRound={parent?.children?.length === 0}
                                isParentRevealed={isParentSerieRevealed(fullBracket[0], parent?.series?.id)}
                            />
                        </div>
                        {parent.children && (
                            <RoundComponent
                                fullBracket={fullBracket}
                                id={id}
                                roundId={parent.roundId}
                                bracket={parent.children}
                                position={position}
                                revealSerie={revealSerie}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const TournamentBracketDesktop: React.FC<TournamentBracketDesktopProps> = ({ id, round, className, tournament, revealAllSeries }) => {
    const TournamentBracket = useRef(null);
    const [currentTournament, setCurrentTournament] = useState<TournamentDetail>();
    const [roundsHeader, setRoundsHeader] = useState([]);

    const [bracketData, setBracketData] = useState<Bracket>();
    const [roundAmount, setRoundAmount] = useState<number>();
    const [winner, setWinner] = useState<string>();
    const filteredRounds: { [key: string]: TournamentRound } = useMemo(() => getFilteredRounds(tournament, roundAmount), [tournament, roundAmount]);
    const [finalRevealed, setFinalRevealed] = useState<boolean>(false);

    useEffect(() => {
        if (tournament?.start_date) {
            setRoundAmount(tournament.rounds.length);
            setCurrentTournament(tournament);
        }
    }, [tournament, className]);

    useEffect(() => {
        if (revealAllSeries) {
            handleUnrevealAll();
        }
    }, [revealAllSeries]);

    const getDivisionButtonsForRoundAmountForBracket = (roundAmount: number) => {
        const rounds = getDivisionButtonsForRoundAmount(roundAmount);
        let reversedRounds = [...rounds];
        reversedRounds = reversedRounds.reverse();
        reversedRounds = reversedRounds.splice(1);
        return [...rounds, ...reversedRounds];
    };

    useEffect(() => {
        if (currentTournament?.id) {
            buildBracket(currentTournament.rounds);
        }
    }, [currentTournament]);

    const buildBracket = (rounds) => {
        const roundsWithoutFinal = rounds?.slice(0, rounds?.length - 1);
        const leftRounds = {
            rounds: roundsWithoutFinal.map((round) => ({
                id: round.id,
                series: round.series.slice(0, Math.ceil(round.series.length / 2)),
            })),
        };
        const rightRounds = {
            rounds: roundsWithoutFinal.map((round) => ({
                id: round.id,
                series: round.series.slice(Math.floor(round.series.length / 2)),
            })),
        };
        const rightTree = buildInversedJson(rightRounds);
        const leftTree = buildInversedJson(leftRounds);
        const finalRound = currentTournament.rounds[currentTournament.rounds?.length - 1];
        setBracketData({
            left_rounds: [leftTree],
            final_round: { round_id: finalRound.id, ...finalRound.series[0] },
            right_rounds: [rightTree],
        });
    };

    useEffect(() => {
        if (bracketData) {
            if (round === '32' || round === '16' || round === '64') {
                let zoomLevel;

                if (window.innerWidth >= 1200) {
                    zoomLevel = 1; // max zoom level for big screens
                } else if (window.innerWidth >= 992) {
                    zoomLevel = 0.8; // slightly zoomed out for medium screens
                } else if (window.innerWidth >= 768) {
                    zoomLevel = 0.6; // more zoomed out for small screens
                } else {
                    zoomLevel = 0.4; // most zoomed out for extra small screens
                }

                TournamentBracket.current.autoCenter(zoomLevel);
                TournamentBracket.current.moveByRatio(0, 10, 0);
            }
        }
    }, [bracketData]);

    useEffect(() => {
        const handleWindowResize = () => {
            if (round === '32' || round === '16' || round === '64') {
                let zoomLevel;

                if (window.innerWidth >= 1800) {
                    zoomLevel = 1; // max zoom level for very large screens
                } else if (window.innerWidth >= 1440) {
                    zoomLevel = 0.9; // slightly zoomed out for large screens
                } else if (window.innerWidth >= 1200) {
                    zoomLevel = 0.8; // zoomed out for medium-large screens
                } else if (window.innerWidth >= 992) {
                    zoomLevel = 0.7; // slightly more zoomed out for medium screens
                } else if (window.innerWidth >= 768) {
                    zoomLevel = 0.6; // more zoomed out for small screens
                } else if (window.innerWidth >= 576) {
                    zoomLevel = 0.5; // even more zoomed out for extra small screens
                } else {
                    zoomLevel = 0.4; // most zoomed out for very small screens
                }
                // const yRatio = -0.22 * (1.1 / zoomLevel);
                let screenRatio;

                if (round === '64') {
                    screenRatio = -0.43;
                } else if (round === '32') {
                    screenRatio = -0.43 / 2;
                } else if (round === '16') {
                    screenRatio = -0.43 / 2 / 2;
                }

                const yRatio = screenRatio * Math.pow(0.97 / zoomLevel, 2);
                // const yRatio = -0.45 * (1.2 / zoomLevel);

                TournamentBracket.current.autoCenter(zoomLevel);

                TournamentBracket.current.moveByRatio(0, yRatio, 1);
            }
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    });

    const buildBracketTree = (seriesByRound, roundIndex = 0, seriesIndex = 0) => {
        if (roundIndex >= seriesByRound.length || !seriesByRound[roundIndex] || seriesIndex >= seriesByRound[roundIndex].series.length) {
            return null;
        }

        const treeRound = seriesByRound[roundIndex];
        const series = treeRound.series[seriesIndex];

        if (!series) {
            return null;
        }

        if (roundIndex === 0) {
            return {
                roundId: treeRound.id,
                series,
                children: [],
            };
        }

        const leftChildIndex = seriesIndex * 2;
        const rightChildIndex = seriesIndex * 2 + 1;

        const leftChild = roundIndex > 0 ? buildBracketTree(seriesByRound, roundIndex - 1, leftChildIndex) : null;
        const rightChild = roundIndex > 0 ? buildBracketTree(seriesByRound, roundIndex - 1, rightChildIndex) : null;

        return {
            roundId: treeRound.id,
            series,
            children: [leftChild, rightChild].filter((child) => child),
        };
    };

    useEffect(() => {
        TournamentBracket.current.reset();
        const roundsNumber = round !== 'championship' ? Math.ceil(Math.log2(Number(round))) : 2;
        setRoundsHeader(
            round !== 'championship' ? getDivisionButtonsForRoundAmountForBracket(roundsNumber) : getDivisionButtonsForRoundAmountForBracket(1)
        );
        if (currentTournament?.id) {
            let tournamentRounds = [...currentTournament.rounds];
            tournamentRounds = tournamentRounds.splice(tournamentRounds?.length - roundsNumber, roundsNumber);
            buildBracket(tournamentRounds);
        }
    }, [round]);

    const buildInversedJson = (input) => {
        const seriesByRound = input.rounds;
        const lastRoundIndex = seriesByRound.length - 1;

        const root = buildBracketTree(seriesByRound, lastRoundIndex, 0);
        return { ...root };
    };

    useEffect(() => {
        if (bracketData?.final_round?.team_1?.id) {
            setWinner(getOverallWinner(bracketData.final_round.games));
        }
    }, [bracketData]);

    const getOverallWinner = (games) => {
        let team_1_wins = 0;
        let team_2_wins = 0;

        for (const game of games) {
            if (game.team_1_score > game.team_2_score) {
                team_1_wins++;
            } else if (game.team_1_score < game.team_2_score) {
                team_2_wins++;
            }
        }

        if (team_1_wins > team_2_wins) {
            return 'team_1';
        } else if (team_1_wins < team_2_wins) {
            return 'team_2';
        } else {
            return 'draw';
        }
    };

    const updateRevealField = (tree, serieId, reveal, parent = null, updatePreviousRounds = true) => {
        if (!tree) {
            return false;
        }

        if (tree.series.id === serieId) {
            tree.series.revealed = reveal;
            if (updatePreviousRounds) {
                if (tree.children[0]) {
                    updateRevealField(tree.children[0], tree.children[0].series.id, reveal, true);
                }
                if (tree.children[1]) {
                    updateRevealField(tree.children[1], tree.children[1].series.id, reveal, true);
                }
            }
            return true;
        }

        for (const child of tree.children) {
            if (updateRevealField(child, serieId, reveal, updatePreviousRounds)) {
                return true;
            }
        }

        return false;
    };

    const handleRevealChange = (serieId) => {
        const updatedBracketTreeLeft = JSON.parse(JSON.stringify(bracketData.left_rounds[0]));
        const updatedBracketTreeRight = JSON.parse(JSON.stringify(bracketData.right_rounds[0]));
        updateRevealField(updatedBracketTreeLeft, serieId, true);
        updateRevealField(updatedBracketTreeRight, serieId, true);
        setBracketData({
            left_rounds: [updatedBracketTreeLeft],
            right_rounds: [updatedBracketTreeRight],
            final_round: bracketData.final_round,
        });
    };

    const unrevealAllSeries = (tree) => {
        if (!tree) {
            return;
        }

        tree.series.revealed = true;

        for (const child of tree.children) {
            unrevealAllSeries(child);
        }
    };

    const handleUnrevealAll = () => {
        const updatedBracketTreeLeft = JSON.parse(JSON.stringify(bracketData.left_rounds[0]));
        const updatedBracketTreeRight = JSON.parse(JSON.stringify(bracketData.right_rounds[0]));
        unrevealAllSeries(updatedBracketTreeLeft);
        unrevealAllSeries(updatedBracketTreeRight);
        setBracketData({
            left_rounds: [updatedBracketTreeLeft],
            right_rounds: [updatedBracketTreeRight],
            final_round: bracketData.final_round,
        });
        setFinalRevealed(true);
    };

    return (
        <>
            <div className={`overflow-y-hidden w-full ${className} justify-center`}>
                <PanZoom ref={TournamentBracket} disableScrollZoom={true} enableBoundingBox={true} realPinch={true} zoomSpeed={3}>
                    <div className="wrapper -z-50 cursor-grab flex mb-[10%] flex-col items-baseline">
                        <div className="bracket-header w-fit flex pl-44 pr-24 pt-12 mb-6 justify-center">
                            {roundsHeader?.map((roundHeader) => (
                                <div className="round">
                                    <div className="round-name"> {roundHeader.title} </div>
                                    <div className="round-date"> {roundHeader.date} </div>
                                </div>
                            ))}
                        </div>
                        <div className="pl-24 pr-24 justify-center">
                            <div className="item">
                                {round !== 'championship' ? (
                                    <RoundComponent
                                        fullBracket={bracketData?.right_rounds}
                                        revealSerie={(e) => handleRevealChange(e)}
                                        id={id}
                                        roundId={filteredRounds[round as string]?.id}
                                        bracket={bracketData?.right_rounds}
                                        position="right"
                                    />
                                ) : (
                                    ''
                                )}
                                <div className={`item-parent final ${round === 'championship' ? 'no-lines' : ''}`}>
                                    <div
                                        onClick={() => {
                                            if (finalRevealed && bracketData?.final_round?.team_1?.id !== 0) {
                                                window.open(
                                                    `/tournament/${id}/round/${bracketData.final_round.round_id}/series/${bracketData.final_round.id}/player-stats`
                                                );
                                            }
                                        }}
                                        className="final-game flex flex-col h-full pb-4 pt-2 px-4"
                                    >
                                        <div className="flex flex-row items-start">
                                            <h1 className="subheading-one text-off-black mb-2">Championship</h1>
                                            {/* <span className="font-medium text-base text-right text-off-black"> Sat Apr 10 1:00pm EST </span> */}
                                        </div>

                                        {finalRevealed && bracketData?.final_round?.team_1?.id ? (
                                            <>
                                                <TournamentChampionshipBracketSectionCardTeam
                                                    key={bracketData?.final_round?.team_1?.id}
                                                    position={bracketData?.final_round?.team_1?.seed}
                                                    logo={
                                                        bracketData?.final_round?.team_1?.path
                                                            ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(
                                                                  bracketData?.final_round?.team_1?.path
                                                              )}`
                                                            : null
                                                    }
                                                    isWinner={winner === 'team_1'}
                                                    name={bracketData?.final_round?.team_1?.name}
                                                    wins={bracketData?.final_round?.team_1?.wins}
                                                    losses={bracketData?.final_round?.team_1?.losses}
                                                    status={bracketData?.final_round?.status}
                                                />
                                                <TournamentChampionshipBracketSectionCardTeam
                                                    key={bracketData?.final_round?.team_2?.id}
                                                    position={bracketData?.final_round?.team_2?.seed}
                                                    logo={
                                                        bracketData?.final_round?.team_2?.path
                                                            ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(
                                                                  bracketData?.final_round?.team_2?.path
                                                              )}`
                                                            : null
                                                    }
                                                    isWinner={winner === 'team_2'}
                                                    name={bracketData?.final_round?.team_2?.name}
                                                    wins={bracketData?.final_round?.team_2?.wins}
                                                    losses={bracketData?.final_round?.team_2?.losses}
                                                    status={bracketData?.final_round?.status}
                                                />
                                            </>
                                        ) : bracketData?.final_round?.team_1?.id && !finalRevealed ? (
                                            <div className="mt-5 px-8 py-8 text-center flex flex-row items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        trackEvent('Tournament page - Clicked watch button');
                                                        window.open(
                                                            `/tournament/${id}/round/${bracketData.final_round.round_id}/series/${bracketData.final_round.id}/player-stats`,
                                                            '_blank'
                                                        );
                                                    }}
                                                    className="bg-assist-green px-3 py-2 subheading-three rounded-lg text-black"
                                                >
                                                    Watch
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        trackEvent('Tournament page - Clicked reveal button');
                                                        setFinalRevealed(true);
                                                    }}
                                                    className="py-2 px-3 subheading-three text-white bg-off-black rounded-lg"
                                                >
                                                    Reveal
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex mt-4 gap-2 flex-col rounded-lg mb-4">
                                                <div
                                                    className={classNames('pl-3 flex flex-row items-center justify-start pt-3 pb-2.5 w-full h-full')}
                                                >
                                                    <div className="flex flex-row items-center justify-start w-full gap-2">
                                                        <div className="flex flex-col items-start justify-center h-full w-full">
                                                            <h3 className="font-bold text-lg capitalize text-off-black ">TBD</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className={classNames(
                                                        'pl-3 flex flex-row items-center justify-start pt-4 pb-3 w-full border-t-1 border-black-off h-full'
                                                    )}
                                                >
                                                    <div className="flex flex-row items-center justify-start w-full gap-2">
                                                        <div className="flex flex-col items-start justify-center h-full w-full">
                                                            <h3 className="font-bold text-lg capitalize text-off-black ">TBD</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {round !== 'championship' ? (
                                    <RoundComponent
                                        fullBracket={bracketData?.left_rounds}
                                        revealSerie={(e) => handleRevealChange(e)}
                                        id={id}
                                        roundId={filteredRounds[round as string]?.id}
                                        bracket={bracketData?.left_rounds}
                                        position="left"
                                    />
                                ) : (
                                    ''
                                )}
                            </div>
                        </div>
                    </div>
                </PanZoom>
                {tournament?.rounds.length ? (
                    <div className="fixed bottom-1 w-full right-2">
                        <button
                            onClick={() => {
                                TournamentBracket.current.reset();
                            }}
                            className="bottom-0 my-8 float-right ml-2 h-12 px-5 py-2 shadow-2xl bg-white text-black text-md font-bold tracking-wide rounded-full focus:outline-none shadow-inner"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => TournamentBracket.current.zoomOut()}
                            className="my-8 ml-auto float-right w-12 h-12 ml-2 shadow-2xl bg-white text-black text-lg font-bold tracking-wide rounded-full focus:outline-none shadow-inner pl-[12px]"
                        >
                            <MagnifyingGlassMinusIcon className="text-black w-6 font-bold" strokeWidth={4} />
                        </button>
                        <button
                            onClick={() => TournamentBracket.current.zoomIn()}
                            className="my-8 float-right mr-2 w-12 h-12 shadow-2xl pl-[12px]	bg-white text-black text-lg font-bold tracking-wide rounded-full focus:outline-none shadow-inner"
                        >
                            <MagnifyingGlassPlusIcon className="text-black w-6 font-bold" strokeWidth={4} />
                        </button>
                    </div>
                ) : (
                    ''
                )}
            </div>
        </>
    );
};

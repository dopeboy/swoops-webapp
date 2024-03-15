import { useState, useEffect, useMemo } from 'react';
import { TournamentDetail, TournamentRound } from 'src/lib/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative, Pagination, Controller } from 'swiper';
import { useRouter } from 'next/router';
import 'swiper/css';
import 'swiper/css/effect-creative';
import { TournamentBracketSectionCard } from './TournamentBracketSectionCard';
import { getDivisionButtonsForRoundAmount, getFilteredRounds } from 'src/lib/utils';
interface TournamentBracketMobileProps {
    tournament: TournamentDetail;
    id: string | string[];
    round: string | string[];
    className: string;
}

export const TournamentBracketMobile: React.FC<TournamentBracketMobileProps> = ({ id, round, className, tournament }) => {
    const [roundsSwiper, setRoundsSwiper] = useState(null);
    const [seriesSwiper, setSeriesSwiper] = useState(null);
    const router = useRouter();
    const [currentTournament, setCurrentTournament] = useState<TournamentDetail>();
    const [rounds, setRounds] = useState([]);
    const [roundsHeader, setRoundsHeader] = useState([]);
    const [roundAmount, setRoundAmount] = useState<number>(0);
    const filteredRounds: { [key: string]: TournamentRound } = useMemo(() => getFilteredRounds(tournament, roundAmount), [tournament, roundAmount]);

    useEffect(() => {
        if (tournament?.start_date) {
            setRoundAmount(tournament.rounds.length);
            setCurrentTournament(tournament);
        }
    }, [tournament, className]);

    const getDivisionButtonsForRoundAmountForBracket = (roundAmount: number) => {
        const rounds = getDivisionButtonsForRoundAmount(roundAmount);
        let reversedRounds = [...rounds];
        reversedRounds = reversedRounds.reverse();
        reversedRounds = reversedRounds.splice(1);
        return [...rounds, ...reversedRounds];
    };

    useEffect(() => {
        if (currentTournament?.id) {
            buildBracket(currentTournament?.rounds);
        }
    }, [currentTournament]);

    const buildBracket = (rounds) => {
        const roundsWithoutFinal = rounds?.slice(0, currentTournament?.rounds?.length - 1);
        const roundsFinal = rounds[currentTournament?.rounds?.length - 1];

        const rightSide = {
            rounds: roundsWithoutFinal.map((round) => ({
                id: round.id,
                isFirstRound: round.id === roundsWithoutFinal[0].id,
                series: round.series.slice(Math.floor(round.series.length / 2)),
            })),
        };
        const leftSide = {
            rounds: roundsWithoutFinal.map((round) => ({
                id: round.id,
                isFirstRound: round.id === roundsWithoutFinal[0].id,
                series: round.series.slice(0, Math.ceil(round.series.length / 2)),
            })),
        };

        setRounds([...leftSide.rounds, roundsFinal, ...rightSide.rounds.reverse()]);
    };

    useEffect(() => {
        const roundsNumber = round !== 'championship' ? Math.ceil(Math.log2(Number(round))) : 1;
        setRoundsHeader(getDivisionButtonsForRoundAmountForBracket(roundsNumber));
        if (currentTournament?.id) {
            let tournamentRounds = [...currentTournament.rounds];
            tournamentRounds = tournamentRounds.splice(tournamentRounds?.length - roundsNumber, roundsNumber);
            buildBracket(tournamentRounds);
        }
    }, [round]);

    const revealSerie = (seriesId) => {
        const newRounds = rounds.map((round) => ({
            ...round,
            series: round.series.map((serie) => (serie.id === seriesId ? { ...serie, revealed: true } : serie)),
        }));

        setRounds(newRounds);
    };

    const isParentRevealed = (seriesId) => {
        let areAdjacentSeriesRevealed = false;

        // Loop through rounds to find isFirstRound
        for (let i = 0; i < rounds.length; i++) {
            if (rounds[i]?.isFirstRound) {
                // Find the index of the series in the round
                const seriesIndex = rounds[i]?.series.findIndex((serie) => serie.id === seriesId);

                // If seriesId is not in the round, seriesIndex will be -1
                if (seriesIndex !== -1) {
                    // Check the corresponding series in the previous round
                    if (i > 0 && rounds[i - 1]?.series?.length > 2 * seriesIndex + 1) {
                        const prevRoundSeries1 = rounds[i - 1].series[2 * seriesIndex];
                        const prevRoundSeries2 = rounds[i - 1].series[2 * seriesIndex + 1];
                        areAdjacentSeriesRevealed =
                            (prevRoundSeries1 ? prevRoundSeries1.revealed : false) || (prevRoundSeries2 ? prevRoundSeries2.revealed : false);
                    } else {
                        areAdjacentSeriesRevealed = false;
                    }

                    // Check the corresponding series in the next round
                    if (i < rounds.length - 1 && rounds[i + 1]?.series?.length > 2 * seriesIndex + 1) {
                        const nextRoundSeries1 = rounds[i + 1].series[2 * seriesIndex];
                        const nextRoundSeries2 = rounds[i + 1].series[2 * seriesIndex + 1];
                        areAdjacentSeriesRevealed =
                            areAdjacentSeriesRevealed ||
                            (nextRoundSeries1 ? nextRoundSeries1.revealed : false) ||
                            (nextRoundSeries2 ? nextRoundSeries2.revealed : false);
                    } else {
                        areAdjacentSeriesRevealed = false;
                    }

                    // If we found the series, we can stop the loop
                    break;
                }
            }
        }

        return areAdjacentSeriesRevealed;
    };

    return (
        <>
            <div className={`overflow-x-hidden overflow-y-hidden w-full ${className}`}>
                <div className="wrapper -z-50 cursor-move flex justify-start flex-col  items-baseline">
                    <div className="bracket-header w-full flex pt-12 mb-6">
                        <Swiper
                            grabCursor={true}
                            slidesPerView={2}
                            centeredSlides={true}
                            spaceBetween={0}
                            modules={[Pagination, Controller]}
                            className="rounds"
                            onSwiper={setRoundsSwiper}
                            controller={{ control: roundsSwiper }}
                            allowTouchMove={false}
                        >
                            {roundsHeader.map((roundHeader) => (
                                <SwiperSlide>
                                    <div className="round-mobile">
                                        <div className="round-name"> {roundHeader.title} </div>
                                        <div className="round-date"> {roundHeader.date} </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    <div className="w-full">
                        {currentTournament?.id && (
                            <Swiper
                                grabCursor={true}
                                onSlideChange={(e) => {
                                    if (e.swipeDirection === 'next') {
                                        roundsSwiper.slideNext();
                                    } else {
                                        roundsSwiper.slidePrev();
                                    }
                                }}
                                effect={'creative'}
                                slidesPerView={'auto'}
                                spaceBetween={0}
                                creativeEffect={{
                                    prev: {
                                        shadow: true,
                                        translate: ['-120%', 0, -300],
                                        opacity: 0.8,
                                        scale: 0.5,
                                    },
                                    next: {
                                        shadow: true,
                                        translate: ['120%', 0, -300],
                                        opacity: 0.8,
                                        scale: 0.3,
                                    },
                                }}
                                modules={[EffectCreative, Controller, Pagination]}
                                className="series"
                                onSwiper={setSeriesSwiper}
                                controller={{ control: seriesSwiper }}
                            >
                                {rounds?.map((round) => (
                                    <SwiperSlide>
                                        <div className="flex flex-col bg-black h-full">
                                            {round?.series?.map((serie, index) => (
                                                <div className="item-child game">
                                                    <TournamentBracketSectionCard
                                                        games={serie.games}
                                                        id={id}
                                                        roundId={round.id}
                                                        seriesId={serie?.id}
                                                        key={index}
                                                        revealed={serie.revealed}
                                                        teams={[serie.team_1, serie.team_2]}
                                                        className="game"
                                                        status={serie?.status}
                                                        revealSerie={(e) => revealSerie(e)}
                                                        isFirstRound={round.isFirstRound}
                                                        isParentRevealed={isParentRevealed(serie?.id)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

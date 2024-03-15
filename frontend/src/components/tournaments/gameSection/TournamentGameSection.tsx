import classNames from 'classnames';
import { useMemo } from 'react';
import { TournamentDivisionHeader } from '../TournamentDivisionHeader/TournamentGameSectionDivisionHeader';
import { TournamentGameSectionGameList } from './TournamentGameSectionGameList';
import { TournamentDetail, TournamentRound, TournamentSeries } from 'src/lib/api';
import { getFilteredRounds } from 'src/lib/utils';

interface TournamentGameSectionProps {
    roundAmount: number;
    tournament: TournamentDetail;
    shouldDisplay: boolean;
    round: string | string[];
    id: string | string[];
}

export const TournamentGameSection: React.FC<TournamentGameSectionProps> = ({ id, roundAmount, round, tournament, shouldDisplay }) => {
    // const [revealCurrentSeries, setRevealCurrentSeries] = useState<boolean>(false);

    const filteredRounds: { [key: string]: TournamentRound } = useMemo(() => getFilteredRounds(tournament, roundAmount), [tournament]);

    const getDivisionFromSeriesPosition = (series: any[], index: number): string => {
        const divisions = [
            { quadrant: 'NW', value: 'Venice Breach' },
            { quadrant: 'SW', value: 'Pingalle' },
            { quadrant: 'NE', value: 'Rucker Ark' },
            { quadrant: 'SE', value: 'DoSdan' },
        ];
        const quadrantSize = series.length / 4;

        const quadrantIndex = Math.floor(index / quadrantSize);
        return divisions[quadrantIndex].value;
    };

    const getRoundFilteredSeries = (seriesStatus: TournamentSeries.status): TournamentSeries[] => {
        let filteredSeriesByRound = filteredRounds[round as string]?.series.filter((series) => series.status === seriesStatus);
        filteredSeriesByRound = filteredSeriesByRound?.map((series, index) => {
            return {
                ...series,
                division: getDivisionFromSeriesPosition(filteredSeriesByRound, index),
            };
        });
        return filteredSeriesByRound;
    };

    const getTournamentRoundId = (): number => {
        return filteredRounds[round as string]?.id;
    };

    return (
        <div
            className={classNames('w-full flex flex-col items-center justify-start pb-20 md:pb-32 gap-6 md:gap-12', {
                hidden: !shouldDisplay,
            })}
        >
            {/* Round selection and filtering header */}
            <TournamentDivisionHeader
                id={id}
                roundAmount={roundAmount}
                round={round}
                showDivisionButton={tournament?.kind === TournamentDetail.kind.END_OF_SEASON}
            />
            {/* Current series card display
            {revealCurrentSeries && (
                <div className="w-full flex lg:flex-row flex-col items-center justify-center gap-2 max-w-7xl px-2">
                    <TournamentGameSectionCurrentSeriesCard
                        teams={[getRoundFilteredSeries()?.[0]?.team_1, getRoundFilteredSeries()?.[0]?.team_2]}
                        className="lg:w-1/2"
                    />
                    <div className="lg:w-1/2 rounded-lg h-full w-full min-h-[343px] bg-off-black border border-white/64 gap-2 flex flex-col items-center justify-start pt-4">
                        <h1 className="text-white heading-two text-center">Last Series</h1>
                        <h2 className="text-white/64 heading-three leading-3 text-center">None yet</h2>
                    </div>
                </div>
            )} */}
            {/* Show current series button - Dev purposes only */}
            {/* <div className="w-full flex flex-row items-center justify-end max-w-6xl px-2">
                <button
                    className="px-4 py-2 bg-white rounded-lg font-bold text-lg text-black border border-black"
                    onClick={() => setRevealCurrentSeries(!revealCurrentSeries)}
                >
                    {revealCurrentSeries ? 'Hide Current Series' : 'Show Current Series'}
                </button>
            </div> */}
            {/* Upcoming and completed matches */}
            <div className="flex flex-col items-center justify-start gap-3 w-full md:gap-6 px-2 md:px-0">
                <TournamentGameSectionGameList
                    id={id}
                    tournament={tournament}
                    roundId={getTournamentRoundId()}
                    title="Upcoming Series"
                    series={getRoundFilteredSeries(TournamentSeries.status.NOT_STARTED || TournamentSeries.status.STARTED)}
                    matchNumber={getRoundFilteredSeries(TournamentSeries.status.NOT_STARTED || TournamentSeries.status.STARTED)?.length || 0}
                    matchNumberClass="text-white/64"
                />
                <TournamentGameSectionGameList
                    id={id}
                    tournament={tournament}
                    roundId={getTournamentRoundId()}
                    title="Completed Series"
                    series={getRoundFilteredSeries(TournamentSeries.status.FINISHED)}
                    matchNumber={getRoundFilteredSeries(TournamentSeries.status.FINISHED)?.length || 0}
                    matchNumberClass="text-assist-green"
                />
            </div>
        </div>
    );
};

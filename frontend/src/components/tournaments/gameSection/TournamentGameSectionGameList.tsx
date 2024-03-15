import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { useState } from 'react';
import { TournamentDetail, TournamentSeries } from 'src/lib/api';
import { TournamentGameSectionCard } from './TournamentGameSectionCard';

interface TournamentGameSectionGameListProps {
    tournament: TournamentDetail;
    title: string;
    matchNumber: number;
    series: TournamentSeries[];
    matchNumberClass?: string;
    roundId: number;
    id: string | string[];
}
export const TournamentGameSectionGameList: React.FC<TournamentGameSectionGameListProps> = ({
    id,
    tournament,
    roundId,
    title,
    matchNumber,
    series,
    matchNumberClass,
}) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="flex flex-col items-start justify-center border border-white/16 rounded-lg py-2 md:px-4 md:py-3 max-w-6xl w-full h-full">
            <div
                className={classNames('cursor-pointer flex flex-col w-full', {
                    'gap-2 md:gap-4': open,
                    'gap-0': !open,
                })}
            >
                <input className="hidden" type="checkbox" checked={open} />
                {/* Title and dropdown */}
                <div
                    onClick={() => setOpen(!open)}
                    className="px-3 w-full hover:bg-white/16 rounded-lg py-0 flex-nowrap collapse-title flex flex-row items-center gap-3 md:gap-4"
                >
                    <h1 className="w-fit whitespace-nowrap uppercase subheading-one md:heading-two text-white">{title}</h1>
                    <div className="flex flex-row items-center justify-start gap-4">
                        <span className={classNames('subheading-two md:heading-three', matchNumberClass)}>{matchNumber}</span>
                        {open ? <ChevronDownIcon className="h-3 w-3 text-white" /> : <ChevronUpIcon className="h-3 w-3 text-white" />}
                    </div>
                </div>
                {/* Game grid */}
                {matchNumber !== 0 && (
                    <div
                        className={classNames('grid grid-cols-1 lg:grid-cols-2', {
                            'h-full gap-y-3 sm:gap-y-2 gap-x-0 sm:gap-x-2 md:gap-4': open,
                            'h-0 gap-0': !open,
                        })}
                    >
                        {series?.map((serie: any, index) => (
                            <TournamentGameSectionCard
                                id={id}
                                division={serie?.division}
                                tournament={tournament}
                                roundId={roundId}
                                seriesId={serie.id}
                                key={index}
                                teams={[serie.team_1, serie.team_2]}
                                className={open ? '' : 'hidden'}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

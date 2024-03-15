import { TrophyIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Image from 'next/image';
import { TournamentSeries } from 'src/lib/api';

interface TournamentChampionshipBracketSectionCardTeamProps {
    position: number;
    logo: string;
    name: string;
    wins: number;
    losses: number;
    className?: string;
    logoClass?: string;
    isWinner?: boolean;
    status: TournamentSeries.status;
    isFirstRound?: boolean;
    isParentRevealed?: boolean;
}
export const TournamentChampionshipBracketSectionCardTeam: React.FC<TournamentChampionshipBracketSectionCardTeamProps> = ({
    position,
    logo,
    name,
    wins,
    losses,
    className,
    logoClass,
    isWinner,
    status,
    isFirstRound,
    isParentRevealed,
}) => {
    return (
        <div
            className={classNames(
                'flex flex-row items-center series-card justify-start w-full gap-2 md:gap-3 pl-3',
                className,
                logoClass ? 'h-full' : 'h-full'
            )}
        >
            {/* Team Bracket section */}
            <div className="flex flex-row items-center justify-start w-full gap-2.5 py-3">
                {/* Team Logo */}
                <div className={classNames('flex flex-col items-center justify-center')}>
                    {logo ? (
                        <div className="aspect-square flex flex-col items-center justify-center rounded-full">
                            <Image src={logo} width={73} height={73} priority className="aspect-square w-full h-full rounded-full" />
                        </div>
                    ) : (
                        <div className="aspect-square flex flex-col items-center justify-center bg-gray-300 p-2 rounded-full">
                            <TrophyIcon className="text-white w-10 h-10" />
                        </div>
                    )}
                </div>
                {/* Team Info Section */}
                <div className="flex flex-col items-start justify-center h-full w-full">
                    {/* Team Name */}
                    <h3
                        className={classNames(
                            'font-bold text-lg uppercase',
                            status === TournamentSeries.status.FINISHED
                                ? isParentRevealed
                                    ? isWinner
                                        ? 'text-off-black'
                                        : 'text-off-black/50'
                                    : !isFirstRound
                                    ? isWinner
                                        ? 'text-off-black'
                                        : 'text-off-black/50'
                                    : 'text-off-black'
                                : 'text-off-black'
                        )}
                    >
                        {name || 'TBD'}
                    </h3>
                    {/* Team Record */}
                    {/* <p className="flex flex-row items-center justify-start gap-1 font-medium text-base text-off-black pl-[0px]">
                        <span>{wins}</span>-<span>{losses}</span>
                    </p> */}
                </div>
            </div>
        </div>
    );
};

import { TrophyIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Image from 'next/image';
import { TournamentSeries } from 'src/lib/api';

interface TournamentBracketSectionCardTeamProps {
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
export const TournamentBracketSectionCardTeam: React.FC<TournamentBracketSectionCardTeamProps> = ({
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
                'flex flex-row items-center series-card justify-start w-full gap-2 md:gap-3',
                className,
                logoClass ? 'h-full' : 'h-full'
            )}
        >
            {/* Team Position */}
            {position ? <div className="font-bold text-lg text-center text-off-black !w-6">{position}</div> : ''}
            {/* Team Bracket section */}
            <div className="flex flex-row items-center justify-start w-full gap-2.5">
                {/* Team Logo */}
                <div className={classNames('flex flex-col items-center justify-center', logoClass || 'h-[36px] w-[36px]')}>
                    {logo ? (
                        <Image
                            src={logo}
                            width={logoClass ? 64 : 35}
                            height={logoClass ? 64 : 35}
                            priority
                            className="aspect-square w-full h-full rounded-full"
                        />
                    ) : (
                        <div className="aspect-square flex flex-col items-center justify-center bg-gray-300 p-1 rounded-full">
                            <TrophyIcon className="text-white w-5 h-5" />
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

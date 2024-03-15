import { TrophyIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Image from 'next/image';

interface TournamentGameSectionCardTeamProps {
    position: number;
    logo: string;
    name: string;
    placing?: 'left' | 'right';
    className?: string;
    logoClass?: string;
}
export const TournamentGameSectionCardTeam: React.FC<TournamentGameSectionCardTeamProps> = ({
    position,
    logo,
    placing,
    name,
    className,
    logoClass,
}) => {
    return (
        <div className={classNames('flex flex-row items-center justify-start w-full gap-2 md:gap-3 h-full', className)}>
            {/* Team Section */}
            <div
                className={classNames('font-bold text-lg text-off-black !w-7', {
                    'order-1 text-center': placing === 'left',
                    'order-3 text-center': placing === 'right',
                })}
            >
                {position}
            </div>
            {/* Team Bracket section */}
            <div
                className={classNames('order-2 flex flex-col justify-center w-full h-full', {
                    'items-start': placing === 'left',
                    'items-end': placing === 'right',
                })}
            >
                {/* Team Logo */}
                <div className={classNames('flex flex-col items-center justify-center', logoClass || 'h-14 w-14')}>
                    {logo ? (
                        <Image
                            src={logo}
                            width={logoClass ? 96 : 64}
                            height={logoClass ? 96 : 64}
                            priority
                            className="aspect-square w-full h-full rounded-full"
                        />
                    ) : (
                        <div className="aspect-square flex flex-col items-center justify-center bg-zinc-300 rounded-full p-3">
                            <TrophyIcon className="text-white w-8 h-8" />
                        </div>
                    )}
                </div>
                {/* Team Info Section */}
                <div
                    className={classNames('flex flex-col justify-center h-fit mt-1', {
                        'items-start w-full': placing === 'left',
                        'items-end w-full': placing === 'right',
                        'w-1/3 items-center': !name,
                    })}
                >
                    {/* Team Name */}
                    <h3
                        className={classNames('font-bold text-base leading-4 sm:text-lg uppercase truncate w-40', {
                            'text-left': placing === 'left',
                            'text-right': placing === 'right',
                        })}
                    >
                        {name || 'TBD'}
                    </h3>
                </div>
            </div>
        </div>
    );
};

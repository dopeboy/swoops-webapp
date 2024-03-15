import { TrophyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { Team } from 'src/lib/api';
import Image from 'next/image';

interface HeadToHeadPlayByPlayItemProps {
    index: number;
    chipColor: string;
    action: string;
    action_type: string;
    challenged_score: number;
    challenger_score: number;
    detail: string;
    gameclock: string;
    player: string;
    possession: number;
    quarter: number;
    teamLogo: string | null;
    time_remaining: number;
    team?: Team;
    token?: number;
}
export const HeadToHeadPlayByPlayItem: React.FC<HeadToHeadPlayByPlayItemProps> = ({
    index,
    chipColor,
    teamLogo,
    challenged_score,
    challenger_score,
    detail,
    gameclock,
}) => {
    const getTextColor = () => {
        if (chipColor) {
            const c = chipColor.substring(1);
            const rgb = parseInt(c, 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;

            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
            if (luma > 128) {
                return 'text-black';
            } else {
                return 'text-white';
            }
        }
    };

    return (
        <div
            data-tut="play-by-play-navigation"
            key={index + '_' + detail}
            className="relative flex flex-row items-center justify-between gap-3 w-full min-h-12 max-h-20 rounded-l-lg rounded-r-md pl-3 sm:pl-4 pr-4 sm:pr-6 py-2 bg-white/32"
        >
            <div className="flex flex-row items-center justify-start gap-2 sm:gap-4">
                {teamLogo ? (
                    <div className="h-8 w-8 aspect-square rounded-full">
                        <Image width={32} height={32} src={teamLogo} priority={true} className="w-full h-full rounded-full" />
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center aspect-square h-8 w-8 rounded-full"
                        style={{ backgroundColor: chipColor }}
                    >
                        <TrophyIcon className={classNames('w-5 h-5', getTextColor())} />
                    </div>
                )}
                <span className="text-white uppercase font-semibold">{detail}</span>
            </div>
            <div className="flex flex-row items-center justify-end gap-4">
                <span className="text-white/40 font-semibold text-end w-10 sm:w-12">{gameclock}</span>
                <span className="text-white uppercase font-semibold text-end w-12 sm:w-16">{`${challenger_score} - ${challenged_score}`}</span>
            </div>
            <div
                style={{
                    backgroundColor: chipColor,
                }}
                className="absolute right-0 top-0 rounded-r-lg w-[4px] h-full"
            ></div>
        </div>
    );
};

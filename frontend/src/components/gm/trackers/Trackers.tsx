import { BoltIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';

interface TrackerProps {
    Icon: any;
    name: string;
    value: string | number;
    background?: 'primary' | 'secondary' | 'tertiary';
}
export const Tracker: React.FC<TrackerProps> = ({ Icon, value, name, background = 'primary' }) => {
    return (
        <div className="flex flex-row items-center justify-start gap-2 w-full">
            <div
                className={classNames('flex items-center justify-center p-2 rounded-full', {
                    'bg-primary': background === 'primary',
                    'bg-secondary': background === 'secondary',
                    'bg-sky-400': background === 'tertiary',
                })}
            >
                <Icon className="text-white h-4 w-4 md:h-8 md:w-8" />
            </div>
            <div className="flex flex-col items-start justify-center gap-0.5">
                <span className="text-[8px] md:text-[12px] uppercase font-header font-bold md:heading-three text-black">{value}</span>
                <span className="text-[8px] md:text-[12px] uppercase font-header md:heading-three text-slate-400">{name}</span>
            </div>
        </div>
    );
};

export const LineupSubmittedTrackers: React.FC = () => {
    return (
        <div className="w-full h-16 md:h-28 rounded-b-lg bg-white pl-4 pr-2 md:px-8 py-1 md:py-2 flex flex-row items-center justify-center border border-solid border-white/16">
            <Tracker Icon={BoltIcon} name="GM Grade" value="D+" />
        </div>
    );
};

export const HistoricalResultsTrackers: React.FC = () => {
    return (
        <div className="w-full h-16 md:h-28 rounded-b-lg bg-white pl-4 pr-2 md:px-8 py-1 md:py-2 flex flex-row items-center justify-center border border-solid border-white/16">
            <Tracker Icon={BoltIcon} name="GM Grade" value="D+" />
            <Tracker Icon={TrophyIcon} name="Current W/L" value="14.2%" background="secondary" />
            <Tracker Icon={StarIcon} name="Current Streak" value="14" background="tertiary" />
        </div>
    );
};

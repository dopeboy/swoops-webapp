import { AcademicCapIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid';

interface PostResultsStatTrackersProps {
    grade: string;
    rank: string;
    totalEntrants: string;
    streak: string;
}

export const PostResultsStatTrackers: React.FC<PostResultsStatTrackersProps> = ({grade, rank, totalEntrants, streak}) => {
    return (
        <div className="flex flex-row items-center justify-between w-full border border-white/16 mb-1.5 rounded-lg px-3 sm:px-8 py-4">
            <div className="flex flex-row items-center justify-start gap-2 w-full">
                <div className="flex items-center justify-center p-2 rounded-full bg-yellow-500">
                    <TrophyIcon className="text-white h-4 w-4 md:h-8 md:w-8" />
                </div>
                <div className="flex flex-col items-start justify-start">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-1">
                        <span className="text-[12x] uppercase font-header font-bold md:heading-two text-white">#{rank}</span>
                        <span className="text-[8px] sm:text-[10px] uppercase font-header font-bold subheading-two text-white -mt-2 sm:mt-0 sm:-mb-2">
                            / {totalEntrants}
                        </span>
                    </div>
                    <span className="text-[7px] md:text-[12px] uppercase font-header md:heading-three text-slate-300">Daily Rank</span>
                </div>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 w-full">
                <div className="flex items-center justify-center p-2 rounded-full bg-teal-500">
                    <AcademicCapIcon className="text-white h-4 w-4 md:h-8 md:w-8" />
                </div>
                <div className="flex flex-col items-start justify-start">
                    <span className="text-[12x] uppercase font-header font-bold md:heading-two text-white">{grade}</span>
                    <span className="text-[8px] md:text-[12px] uppercase font-header md:heading-three text-slate-300">Day Grade</span>
                </div>
            </div>
            <div className="flex flex-row items-center justify-end gap-2 w-full">
                <div className="flex items-center justify-center p-2 rounded-full bg-secondary">
                    <FireIcon className="text-white h-4 w-4 md:h-8 md:w-8" />
                </div>
                <div className="flex flex-col items-start justify-start">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:gap-1.5">
                        <span className="text-[12x] uppercase font-header font-bold md:heading-two text-white">{streak}</span>
                        <span className="text-[8px] sm:text-[10px] uppercase font-header font-bold subheading-two text-white -mt-1 sm:mt-0 sm:-mb-2">
                            Days
                        </span>
                    </div>
                    <span className="text-[8px] md:text-[12px] uppercase font-header md:heading-three text-slate-300">Streak</span>
                </div>
            </div>
        </div>
    );
};

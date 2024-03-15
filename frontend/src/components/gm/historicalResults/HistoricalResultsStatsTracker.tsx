import { AcademicCapIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid';

export const HistoricalResultsStatsTracker: React.FC = () => {
    return (
        <div className="flex flex-row items-center justify-between w-full  border border-white/16 mb-3 rounded-lg px-3 sm:px-8 py-4">
            <div className="flex flex-row items-center justify-start gap-2 w-full">
                <div className="flex items-center justify-center p-2 rounded-full bg-yellow-500">
                    <TrophyIcon className="text-white h-4 w-4 md:h-8 md:w-8" />
                </div>
                <div className="flex flex-col items-start justify-start">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-1">
                        <span className="text-[12x] uppercase font-header font-bold md:heading-two text-white">#23</span>
                        <span className="text-[8px] sm:text-[10px] uppercase font-header font-bold subheading-two text-white -mt-2 sm:mt-0 sm:-mb-2">
                            / 2532
                        </span>
                    </div>
                    <span className="block sm:hidden text-[8px] md:text-[12px] uppercase font-header md:heading-three text-slate-300">Rank</span>
                    <span className="hidden sm:block text-[8px] md:text-[12px] uppercase font-header md:heading-three text-slate-300">
                        Overall Rank
                    </span>
                </div>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 w-full">
                <div className="flex items-center justify-center p-2 rounded-full bg-teal-500">
                    <AcademicCapIcon className="text-white h-4 w-4 md:h-8 md:w-8" />
                </div>
                <div className="flex flex-col items-start justify-start">
                    <span className="text-[12x] uppercase font-header font-bold md:heading-two text-white">A+</span>
                    <span className="text-[8px] md:text-[12px] uppercase font-header md:heading-three text-slate-300">GM Grade</span>
                </div>
            </div>
            <div className="flex flex-row items-center justify-end gap-2 w-full">
                <div className="flex items-center justify-center p-2 rounded-full bg-secondary">
                    <FireIcon className="text-white h-4 w-4 md:h-8 md:w-8" />
                </div>
                <div className="flex flex-col items-start justify-start">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:gap-1.5">
                        <span className="text-[12x] uppercase font-header font-bold md:heading-two text-white">41</span>
                        <span className="text-[8px] sm:text-[10px] uppercase font-header font-bold subheading-two text-white -mt-1 sm:mt-0 sm:-mb-2">
                            Days (4W)
                        </span>
                    </div>
                    <span className="text-[8px] md:text-[12px] uppercase font-header md:heading-three text-slate-300">Streak</span>
                </div>
            </div>
        </div>
    );
};

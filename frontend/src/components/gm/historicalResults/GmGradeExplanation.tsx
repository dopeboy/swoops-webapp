import { AcademicCapIcon } from '@heroicons/react/24/solid';

export const GmGradeExplanation: React.FC = () => (
    <div className="w-full flex items-center justify-center ">
        <div className="w-fit flex flex-col gap-2.5 sm:gap-1 sm:flex-row items-center justify-center text-base text-white font-light -mt-1 mb-5">
            <div className="flex flex-row items-center text-xs justify-center gap-1 py-0.5 px-2 bg-teal-500 border border-teal-300 rounded-full">
                <AcademicCapIcon className="text-white h-4 w-4" /> GM Grade
            </div>
            <span className="-mt-1 ml-0.5 w-3/4 sm:w-fit break-words">is calculated based on the categories shown below</span>
        </div>
    </div>
);

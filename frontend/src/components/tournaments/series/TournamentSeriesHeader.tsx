import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';

interface TournamentSeriesHeaderProps {
    id: string | string[];
    roundText: string;
    bestOfText: string;
    teamOneName: string;
    teamTwoName: string;
}
export const TournamentSeriesHeader: React.FC<TournamentSeriesHeaderProps> = ({ id, roundText, bestOfText, teamOneName, teamTwoName }) => {
    const router = useRouter();
    return (
        <div className="pl-2 z-10 sm:pl-12 flex flex-row items-center justify-start gap-2 sm:gap-6 w-full">
            <div
                onClick={() => router.push({ pathname: `/tournament/${id}` })}
                className="rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-white/16"
            >
                <ChevronLeftIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col gap-2 sm:gap-0">
                <span className="text-white heading-two md:heading-one">
                    {teamOneName} vs. {teamTwoName}
                </span>
                <div className="flex flex-row items-center justify-start gap-2 text-white/64 subheading-three sm:subheading-two">
                    <span>{roundText}</span>
                    <div className="rounded-full h-1 w-1 sm:h-1.5 sm:w-1.5 bg-white/64"></div>
                    <span>{bestOfText}</span>
                </div>
            </div>
        </div>
    );
};

import { ArrowsPointingInIcon } from '@heroicons/react/24/outline';

interface TournamentCondenseSeriesButtonProps {
    title: string;
    onClick: () => void;
}
export const TournamentCondenseSeriesButton: React.FC<TournamentCondenseSeriesButtonProps> = ({ title, onClick }) => {
    return (
        <button
            type="button"
            className="bg-white/4 hover:bg-white/8 text-base border-r-2 h-full px-5 py-2 gap-3 border-solid border-off-black relative flex-auto text-white font-medium text-center w-full sm:w-[300px] flex flex-row items-center justify-center align-middle no-underline leading-6 rounded-lg"
            onClick={() => onClick()}
        >
            <ArrowsPointingInIcon className="h-5 w-5 text-white" />
            <span>{title}</span>
        </button>
    );
};

import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface TournamentFilterButtonProps {
    title: string;
    onClick: () => void;
}
export const TournamentFilterButton: React.FC<TournamentFilterButtonProps> = ({ title, onClick }) => {
    return (
        <>
            <button
                id="dropdownHoverButton"
                data-dropdown-toggle="dropdownHover"
                data-dropdown-trigger="hover"
                type="button"
                className="bg-white/4 hover:bg-white/8 text-base border-r-2 h-full px-5 py-2 gap-3 border-solid border-off-black sm:w-[200px] w-full relative flex-auto text-white font-medium text-center flex flex-row items-center justify-center align-middle no-underline leading-6 rounded-lg"
                onClick={() => onClick()}
            >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-white" />
                <span>{title}</span>
            </button>
            <div id="dropdownHover" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownHoverButton">
                    <li>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                            Northwest
                        </a>
                    </li>
                    <li>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                            Soutwest
                        </a>
                    </li>
                    <li>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                            Northeast
                        </a>
                    </li>
                    <li>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                            Southeast
                        </a>
                    </li>
                </ul>
            </div>
        </>
    );
};

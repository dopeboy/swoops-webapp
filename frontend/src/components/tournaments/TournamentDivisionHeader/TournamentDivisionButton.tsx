import classNames from 'classnames';

interface TournamentDivisionButtonProps {
    index: number;
    title: string;
    round: string | string[];
    isSelected: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    onClick: (title: string | string[]) => void;
}
export const TournamentDivisionButton: React.FC<TournamentDivisionButtonProps> = ({ index, title, round, isSelected, onClick, isFirst, isLast }) => {
    return (
        <button
            type="button"
            className={classNames(
                'bg-white/4 hover:bg-white/8 h-full whitespace-nowrap flex items-center justify-center w-full text-base border-b-2 md:border-b-0 border-r-2 border-solid border-off-black relative flex-auto text-white font-medium text-center align-middle no-underline leading-6 max-w-[155px]',
                {
                    'p-1': isSelected,
                    'py-3 hover:bg-white/8': !isSelected,
                    'rounded-tl-md md:rounded-l-md': isFirst,
                    'rounded-br-md md:rounded-r-md': isLast,
                    'rounded-tr-md md:rounded-none': index === 2,
                    'rounded-bl-md md:rounded-none': index === 3,
                }
            )}
            onClick={() => onClick(round)}
        >
            <span
                className={classNames('whitespace-nowrap', {
                    'bg-white text-off-black px-4 py-3 w-full rounded-md': isSelected,
                })}
            >
                {title}
            </span>
        </button>
    );
};

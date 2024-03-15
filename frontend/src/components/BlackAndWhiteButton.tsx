import classNames from 'classnames';

interface BlackAndWhiteButtonProps {
    onClick: () => void;
    className?: string;
    text: string;
}
export const BlackAndWhiteButton: React.FC<BlackAndWhiteButtonProps> = ({ className = '', text, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={classNames(
                'subheading-two whitespace-nowrap h-[48px] px-8 text-white flex flex-col items-center justify-center border-2 border-white rounded-lg',
                className
            )}
        >
            {text}
        </button>
    );
};

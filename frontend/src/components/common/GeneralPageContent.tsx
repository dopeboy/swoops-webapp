import classNames from 'classnames';

interface GeneralPageContentProps {
    children: React.ReactNode;
    maxWidth?: 'lg' | 'xl' | '2xl' | '3xl';
}
export const GeneralPageContent: React.FC<GeneralPageContentProps> = ({ children, maxWidth }) => {
    return (
        <div
            className={classNames(
                'w-full bg-transparent relative mb-16 flex flex-col rounded-lg items-center text-white mt-2.5',
                maxWidth ? `max-w-${maxWidth}` : 'max-w-lg'
            )}
        >
            {children}
        </div>
    );
};

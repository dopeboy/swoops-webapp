import classNames from 'classnames';

interface GeneralPageHeaderProps {
    title: string;
    accent: 'primary' | 'secondary';
    size?: '3xl' | '2xl' | 'xl';
    noMargin?: boolean;
}
export const GeneralPageHeader: React.FC<GeneralPageHeaderProps> = ({ title, accent, size, noMargin = false }) => {
    const translateAccentToColor = () => {
        return !accent ? 'primary' : accent === 'primary' ? '#8687F1' : '#FF5705';
    };

    return (
        <h1
            className={classNames(
                'text-[50px] md:text-[75px] font-[900] px-3 sm:px-0 uppercase leading-[1.1] tracking-[.04em] text-body text-white text-center',
                size ? `max-w-${size}` : 'max-w-2xl',
                noMargin ? 'mb-0' : 'mb-6'
            )}
        >
            {title}
            <span style={{ color: `${translateAccentToColor()}` }}>.</span>
        </h1>
    );
};

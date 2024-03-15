import classNames from 'classnames';

interface HeadToHeadBannerProps {
    animateHeader: boolean;
    children: React.ReactNode;
}

export const HeadToHeadBanner: React.FC<HeadToHeadBannerProps> = ({ children, animateHeader }) => (
    <div
        data-tut="matchup-bar-info"
        className={classNames(
            'grid grid-cols-2 transition-transform ease-in-out duration-300 md:grid-cols-3 items-center w-full bg-white gap-x-5 lg:gap-x-10',
            {
                'z-[9999] top-0 rounded-b-lg fixed h-[100px] gap-y-0 sm:h-[55px] md:h-[100px] px-1 pt-0 sm:pt-0 sm:px-2 border-b border-black':
                    animateHeader,
                'px-4 sm:px-5 pt-4 pb-3 rounded-lg gap-y-6': !animateHeader,
            }
        )}
    >
        {children}
    </div>
);

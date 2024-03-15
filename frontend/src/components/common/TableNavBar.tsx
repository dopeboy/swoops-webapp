import { ReactElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { trackEvent } from '../../lib/tracking';
import useFontFaceObserver from 'use-font-face-observer';
export interface TableNavBarRoute {
    path: string;
    title: string;
    section?: string;
}

export interface TableNavBarProps {
    routesToUse: TableNavBarRoute[];
    className?: string;
    buttonClassName?: string;
    borderColor?: string;
    isGameCompleted?: boolean;
    highlightFreeAgentsTab?: boolean;
    withQueryParams?: boolean;
    ignoreClick?: boolean;
    useRoutes?: boolean;
    changeTab?: (tab: string) => void;
}

export const TableNavBar: React.FC<TableNavBarProps> = ({
    borderColor,
    buttonClassName,
    className,
    highlightFreeAgentsTab,
    routesToUse,
    isGameCompleted,
    withQueryParams,
    ignoreClick = false,
    useRoutes = true,
    changeTab,
}): ReactElement => {
    const router = useRouter();
    const { section: currentSection } = router.query;
    const divRef = useRef<HTMLDivElement | null>();
    const itemsRef = useRef<HTMLButtonElement[] | null>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [currentTabWidth, setCurrentTabWidth] = useState<number>(0);
    const [prevWidth, setPrevWidth] = useState<number>(0);
    const tabs = routesToUse.map(({ path, title, section }) => ({
        section,
        name: title,
        href: path,
    }));
    const isFontLoaded = useFontFaceObserver([{ family: 'Druk wide medium' }]);

    const changeRoute = (href: string): Promise<boolean> =>
        router.push(
            {
                pathname: href,
                query: withQueryParams ? router.query : null,
            },
            null,
            { shallow: true }
        );

    useLayoutEffect(() => {
        if (itemsRef.current[currentIndex] && isFontLoaded) {
            setCurrentTabWidth(itemsRef.current[currentIndex]?.getBoundingClientRect().width);
            let prevWidth = 0;
            itemsRef.current.forEach((ref, index) => {
                if (index < currentIndex) {
                    prevWidth += ref.getBoundingClientRect().width + 24;
                }
            });
            setPrevWidth(prevWidth);
        }
    }, [currentIndex, isFontLoaded]);

    const setCurrenSection = (tab: string) => {
        const currentSectionIndex = routesToUse.findIndex((route) => tab === route.section);
        setCurrentIndex(currentSectionIndex !== -1 ? currentSectionIndex : 0);
    };

    useEffect(() => {
        if (currentSection) {
            setCurrenSection(currentSection.toString());
        }
    }, [currentSection]);

    return (
        <div ref={divRef} className={classNames('flex pl-2 sm:pl-0 z-50 relative bg-inherit flex-col items-start text-white w-fit', className)}>
            <div className="flex flex-row items-center gap-6">
                {tabs.map((tab, idx) => {
                    if (tab.name === 'Matchup' && isGameCompleted) {
                        return <></>;
                    }
                    return (
                        <button
                            ref={(el) => (itemsRef.current[idx] = el)}
                            onClick={() => {
                                if (ignoreClick) return;
                                trackEvent(`Tab ${tab.name} clicked`);

                                if (useRoutes) {
                                    changeRoute(tab.href);
                                } else {
                                    changeTab(tab.section);
                                    setCurrenSection(tab.section);
                                }
                            }}
                            className={classNames('flex flex-col items-center gap-3', buttonClassName || 'h-10')}
                            key={`${router.pathname}-${tab.name}`}
                        >
                            <div
                                className={classNames('subheading-one', {
                                    relative: highlightFreeAgentsTab && tab.name === 'Free agents',
                                })}
                                data-tut={`${
                                    tab.name === 'Free agents'
                                        ? 'use-free-agents'
                                        : tab.section === 'games'
                                        ? 'head-to-head-results'
                                        : tab.section === 'tourney'
                                        ? 'tourney-results'
                                        : ''
                                }`}
                            >
                                {tab.name}
                                {highlightFreeAgentsTab && tab.name === 'Free agents' && (
                                    <div
                                        className={classNames(
                                            'absolute -top-1.5 -right-2.5 animate-pulse duration-100 w-2.5 h-2.5 rounded-full bg-assist-green'
                                        )}
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            <div
                style={{ marginLeft: currentIndex !== 0 ? prevWidth : 0, width: `${currentTabWidth}px` }}
                className="transition-all ease-in-out duration-300"
            >
                <div className={classNames(borderColor || 'border-white bg-white', 'rounded-md border-1 w-full')} />
            </div>
        </div>
    );
};

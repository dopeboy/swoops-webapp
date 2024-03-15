import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import { Dispatch, SetStateAction } from 'react';
import { ProgressiveQuarters } from 'src/hooks/usePlayByPlay';
import { trackEvent } from 'src/lib/tracking';
import { HeadToHeadPlayByPlayItem } from './HeadToHeadPlayByPlayItem';

interface HeadToHeadPlayByPlayListProps {
    firstHeaderColor: string;
    secondHeaderColor: string;
    quarters: ProgressiveQuarters;
    teamOneLogo: string | null;
    teamTwoLogo: string | null;
    hasDataAvailable: boolean;
    currentQuarter: string;
    setCurrentQuarter: Dispatch<SetStateAction<'Q1' | 'Q2' | 'Q3' | 'Q4'>>;
}
export const HeadToHeadPlayByPlayList: React.FC<HeadToHeadPlayByPlayListProps> = ({
    quarters,
    teamOneLogo,
    teamTwoLogo,
    setCurrentQuarter,
    hasDataAvailable,
    currentQuarter,
    firstHeaderColor,
    secondHeaderColor,
}) => {
    const getTabIndex = () => {
        switch (currentQuarter) {
            case 'Q1':
                return 0;
            case 'Q2':
                return 1;
            case 'Q3':
                return 2;
            case 'Q4':
                return 3;
        }
    };

    return (
        <div className="flex flex-col w-full">
            <Tab.Group selectedIndex={getTabIndex()}>
                <div data-tut="navigate-quarters">
                    <Tab.List className="flex space-x-0.5 rounded-lg bg-black/20 px-1">
                        {Object.keys(quarters).map((quarter, index) => (
                            <Tab
                                onClick={() => {
                                    trackEvent('Head to Head - Clicked Quarter Tab with value: ' + quarter);
                                    setCurrentQuarter(quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4');
                                }}
                                key={index}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full py-2.5 rounded-t-md text-sm subheading-two font-medium leading-5',
                                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-white focus:outline-none focus:ring-2',
                                        selected
                                            ? 'bg-white/[0.12] border-b-2 border-white shadow text-white'
                                            : 'text-white  bg-white/[0.05] hover:bg-white/[0.10]'
                                    )
                                }
                            >
                                {quarter}
                            </Tab>
                        ))}
                    </Tab.List>
                </div>
                <Tab.Panels>
                    {Object.values(quarters).map((quarterData, idx) => (
                        <Tab.Panel key={idx}>
                            <div
                                className={classNames(
                                    'flex flex-col w-full border border-white/16 rounded-lg p-2 overflow-y-scroll overflow-x-hidden text-[11px] sm:text-base space-y-2',
                                    {
                                        'h-[350px]': !hasDataAvailable || (hasDataAvailable && quarters?.Q1?.plays?.length === 0),
                                        'h-[500px] md:h-[767px]': hasDataAvailable && quarters?.Q1?.plays?.length > 0,
                                    }
                                )}
                            >
                                {quarters[currentQuarter]?.plays?.map((item, index) => (
                                    <HeadToHeadPlayByPlayItem
                                        key={item?.index}
                                        chipColor={item?.team?.lineupNumber === 1 ? firstHeaderColor : secondHeaderColor}
                                        index={index}
                                        teamLogo={item?.team?.lineupNumber === 1 ? teamOneLogo : teamTwoLogo}
                                        {...item}
                                    />
                                ))}
                                {!hasDataAvailable && (
                                    <div className="flex flex-col items-center w-full h-full justify-center text-white heading-three text-center">
                                        No Play by Play Data available
                                    </div>
                                )}
                                {hasDataAvailable && quarters?.Q1?.plays?.length === 0 && (
                                    <div className="flex flex-col items-center w-full h-[350px] justify-center subheading-one text-white text-center">
                                        Ready to watch the game?
                                    </div>
                                )}
                            </div>
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

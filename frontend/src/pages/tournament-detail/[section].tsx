import { useState, ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthedLayout from 'src/components/common/AuthedLayout';
import withAuth from 'src/components/common/withAuth';
import Overview from 'src/components/tournamentDetail/Overview';
import Games from 'src/components/tournamentDetail/Games';
import FilterIcon from 'src/components/tournamentDetail/FilterIcon';
import RoundCard from 'src/components/tournamentDetail/RoundCard';
import { EllipsisHorizontalIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
import Tabs, { TabPane } from 'rc-tabs';
import moment from 'moment';
import { getPrice } from 'src/lib/utils';
import 'rc-tabs/assets/index.css';
import classnames from 'classnames';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import { trackPageLanding } from '../../lib/tracking';

const TournamentDetail = (): ReactElement => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [started] = useState<boolean>(true);

    const [gamesType, setGamesType] = useState<'All Games' | 'My Games'>('All Games');

    const { section } = router.query;

    const generateHeader = (): ReactElement => {
        return (
            <div className="pt-4">
                <div className="container-lg">
                    <div className="block sm:hidden">
                        <div className="flex justify-between items-center">
                            <ChevronLeftIcon className="text-white cursor-pointer h-6 w-6" />
                            <button className="icon-btn">
                                <EllipsisHorizontalIcon className="text-white h-6 w-6" />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex">
                            <div className="hidden sm:block mt-3 mr-10">
                                <ChevronLeftIcon className="text-white cursor-pointer h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="heading-one text-white">32 Team Tournament</h1>
                                <p className="heading-four text-white/64 font-normal text-[12px] leading-6">
                                    {started ? moment(new Date()).format('MMMM D, YYYY') : `Begins Today at ${moment(new Date()).format('h:mma')}`}
                                </p>
                            </div>
                        </div>
                        <div className="xl:pr-16 hidden sm:block">
                            <button className="icon-btn">
                                <EllipsisHorizontalIcon className="text-white h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const generateRound = (): ReactElement => {
        return (
            <div className="pt-4">
                <div className="container-md">
                    <RoundCard time="00:45" title="Round 1 Starting" summary="32 Teams Competing" button="View Round 1" />;
                </div>
            </div>
        );
    };

    const generateTabs = (): ReactElement => {
        const tabs = [{ name: 'overview' }, { name: 'games' }];

        return (
            <div
                className={classnames('border-b border-solid border-white/16', {
                    'pt-8': started,
                    'pt-16': !started,
                })}
            >
                <div className="container-md">
                    <Tabs
                        data-extra="tabs"
                        activeKey={section as string}
                        defaultActiveKey={section as string}
                        onTabClick={(key) => {
                            router.push(`/tournament-detail/${key}`);
                        }}
                    >
                        {tabs.map((tab) => (
                            <TabPane key={tab.name} tab={<div>{tab.name} </div>} />
                        ))}
                    </Tabs>
                </div>
            </div>
        );
    };

    const generateFilter = (): ReactElement => {
        const gamesButton: any[] = [
            {
                title: 'My Games',
            },
            {
                title: 'All Games',
            },
        ];

        return (
            <div className="py-4 border-solid border-white/16 border-b">
                <div className="container-md">
                    <div className="flex flex-col md:flex-row md:justify-end items-start gap-y-4 md:space-x-4">
                        <div className="relative inline-flex align-middle">
                            {gamesButton.map((button, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className={classnames(
                                        'bg-white/4 hover:bg-white/8 text-base border-r-2 border-solid border-off-black relative flex-auto   text-white  inline-block font-medium text-center  align-middle  no-underline leading-6 rounded-none ',
                                        {
                                            'p-1': gamesType === button.title,
                                            'px-3 py-3 hover:bg-white/8': gamesType !== button.title,
                                            'rounded-l-md': idx === 0,
                                            'rounded-r-md': idx === gamesButton.length - 1,
                                        }
                                    )}
                                    onClick={() => {
                                        setGamesType(button.title);
                                    }}
                                >
                                    <span
                                        className={classnames({
                                            'bg-white text-off-black px-2 py-3 rounded-md': gamesType === button.title,
                                        })}
                                    >
                                        {button.title}
                                    </span>
                                </button>
                            ))}
                            <div className="block lg:hidden pl-4">
                                <button className="icon-btn">
                                    <FilterIcon />
                                </button>
                            </div>
                        </div>
                        <div className="hidden lg:block ">
                            <button className="icon-btn">
                                <FilterIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const generateContent = (section: string): ReactElement => {
        const stateTournaments = [
            {
                title: 'Current Prize Pool',
                summary: getPrice('12000'),
                tournaments: [
                    {
                        title: 'Platform Prize',
                        prizepool: getPrice('10000'),
                        currency: 'USD',
                    },
                    {
                        title: 'Rental Bonus',
                        prizepool: getPrice('2000'),
                        currency: 'USD',
                    },
                ],
            },
            {
                title: 'Teams Joined',
                summary: '16 of 32',
                tournaments: [
                    {
                        title: 'Champion Payout',
                        prizepool: getPrice('1000'),
                        currency: 'USD',
                    },
                    {
                        title: 'Finalist Payout',
                        prizepool: getPrice('500'),
                        currency: 'USD',
                    },
                    {
                        title: 'Semifinalist Payout',
                        prizepool: getPrice('250'),
                        currency: 'USD',
                    },
                    {
                        title: 'Quarterfinalist Payout',
                        prizepool: getPrice('100'),
                        currency: 'USD',
                    },
                ],
            },
        ];

        const stateLineups = [
            {
                imageUrl: 'lineup_player_card.png',
                role: 'Shooting Guard',
                name: 'Will Slaprock',
                type: 'My Roster',
            },
            {
                imageUrl: 'lineup_player_card.png',
                role: 'Shooting Guard',
                name: 'Will Slaprock',
                type: 'Autopopulated',
            },
            {
                imageUrl: 'lineup_player_card.png',
                role: 'Shooting Guard',
                name: 'Will Slaprock',
                type: 'My Roster',
            },
            {
                imageUrl: 'lineup_player_card.png',
                role: 'Shooting Guard',
                name: 'Will Slaprock',
                type: 'Free Agent',
            },
            {
                imageUrl: 'lineup_player_card.png',
                role: 'Shooting Guard',
                name: 'Will Slaprock',
                type: 'My Roster',
            },
        ];

        const stateMatches = [
            {
                type: 'Final',
                players: [
                    [
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: true,
                            title: '96',
                        },
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: false,
                            title: '80',
                        },
                    ],
                    [
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: true,
                            title: '96',
                        },
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: false,
                            title: '80',
                        },
                    ],
                ],
            },
            {
                type: 'Final',
                players: [
                    [
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: true,
                            title: '96',
                        },
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: false,
                            title: '80',
                        },
                    ],
                    [
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: true,
                            title: '96',
                        },
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: false,
                            title: '80',
                        },
                    ],
                ],
            },
            {
                type: 'Final',
                players: [
                    [
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: true,
                            title: '96',
                        },
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: false,
                            title: '80',
                        },
                    ],
                    [
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: true,
                            title: '96',
                        },
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: false,
                            title: '80',
                        },
                    ],
                ],
            },
            {
                type: 'Final',
                players: [
                    [
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: true,
                            title: '96',
                        },
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: false,
                            title: '80',
                        },
                    ],
                    [
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: true,
                            title: '96',
                        },
                        {
                            imageUrl: 'AvatarPink.png',
                            name: 'Los Angeles Stakers',
                            score: '67-15',
                            live: false,
                            title: '80',
                        },
                    ],
                ],
            },
        ];

        if (section === 'overview') {
            return <Overview started={started} tournaments={stateTournaments} lineups={stateLineups} />;
        } else if (section === 'games') {
            return <Games matches={stateMatches} />;
        }
        return <div />;
    };

    useEffect(() => {
        trackPageLanding(`Tournament detail`);
        setLoading(false);
    }, []);

    return (
        <PageLoadingWrapper loading={loading}>
            <AuthedLayout>
                {generateHeader()}
                {started && generateRound()}
                {section && generateTabs()}
                {section === 'games' && generateFilter()}
                {generateContent(section as string)}
            </AuthedLayout>
        </PageLoadingWrapper>
    );
};

export default withAuth(TournamentDetail);

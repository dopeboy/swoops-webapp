import { Disclosure } from '@headlessui/react';
import { Bars3Icon, UserIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { BellIcon } from '@heroicons/react/24/outline';
import MagicBell, { FloatingNotificationInbox } from '@magicbell/magicbell-react';
import classNames from 'classnames';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import RCTabs, { TabPane } from 'rc-tabs';
import config from 'tailwind.config';
import 'rc-tabs/assets/index.css';
import { useState, useEffect } from 'react';
import { AccountsService } from 'src/lib/api';
import { loginRoute, topLevelRoutes } from 'src/lib/routes';
import { trackEvent } from 'src/lib/tracking';
import { getUserDetail } from 'src/lib/utils';
import { GmDropdown } from './GmDropdown';
import { NavbarProfileMenu } from './NavbarProfileMenu';
import { ContactUsModal } from './ContactUsModal';
import { isUserLoggedIn } from 'src/lib/utils';

const Tabs = styled(RCTabs)`
    .rc-tabs-top {
        flex-direction: row !important;
    }
    .rc-tabs-tab-btn {
        padding-bottom: 10px !important;
    }

    .rc-tabs-tab-btn {
        color: ${config.theme.extend.colors.black} !important;
    }
    .rc-tabs-ink-bar {
        background: ${config.theme.extend.colors.black} !important;
    }
`;

interface ResponsiveNavbarProps {
    isPublic?: boolean;
}
export const ResponsiveNavbar: React.FC<ResponsiveNavbarProps> = ({ isPublic }): JSX.Element => {
    const router = useRouter();
    const path = router.asPath.split('/')[1];
    const [contactUsModalOpen, setContactUsModalOpen] = useState<boolean>(false);
    const [routes, setRoutes] = useState([]);
    const { onboarding } = router.query;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (topLevelRoutes) {
            setRoutes(topLevelRoutes);
        }
    }, [topLevelRoutes]);

    useEffect(() => {
        if (router.isReady) {
            setLoading(false);
        }
    }, [router.isReady]);

    const login = async (): Promise<void> => {
        router.push(loginRoute);
    };

    const routeIsTournaments = (): boolean => {
        if (router.pathname === '/tournaments') {
            return false;
        }
        return router.pathname.includes('tournament') && !router.pathname.includes('series');
    };

    return (
        <div className={classNames(routeIsTournaments() ? 'bg-black' : 'bg-off-black', `px-4 pt-4 z-50`)}>
            {router.isReady && (
                <Disclosure as="nav" defaultOpen={onboarding === 'true'}>
                    {({ open }) => (
                        <>
                            <div
                                className={classNames('lg:bg-navbar p-0 bg-white lg:bg-transparent h-[72px] pr-2 md:pr-4 navbar-font-resize:pr-8', {
                                    'rounded-lg': !open,
                                    'rounded-t-lg': open,
                                })}
                                style={{ paddingLeft: '0' }}
                            >
                                <div className="flex flex-row items-center justify-between h-full px-1 md:px-3">
                                    <div className="flex flex-row items-center justify-start w-full lg:px-2">
                                        {/* Mobile Nav Button */}
                                        <Disclosure.Button className="lg:hidden bg-white inline-flex items-center justify-center p-2 rounded-md text-black">
                                            <span className="sr-only">Open main menu</span>
                                            {open ? (
                                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                            ) : (
                                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                            )}
                                        </Disclosure.Button>
                                        {/* Swoops Logo */}
                                        <div className="flex-shrink-0 flex items-center md:ml-2 lg:ml-0">
                                            <img className="h-auto w-10" src="/images/logo.png" />
                                        </div>
                                        {/* Desktop Nav */}
                                        <div className="hidden ml-4 navbar-font-resize:ml-9 lg:flex flex-row items-center h-full justify-start mt-1">
                                            {routes.length > 0 && (
                                                <Tabs
                                                    data-extra="tabs"
                                                    activeKey={path}
                                                    defaultActiveKey={path}
                                                    onTabClick={(key) => {
                                                        const route = topLevelRoutes.find((route) => route.key === key);
                                                        trackEvent(`Tab ${route.path} clicked`);
                                                        if (key === 'locker-room' || key === 'games') {
                                                            /*
                                                            AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), {
                                                                tutorial: { completed_step_number: key === 'locker-room' ? 500 : 600 },
                                                            });
                                                            */
                                                            router.push({
                                                                pathname: `/${route.path}`,
                                                                query:
                                                                    onboarding === 'true' ? { onboarding: 'true', showTutorialProgress: 'true' } : {},
                                                            });
                                                        } else {
                                                            router.push(`/${route.path}`);
                                                        }
                                                    }}
                                                >
                                                    {routes
                                                        .filter((tab) => tab.key !== 'add-players')
                                                        .map((tab) => (
                                                            <TabPane
                                                                key={tab.key}
                                                                tab={
                                                                    <span
                                                                        data-tut={`${
                                                                            tab.key === 'games'
                                                                                ? 'start-head-to-head'
                                                                                : tab.key === 'locker-room'
                                                                                ? 'locker-room-intro'
                                                                                : tab.key === 'stats'
                                                                                ? 'challenge-progress-leaderboard'
                                                                                : ''
                                                                        }`}
                                                                        className={classNames(
                                                                            'subheading-three navbar-font-resize:subheading-two text-black leading-6 hidden md:flex',
                                                                            {
                                                                                hidden: tab.key === 'add-players',
                                                                            }
                                                                        )}
                                                                    >
                                                                        {tab.title}
                                                                    </span>
                                                                }
                                                            />
                                                        ))}
                                                </Tabs>
                                            )}
                                            <GmDropdown />
                                        </div>
                                    </div>
                                    {/* Right side of navbar */}
                                    <div className="flex flex-row items-center justify-end w-full">
                                        {!isPublic && getUserDetail()?.magic_bell_hmac && (
                                            <MagicBell
                                                apiKey={process.env.MAGIC_BELL_API_KEY}
                                                BellIcon={
                                                    <BellIcon className="text-indigo-800 h-5 w-5 navbar-font-resize:h-8 navbar-font-resize:w-8" />
                                                }
                                                userExternalId={getUserDetail()?.id?.toString()}
                                                userKey={getUserDetail()?.magic_bell_hmac}
                                                locale="en"
                                            >
                                                {(props) => <FloatingNotificationInbox placement="bottom" width={400} height={500} {...props} />}
                                            </MagicBell>
                                        )}
                                        {/* Profile dropdown */}
                                        {!loading && <NavbarProfileMenu isHidden={isPublic} setContactUsModalOpen={setContactUsModalOpen} />}
                                        <button
                                            className={classNames(
                                                'hover:bg-gray-100 w-fit flex flex-row items-center gap-2.5 border subheading-two border-black/8 rounded-lg px-4 py-3 text-md text-black',
                                                {
                                                    hidden: !isPublic,
                                                }
                                            )}
                                            onClick={login}
                                        >
                                            <UserIcon className="h-4 w-4 text-gray-500" /> Sign In
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Mobile Nav */}
                            <Disclosure.Panel className="lg:hidden">
                                <div className="pt-2 pb-4 space-y-1 bg-white rounded-b-lg">
                                    {routes.map((link) => (
                                        <button
                                            onClick={() => {
                                                const route = topLevelRoutes.find((route) => route.key === link.key);
                                                trackEvent(`Tab ${route.path} clicked`);

                                                if (link.key === 'locker-room' || link.key === 'games') {
                                                    /*
                                                    AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), {
                                                        tutorial: { completed_step_number: link === 'locker-room' ? 500 : 600 },
                                                    });
                                                    */
                                                    router.push({
                                                        pathname: `/${route.path}`,
                                                        query: onboarding === 'true' ? { onboarding: 'true', showTutorialProgress: 'true' } : {},
                                                    });
                                                } else {
                                                    router.push(`/${route.path}`);
                                                }
                                            }}
                                        >
                                            <span
                                                className="bg-white text-black block pl-3 pr-4 py-2 text-base font-medium hover:bg-black/4"
                                                data-tut={`${
                                                    link.key === 'games'
                                                        ? 'start-head-to-head'
                                                        : link.key === 'locker-room'
                                                        ? 'locker-room-intro'
                                                        : link.key === 'stats'
                                                        ? 'challenge-progress-leaderboard'
                                                        : ''
                                                }`}
                                            >
                                                {link.title}
                                            </span>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            router.push(`/gm`);
                                        }}
                                    >
                                        <span
                                            className="bg-white text-black block pl-3 pr-4 py-2 text-base font-medium hover:bg-black/4"
                                        >
                                            GM Daily Challenge
                                        </span>
                                    </button>
                                    {isUserLoggedIn() && 
                                        <button
                                            onClick={() => {
                                                router.push(`/gm/me`);
                                            }}
                                        >
                                            <span
                                                className="bg-white text-black block pl-3 pr-4 py-2 text-base font-medium hover:bg-black/4"
                                            >
                                              GM My Stats 
                                            </span>
                                        </button>
                                    }
                                </div>
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>
            )}
            <ContactUsModal open={contactUsModalOpen} setOpen={setContactUsModalOpen} />
        </div>
    );
};

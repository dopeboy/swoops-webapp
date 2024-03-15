import { ReactElement, useState, useEffect } from 'react';
import RCTabs, { TabPane } from 'rc-tabs';
import styled from 'styled-components';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import config from 'tailwind.config';
import 'rc-tabs/assets/index.css';
import { topLevelRoutes } from 'src/lib/routes';
import { ContactUsModal } from './ContactUsModal';
import { NavbarProfileMenu } from './NavbarProfileMenu';
import { trackEvent } from '../../lib/tracking';
import MagicBell, { FloatingNotificationInbox } from '@magicbell/magicbell-react';
import { getUserDetail } from 'src/lib/utils';
import { AccountsService } from 'src/lib/api';
import { GmDropdown } from './GmDropdown';

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

export default function Navbar(): ReactElement {
    const router = useRouter();
    const path = router.asPath.split('/')[1];
    const [contactUsModalOpen, setContactUsModalOpen] = useState<boolean>(false);
    const [routes, setRoutes] = useState([]);
    const { onboarding } = router.query;
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [defaultOpen, setdDefaultOpen] = useState(false);

    useEffect(() => {
        if (topLevelRoutes) {
            setRoutes(topLevelRoutes);
        }
    }, [topLevelRoutes]);

    useEffect(() => {
        if (router.isReady) {
            setdDefaultOpen(onboarding === 'true');
        }
    }, [router.isReady]);

    useEffect(() => {
        setIsLargeScreen(window?.innerWidth > 640);

        const handleResize = () => {
            setIsLargeScreen(window.innerWidth > 640);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const routeIsTournaments = () => {
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
                            <div>
                                <div
                                    className={classNames('relative flex justify-between bg-white md:bg-transparent md:bg-navbar h-[72px]', {
                                        'rounded-lg': !open,
                                        'rounded-t-lg': open,
                                    })}
                                    style={{ paddingRight: '4rem', paddingLeft: '1.25rem' }}
                                >
                                    <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
                                        {/* Mobile menu button */}
                                        <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-black">
                                            <span className="sr-only">Open main menu</span>
                                            {open ? (
                                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                            ) : (
                                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                            )}
                                        </Disclosure.Button>
                                    </div>
                                    <div className="flex-1 flex items-center md:items-stretch justify-start">
                                        <div className="flex-shrink-0 flex items-center ml-6 md:ml-0">
                                            <img className="h-auto w-10" src="/images/logo.png" />
                                        </div>
                                        {isLargeScreen && (
                                            <div className="hidden md:ml-9 md:flex md:flex-row md:space-x-8 md:items-center md:justify-start mt-1">
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
                                                                        onboarding === 'true'
                                                                            ? { onboarding: 'true', showTutorialProgress: 'true' }
                                                                            : {},
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
                                                                            className={classNames('text-xs leading-6 hidden md:flex', {
                                                                                hidden: tab.key === 'add-players',
                                                                            })}
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
                                        )}
                                    </div>
                                    <div className="flex items-center pr-2 md:ml-4 md:pr-0">
                                        <MagicBell
                                            apiKey={process.env.MAGIC_BELL_API_KEY}
                                            userExternalId={getUserDetail()?.id?.toString()}
                                            userKey={getUserDetail()?.magic_bell_hmac}
                                            locale="en"
                                        >
                                            {(props) => <FloatingNotificationInbox width={400} height={500} {...props} />}
                                        </MagicBell>
                                        {/* Profile dropdown */}
                                        <NavbarProfileMenu setContactUsModalOpen={setContactUsModalOpen} />
                                    </div>
                                </div>
                            </div>

                            {!isLargeScreen && (
                                <Disclosure.Panel className="md:hidden">
                                    <div className="pt-2 pb-4 space-y-1 bg-white">
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
                                                    className="bg-white  text-black block pl-3 pr-4 py-2 text-base font-medium hover:bg-black/4"
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
                                    </div>
                                </Disclosure.Panel>
                            )}
                        </>
                    )}
                </Disclosure>
            )}
            <ContactUsModal open={contactUsModalOpen} setOpen={setContactUsModalOpen} />
        </div>
    );
}

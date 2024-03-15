import { Fragment, ReactElement } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, ChevronDownIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import 'rc-tabs/assets/index.css';
import { loginRoute, publicTopLevelRoutes } from 'src/lib/routes';
import RCTabs, { TabPane } from 'rc-tabs';
import styled from 'styled-components';
import config from 'tailwind.config';
import SwoopsGMIcon from '../gm/swoopsGm/SwoopsGMIcon';
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

export const PublicNavbar = (): ReactElement => {
    const router = useRouter();
    const path = router.asPath.split('/')[1];
    const login = async (): Promise<void> => {
        router.push(loginRoute);
    };

    const routeIsTournaments = () => {
        if (router.pathname === '/tournaments') {
            return false;
        }
        return router.pathname.includes('tournament') && !router.pathname.includes('series');
    };

    return (
        <div className={classNames(routeIsTournaments() ? 'bg-black' : 'bg-off-black', `px-4 pt-4 z-50 relative`)}>
            <Disclosure as="nav">
                {({ open }) => (
                    <div>
                        <div
                            className={classNames('relative flex justify-between bg-white md:bg-transparent md:bg-navbar h-[72px]', {
                                'rounded-lg': !open,
                                'rounded-t-lg': open,
                            })}
                            style={{ paddingRight: '4rem', paddingLeft: '1.25rem' }}
                        >
                            <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
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
                                <div className="hidden md:ml-9 md:flex md:space-x-8 md:items-center mt-1 ">
                                    <Tabs
                                        data-extra="tabs"
                                        activeKey={path}
                                        defaultActiveKey={path}
                                        onTabClick={(key) => {
                                            const route = publicTopLevelRoutes.find((route) => route.key === key);
                                            router.push(`/${route.path}`);
                                        }}
                                    >
                                        {publicTopLevelRoutes.map((tab) => (
                                            <TabPane
                                                key={tab.key}
                                                tab={
                                                    <span className="text-xs leading-6">
                                                        {tab.title}
                                                        {tab.key === 'games' && (
                                                            <span className="bg-light-purple text-purple text-sm ml-2 px-2 rounded">Beta</span>
                                                        )}
                                                    </span>
                                                }
                                            />
                                        ))}
                                    </Tabs>
                                </div>
                            </div>
                            <GmDropdown />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:static md:inset-auto md:ml-6 md:pr-0">
                                <button
                                    className="hover:bg-gray-100 flex flex-row items-center gap-2.5 border subheading-two border-black/8 rounded-lg px-4 py-3 text-md text-black"
                                    onClick={login}
                                >
                                    <UserIcon className="h-4 w-4 text-gray-500" /> Sign In
                                </button>
                            </div>
                        </div>
                        <Disclosure.Panel className="md:hidden">
                            <div className="pt-2 pb-4 space-y-1 bg-white">
                                {publicTopLevelRoutes.map((link) => (
                                    <Disclosure.Button
                                        as="a"
                                        href={`/${link.path}`}
                                        key={link.key}
                                        className={classNames('bg-white  text-black block pl-3 pr-4 py-2 text-base font-medium hover:bg-black/4', {
                                            'border-black border-l-4 ': path === link.key,
                                        })}
                                    >
                                        {link.title}
                                    </Disclosure.Button>
                                ))}
                            </div>
                        </Disclosure.Panel>
                    </div>
                )}
            </Disclosure>
        </div>
    );
};

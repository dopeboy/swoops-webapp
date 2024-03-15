import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Disclosure } from '@headlessui/react';
import classNames from 'classnames';
import TwitterIcon from 'src/components/gm/swoopsGm/TwitterIcon';
import SwoopsGMIcon from 'src/components/gm/swoopsGm/SwoopsGMIcon';
import LogoIcon from 'src/components/gm/common/LogoIcon';
import { NavbarProfileMenu } from 'src/components/common/NavbarProfileMenu';
import { ContactUsModal } from 'src/components/common/ContactUsModal';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { logoutUserFromClient } from 'src/lib/utils';
import { AccountsService } from 'src/lib/api';
import { useTorus } from 'src/contexts/Torus.context';
import { useDisconnect } from 'wagmi';
import { isUserLoggedIn } from 'src/lib/gm/utils';

function Navbar(): ReactElement {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { torus } = useTorus();
    const { disconnect } = useDisconnect();
    const [contactUsModalOpen, setContactUsModalOpen] = useState<boolean>(false);

    const logout = async (e: any): Promise<void> => {
        if (e) e?.preventDefault();

        try {
            // clears cookie on client side + invalidates on server side
            await AccountsService.accountsLogoutCreate();
            if (torus && torus.isLoggedIn) {
                await torus.logout();
            }
        } catch (error) {
            console.error(error, 'error logging out');
        }
        // clears flag client side
        logoutUserFromClient();
        disconnect();

        // redirect
        router.push('/gm');
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <>
            <Disclosure as="nav" className="md:px-4 md:pt-4 bg-black">
                {({ open }) => (
                    <>
                        <div>
                            <div className="relative flex items-center px-2 justify-between bg-black md:bg-transparent h-[50px] md:bg-navbar md:h-[72px] border-b border-solid border-white/32 md:border-none ">
                                <Disclosure.Button className="md:hidden inline-flex items-center justify-start">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="text-white h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="text-white h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                                <div className="flex items-center justify-start">
                                    <LogoIcon color="white" className="h-auto hidden md:block" />
                                    <LogoIcon color="black" className="h-auto block md:hidden" />
                                    <div className="ml-2 md:ml-5 cursor-pointer">
                                        <a
                                            onClick={() => {
                                                router.push('/gm');
                                            }}
                                        >
                                            <SwoopsGMIcon className="fill-white md:fill-black" />
                                        </a>
                                    </div>
                                    <span className="bg-light-purple text-purple text-sm ml-2 px-2 rounded">Beta</span>
                                </div>
                                <div className="lg:mr-8 flex items-center">
                                    <ul className="hidden md:flex items-center mb-0">
                                        <li className="relative md:px-2 lg:px-5 text-[12px] leading-5">
                                            <a
                                                className="flex items-center text-black cursor-pointer block  text-base font-medium"
                                                onClick={() => {
                                                    router.push('/gm/leaderboard');
                                                }}
                                            >
                                                Leaderboard
                                            </a>
                                        </li>

                                        <li className="relative md:px-2 lg:px-5 text-[12px] leading-5">
                                            <a
                                                className="flex items-center text-black cursor-pointer block  text-base font-medium"
                                                href="https://blog.playswoops.com/"
                                                target="_blank"
                                            >
                                                Blog
                                                {/* <ExternalLinkIcon className="w-6 h-6 ml-2.5" /> */}
                                            </a>
                                        </li>
                                        <li className="relative flex items-center inline-block text-[14px] leading-5">
                                            <a
                                                className="rounded-full px-5 py-3.5 bg-blue flex items-center justify-center md:ml-0 lg:ml-4 normal-case"
                                                href="https://twitter.com/PlaySwoops"
                                                target="_blank"
                                            >
                                                <TwitterIcon />
                                                <span className="ml-2.5 font-body text-white">@PlaySwoops</span>
                                            </a>
                                        </li>
                                        {!loading && isUserLoggedIn() && <NavbarProfileMenu setContactUsModalOpen={setContactUsModalOpen} />}
                                    </ul>
                                    <div className="flex items-center md:hidden">
                                        <a
                                            href="https://twitter.com/PlaySwoops"
                                            target="_blank"
                                            className="rounded-full h-8 w-8 p-0 bg-blue flex items-center justify-center ml-0 "
                                        >
                                            <TwitterIcon />
                                            <span className="ml-2.5 md:inline-block hidden text-white">@PlaySwoops</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Disclosure.Panel className="md:hidden">
                            <ul className="flex flex-col  mb-0">
                                <li className="relative py-3.5 border-solid border-white/32 border-b px-5 text-[12px] leading-5 cursor-pointer">
                                    <a
                                        onClick={() => {
                                            router.push('gm/leaderboard');
                                        }}
                                        className={classNames('flex items-center text-white block text-base font-medium')}
                                    >
                                        Leaderboard
                                    </a>
                                </li>
                                <li className="relative py-3.5 border-solid border-white/32 border-b px-5 text-[12px] leading-5">
                                    <Disclosure.Button
                                        as="a"
                                        href="https://www.playswoops.com/"
                                        target="_blank"
                                        className={classNames('flex items-center text-white block text-base font-medium')}
                                    >
                                        Swoops
                                        {/* <ExternalLinkIcon className="w-6 h-6 ml-2.5" /> */}
                                    </Disclosure.Button>
                                </li>
                                <li className="relative py-3.5 border-solid border-white/32 border-b px-5 text-[12px] leading-5">
                                    <Disclosure.Button
                                        as="a"
                                        href="https://blog.playswoops.com/"
                                        target="_blank"
                                        className={classNames('flex items-center text-white block text-base font-medium')}
                                    >
                                        Blog
                                        {/* <ExternalLinkIcon className="w-6 h-6 ml-2.5" /> */}
                                    </Disclosure.Button>
                                </li>
                                {!loading && isUserLoggedIn() && (
                                    <li className="relative py-3.5 border-solid border-white/32 border-b px-5 text-[12px] leading-5">
                                        <Disclosure.Button
                                            onClick={(e) => logout(e)}
                                            className={classNames('items-center text-white block text-base font-medium')}
                                        >
                                            Sign Out
                                        </Disclosure.Button>
                                    </li>
                                )}
                            </ul>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
            <ContactUsModal open={contactUsModalOpen} setOpen={setContactUsModalOpen} />
        </>
    );
}

export default Navbar;

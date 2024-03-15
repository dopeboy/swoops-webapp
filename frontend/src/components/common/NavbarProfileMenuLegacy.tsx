import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, ExclamationTriangleIcon, KeyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AccountsService } from 'src/lib/api';
import { loginRoute } from 'src/lib/routes';
import { logoutUserFromClient } from 'src/lib/utils';
import { useAccount, useBalance, useDisconnect } from 'wagmi';

export const NavbarProfileMenuLegacy = ({ setContactUsModalOpen }) => {
    const router = useRouter();
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const { disconnect } = useDisconnect();
    const account = useAccount();
    const { data: balance } = useBalance({ address: account?.address });

    const maskAddress = (address: string): string => {
        return `${address?.slice(0, 4)}********${address?.slice(-4)}`;
    };

    const logout = async (): Promise<void> => {
        try {
            // clears cookie on client side + invalidates on server side
            await AccountsService.accountsLogoutCreate();
        } catch (err) {
            console.error('error logging out');
        }
        // clears flag client side
        logoutUserFromClient();
        disconnect();

        // redirect
        router.push(loginRoute);
    };

    return (
        <Menu as="div" className="ml-3 relative">
            <div>
                <Menu.Button
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPosition({ top: rect.top + rect.height + window.pageYOffset, left: rect.left });
                    }}
                    className="font-medium"
                >
                    <div className="rounded-lg bg-white/8 px-2.5 py-2 border border-solid border-black/8 hover:bg-black/4">
                        <div className="flex items-center">
                            <div>
                                <div className="text-base  text-black font-bold font-display text-right ">
                                    {account?.address ? maskAddress(account?.address) : 'N/A'}
                                </div>
                                <div className="text-xs  text-off-black font-semi-bold  text-right font-display">
                                    {balance?.formatted} {balance?.symbol}
                                </div>
                            </div>
                            <ChevronDownIcon className="ml-4 h-5 w-5 text-black" aria-hidden="true" />
                        </div>
                    </div>
                </Menu.Button>
            </div>
            <Transition
                as="div"
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                {createPortal(
                    <Menu.Items
                        style={{ top: menuPosition.top, left: menuPosition.left }}
                        className="z-60 origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                        <Menu.Item>
                            {({ active }) => (
                                <>
                                    <a
                                        href="#"
                                        className={classNames(
                                            active ? 'bg-gray-100 rounded-lg' : '',
                                            'flex flex-row items-center gap-2.5 border subheading-two border-black/8 rounded-lg px-4 py-3 text-md text-black'
                                        )}
                                        onClick={() => setContactUsModalOpen(true)}
                                    >
                                        <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" /> Report an issue
                                    </a>
                                    <a
                                        href="#"
                                        className={classNames(
                                            active ? 'bg-gray-100 rounded-lg' : '',
                                            'flex flex-row items-center gap-2.5 border subheading-two border-black/8 rounded-lg px-4 py-3 text-md text-black'
                                        )}
                                        onClick={logout}
                                    >
                                        <KeyIcon className="h-4 w-4 text-gray-500" /> Sign out
                                    </a>
                                </>
                            )}
                        </Menu.Item>
                    </Menu.Items>,
                    document.body
                )}
            </Transition>
        </Menu>
    );
};

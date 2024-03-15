import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { isUserLoggedIn } from 'src/lib/utils';

export const GmDropdown: React.FC = () => {
    const router = useRouter();
    return (
        <div className="flex items-center pr-2">
            <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="uppercase inline-flex w-fit items-center justify-start rounded-md bg-white px-4 pt-2 pb-2 mb-2 -ml-4 text-sm font-medium text-black hover:bg-black hover:bg-opacity-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <span className="subheading-three navbar-font-resize:subheading-two leading-[.04em] text-black">GM</span>
                    <ChevronDownIcon className="ml-2 -mr-1 h-4 w-4 text-black/50 hover:text-indigo-100" aria-hidden="true" />
                </Menu.Button>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-2 mt-2 w-44 origin-top-right divide-y divide-gray-100 border border-black/20 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => router.push('/gm')}
                                        className={`${
                                            active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                                        } group flex uppercase w-full items-center rounded-md px-3 py-2 text-sm`}
                                    >
                                        Play
                                    </button>
                                )}
                            </Menu.Item>
                            {isUserLoggedIn() && 
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => router.push('/gm/me')}
                                            className={`${
                                                active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                                            } group flex uppercase w-full items-center rounded-md px-3 py-2 text-sm`}
                                        >
                                            My Stats
                                        </button>
                                    )}
                                </Menu.Item>
                            }
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};

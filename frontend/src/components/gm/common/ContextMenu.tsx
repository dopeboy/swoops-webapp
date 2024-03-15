import { Fragment, ReactElement } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { PencilIcon, StarIcon } from '@heroicons/react/solid';
import classNames from 'classnames';

export default function ContextMenu(): ReactElement {
    return (
        <Menu as="div" className="relative inline-block">
            <div>
                <Menu.Button className="inline-flex justify-center pt-2 rounded-md border h-12 w-12 border-white/4 shadow-sm  bg-white/4 text-base text-white text-display">
                    ...
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <a
                                    href="#"
                                    className={classNames(
                                        active ? 'bg-black/4  text-black' : ' text-black/64',
                                        'px-4 py-2 text-base block text-display '
                                    )}
                                >
                                    <PencilIcon className="w-4 h-4 mr-3 inline-block" />
                                    Edit Team Name
                                </a>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a
                                    href="#"
                                    className={classNames(
                                        active ? 'bg-black/4  text-black' : ' text-black/64',
                                        'px-4 py-2 text-base block text-display '
                                    )}
                                >
                                    <StarIcon className="w-4 h-4 mr-3 inline-block" />
                                    Action
                                </a>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}

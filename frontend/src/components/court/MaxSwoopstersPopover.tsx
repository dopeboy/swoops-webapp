import { Popover, Transition } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

export const MaxSwoopstersPopover: React.FC = () => {
    return (
        <Popover className="relative">
            <Popover.Button className="rounded-full hover:bg-white/8 p-0.5">
                <InformationCircleIcon className="h-6 w-6 text-white" />
            </Popover.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute z-10 sm:-mt-1 w-screen max-w-xs -right-24 sm:right-1/2 transform px-4 sm:px-0">
                    {({ close }) => (
                        <div onClick={() => close()} className="cursor-pointer overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="relative bg-white text-base py-3 px-4 border border-black rounded-lg shadow-lg">
                                {'Maximum number of owned Swoopsters that can be entered into a single contest'}
                            </div>
                        </div>
                    )}
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};

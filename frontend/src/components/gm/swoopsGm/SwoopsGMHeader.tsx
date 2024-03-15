import { ReactElement } from 'react';
import { Disclosure } from '@headlessui/react';

const SwoopsGMHeader = (): ReactElement => {
    return (
        <Disclosure as="nav" className="md:px-4 md:pt-4 bg-black">
            <div className="relative flex items-center px-2 justify-between bg-white md:bg-transparent rounded-none md:rounded-lg  bg-navbar md:h-[72px] border-b border-solid border-white/32 md:border-none ">
                <div className="w-full">
                    <div className="flex-1  flex items-center justify-center">
                        <div className="flex-shrink-0 flex items-center ml-6 md:ml-0">
                            <img className="h-10 w-10" src="/images/logo.png" />
                        </div>
                        <div className="ml-6 md:flex md:space-x-8 md:items-center mt-1  cursor-pointer " onClick={() => {}}>
                            <h1 className="heading-two">Swoops GM</h1>
                        </div>
                    </div>
                </div>
            </div>
        </Disclosure>
    );
};

export default SwoopsGMHeader;

import React, { ReactElement } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const Header = (): ReactElement => {
    return (
        <div className="bg-black p-6 space-y-4">
            <div className="flex md:justify-between items-center relative">
                <div className="mr-8 md:mr-0">
                    <button className="icon-btn">
                        <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                </div>
                <div className="block md:hidden">
                    <h1 className="heading-two text-white text-center">Swoops GM</h1>
                </div>
                <div className="hidden md:block">
                    <div className="absolute top-1/2 left-1/2 " style={{ transform: 'translate(-50%,-50%)' }}>
                        <h1 className="heading-two text-white text-center">Swoops GM</h1>
                    </div>
                    <div>
                        <button className="btn-rounded-grey">Submit Lineup</button>
                    </div>
                </div>
            </div>
            <div className="block md:hidden">
                <button className="btn-rounded-grey">Submit Lineup</button>
            </div>
        </div>
    );
};

export default Header;

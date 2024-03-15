import React, { ReactElement } from 'react';
import MainLayout from 'src/components/gm/common/MainLayout';

const Closed = (): ReactElement => {
    return (
        <MainLayout>
            <div className="md:h-[calc(100vh-88px)] h-[calc(100vh-50px)] flex items-center justify-center bg-black">
                <div className="container-sm text-center">
                    <span className="text-[12px] leading-6 uppercase font-header font-bold md:heading-three text-white/64">
                        After the buzzer! Check back after midnight PST tomorrow for the next SwoopsGM Challenge.
                    </span>
                </div>
            </div>
        </MainLayout>
    );
};

export default Closed;

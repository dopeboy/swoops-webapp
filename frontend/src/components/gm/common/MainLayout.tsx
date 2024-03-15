import React from 'react';
import { ResponsiveNavbar } from 'src/components/common/ResponsiveNavbar';

const MainLayout = (props): JSX.Element => {
    return (
        <div className="relative">
            <div>
                <ResponsiveNavbar />
                <main>
                    <div>{props.children}</div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

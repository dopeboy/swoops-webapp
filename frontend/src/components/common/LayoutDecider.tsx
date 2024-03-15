import React, { useEffect } from 'react';
import { isUserLoggedIn, getUserDetail } from 'src/lib/utils';
import { useRouter } from 'next/router';
import useHotjar from 'react-use-hotjar';
import classNames from 'classnames';
import { AlphaTestingBanner } from './AlphaTestingBanner';
import { ResponsiveNavbar } from './ResponsiveNavbar';
interface LayoutDeciderProps {
    children?: React.ReactNode;
}

export const LayoutDecider: React.FC<LayoutDeciderProps> = ({ children }): JSX.Element => {
    const { identifyHotjar, readyState } = useHotjar();
    const { pathname } = useRouter();

    const user = getUserDetail();
    useEffect(() => {
        if (readyState && user?.id !== undefined) {
            identifyHotjar(user.id.toString(), {}, console.info);
        }
    }, [readyState, identifyHotjar, user?.id]);

    const routeIsTournaments = () => {
        if (pathname === '/tournaments') {
            return false;
        }
        return pathname.includes('tournament') && !pathname.includes('series');
    };

    return (
        <>
            {/* <AlphaTestingBanner /> */}
            {isUserLoggedIn() ? <ResponsiveNavbar /> : <ResponsiveNavbar isPublic />}
            <main className="dark" role="main">
                <div className={classNames(routeIsTournaments() ? 'bg-black' : 'bg-off-black', `pt-8 z-50`)}>{children}</div>
            </main>
        </>
    );
};

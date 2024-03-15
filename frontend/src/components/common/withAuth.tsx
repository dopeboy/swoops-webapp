import { isUserLoggedIn, isUserVerified, getUserDetail } from 'src/lib/utils';
import React, { useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import { loginRoute, waitingRoom } from 'src/lib/routes';
import useHotjar from 'react-use-hotjar';

export default function withAuth(AuthComponent: React.ComponentType<any | string>) {
    const Authenticated = (props) => {
        const { identifyHotjar } = useHotjar();
        const router = useRouter();
        useEffect(() => {
            const redirectUrl = window.location.pathname;
            if (!isUserLoggedIn()) {
                if (!redirectUrl) {
                    Router.push(loginRoute);
                } else {
                    router.push({
                        pathname: loginRoute,
                        query: { redirectUrl },
                    });
                }
            } else {
                const user = getUserDetail();
                identifyHotjar(user.id.toString(), {}, console.info);
                if (!isUserVerified()) {
                    Router.push(waitingRoom);
                }
            }
        }, []);
        return <AuthComponent {...props} />;
    };

    return Authenticated;
}

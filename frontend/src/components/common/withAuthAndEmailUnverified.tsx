import { isUserLoggedIn } from 'src/lib/utils';
import React, { useEffect } from 'react';
import Router from 'next/router';
import { loginRoute } from 'src/lib/routes';

export default function withAuthAndEmailUnverified(NextComponent: React.ComponentType<any | string>) {
    const Verified = (props) => {
        useEffect(() => {
            if (!isUserLoggedIn()) {
                Router.push(loginRoute);
            }
        }, []);
        return <NextComponent {...props} />;
    };

    return Verified;
}

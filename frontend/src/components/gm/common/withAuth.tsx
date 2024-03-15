import { isUserLoggedIn } from 'src/lib/utils';
import React, { Component, ReactElement, useEffect } from 'react';
import Router from 'next/router';

export default function withAuth(AuthComponent: React.ComponentType<any | string>) {
    const Authenticated = (props) => {
        useEffect(() => {
            if (!isUserLoggedIn()) {
                Router.push('/login');
            }
        });
        return <AuthComponent {...props} />;
    };

    return Authenticated;
}

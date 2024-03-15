import { isUserLoggedIn } from 'src/lib/utils';
import React, { Component, ReactElement } from 'react';
import Router from 'next/router';

export default function withoutAuth(InauthComponent: React.ComponentType<any | string>) {
    return class Authenticated extends Component<null, null> {
        componentDidMount(): void {
            if (isUserLoggedIn()) {
                Router.push('/games');
            }
        }

        // If user is not logged in, return original component
        render(): ReactElement {
            return <InauthComponent />;
        }
    };
}

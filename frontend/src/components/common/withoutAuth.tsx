import { getAccessToken, isUserLoggedIn } from 'src/lib/utils';
import React, { Component, ComponentType, ReactElement } from 'react';
import { NextRouter, withRouter } from 'next/router';
import { playerRosterRoute } from '../../lib/routes';
import { gmSubmitLineup } from 'src/lib/gm/utils';
import { toast } from 'react-toastify';
import { trackEvent } from 'src/lib/tracking';
interface WithRouterProps {
    router: NextRouter;
}
interface MyComponentProps extends WithRouterProps {
    InauthComponent: ComponentType<any | string>;
}

class Authenticated extends Component<MyComponentProps> {
    async componentDidMount(): Promise<void> {
        if (isUserLoggedIn()) {
            if (this.props.router.query.redirectUrl === '/gm/pending') {
                try {
                    const lineup = localStorage.getItem('lineupPayload');
                    const lineupPayload = JSON.parse(lineup);
                    if (lineupPayload) {
                        const accessToken = getAccessToken();
                        const submittedLineup = await gmSubmitLineup(accessToken);
                        if (submittedLineup) {
                            trackEvent('GM - Lineup successfully submitted.');
                            this.props.router.push(`/gm/pending/${submittedLineup.uuid}`);
                        } else {
                            toast.error('There was an error submitting your GM Lineup. Please try again later');
                            this.props.router.push('/gm/pending');
                        }
                    }
                    return;
                } catch (error) {
                    console.log(error);
                    toast.error('There was an error submitting your GM Lineup. Please try again later');
                }
            }
            this.props.router.push(playerRosterRoute);
        }
    }

    // If user is not logged in, return original component
    render(): ReactElement {
        return <this.props.InauthComponent />;
    }
}

const withoutAuth = (InauthComponent: React.ComponentType<any | string>) => {
    const HOCWithRouter = withRouter(Authenticated);
    return (props): ReactElement => <HOCWithRouter InauthComponent={InauthComponent} {...props} />;
};

export default withoutAuth;

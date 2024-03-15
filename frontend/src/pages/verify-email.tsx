import { ReactElement, useEffect } from 'react';
import withAuthAndEmailUnverified from 'src/components/common/withAuthAndEmailUnverified';
import AddEmailAddress from 'src/components/onboarding/AddEmailAddress';
import { trackPageLanding } from '../lib/tracking';
import { GeneralPageWrapper } from 'src/components/common/GeneralPageWrapper';
import { GeneralPageHeader } from 'src/components/common/GeneralPageHeader';
import { GeneralPageContent } from 'src/components/common/GeneralPageContent';

const VerifyEmail = (): ReactElement => {
    useEffect(() => {
        trackPageLanding(`Email verification`);
    }, []);

    return (
        <GeneralPageWrapper>
            <GeneralPageHeader title="You're connected" accent="primary" />
            <GeneralPageContent>
                <AddEmailAddress />
            </GeneralPageContent>
        </GeneralPageWrapper>
    );
};

export default withAuthAndEmailUnverified(VerifyEmail);

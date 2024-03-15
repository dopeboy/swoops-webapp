import { ReactElement, useEffect } from 'react';
import withAuthAndEmailUnverified from 'src/components/common/withAuthAndEmailUnverified';
import EmailVerified from 'src/components/onboarding/EmailVerified';
import { trackPageLanding } from '../lib/tracking';
import { GeneralPageWrapper } from 'src/components/common/GeneralPageWrapper';
import { GeneralPageHeader } from 'src/components/common/GeneralPageHeader';
import { GeneralPageContent } from 'src/components/common/GeneralPageContent';

const EmailVerifiedPage = (): ReactElement => {
    useEffect(() => {
        trackPageLanding(`Email verification successful`);
    }, []);

    return (
        <GeneralPageWrapper>
            <GeneralPageHeader title="Your Email has been verified" accent="primary" size="2xl" />
            <GeneralPageContent>
                <EmailVerified />
            </GeneralPageContent>
        </GeneralPageWrapper>
    );
};

export default withAuthAndEmailUnverified(EmailVerifiedPage);

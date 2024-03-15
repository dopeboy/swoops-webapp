import { ReactElement, useEffect } from 'react';
import withoutAuth from 'src/components/common/withoutAuth';
import SignUp from 'src/components/onboarding/SignUp';
import { trackPageLanding } from '../lib/tracking';
import { GeneralPageWrapper } from 'src/components/common/GeneralPageWrapper';
import { GeneralPageHeader } from 'src/components/common/GeneralPageHeader';
import { GeneralPageContent } from 'src/components/common/GeneralPageContent';
import Head from 'next/head';

const Login = (): ReactElement => {
    useEffect(() => {
        trackPageLanding(`Login`);
    }, []);

    return (
        <GeneralPageWrapper>
            <Head>
                <title>Swoops</title>
                <meta name="description" content="GET A FREE SWOOPSTER!" />

                <meta property="og:url" content="https://app.playswoops.com/login" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="GET A FREE SWOOPSTER!" />
                <meta property="og:description" content="Click the link and create an account to earn a free player!" />
                <meta property="og:image" content="https://app.playswoops.com/images/Swoops_F2P_Is_Live.png?43" />
                
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="GET A FREE SWOOPSTER!" />
                <meta name="twitter:description" content="Click the link and create an account to earn a free player!" />
                <meta name="twitter:image" content="https://app.playswoops.com/images/Swoops_F2P_Is_Live.png?43" />
            </Head>
            <GeneralPageHeader title="Start Ball'n with Swoops" accent="secondary" />
            <GeneralPageContent>
                <SignUp />
            </GeneralPageContent>
        </GeneralPageWrapper>
    );
};

export default withoutAuth(Login);

import { ReactElement, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { trackPageLanding, trackEvent } from '../../lib/tracking';
import { User } from 'src/lib/api';
import SignUp from 'src/components/onboarding/SignUp';
import { WalletMintPage } from 'src/components/mint/WalletMintPage';
import { Web3AuthMintPage } from 'src/components/mint/Web3AuthMintPage';
import { GeneralPageHeader } from 'src/components/common/GeneralPageHeader';
import { GeneralPageWrapper } from 'src/components/common/GeneralPageWrapper';
import { GeneralPageContent } from 'src/components/common/GeneralPageContent';
import { getUserDetail, logoutUserFromClient } from 'src/lib/utils';
import { LoggedInNotice } from 'src/components/mint/LoggedInNotice';

const Mint = (): ReactElement => {
    const [userInfo, setUserInfo] = useState<{ user: User; address: string; isWeb3AuthUser: boolean }>();
    const isSignedIn: boolean = useMemo(
        (): boolean => (userInfo && !!userInfo?.address) || (getUserDetail() && !!getUserDetail()?.address),
        [userInfo, getUserDetail()]
    );
    const isSignedInWithWeb3Auth: boolean = useMemo(
        (): boolean =>
            (userInfo && userInfo?.isWeb3AuthUser && !!userInfo?.address) ||
            (getUserDetail() && getUserDetail().is_web3_auth_user && !!getUserDetail()?.address),
        [userInfo, getUserDetail()]
    );
    const isSignedInWithWallet: boolean = useMemo(
        (): boolean =>
            (userInfo && !userInfo?.isWeb3AuthUser && !!userInfo?.address) ||
            (getUserDetail() && !getUserDetail().is_web3_auth_user && !!getUserDetail()?.address),
        [userInfo, getUserDetail()]
    );

    useEffect(() => {
        if (userInfo) {
            trackEvent('User connected for Mint', { email: userInfo.user.email, address: userInfo.address });
        }
    }, [userInfo]);

    useEffect(() => {
        if (getUserDetail() && getUserDetail().address && !getUserDetail().email) {
            logoutUserFromClient();
        }
        trackPageLanding(`Mint`);
    }, []);

    return (
        <GeneralPageWrapper>
            <Head>
                <meta name="description" content="FANTASY SPORTS. REAL OWNERSHIP" />
                <meta property="og:url" content="https://app.playswoops.com/mint" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="FANTASY SPORTS. REAL OWNERSHIP" />
                <meta property="og:description" content="FANTASY SPORTS. REAL OWNERSHIP" />
                <meta property="og:image" content="https://www.playswoops.com/images/ssn1_just_minted.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta property="twitter:domain" content="playswoops.com" />
                <meta property="twitter:url" content="https://www.playswoops.com/mint" />
                <meta name="twitter:title" content="FANTASY SPORTS. REAL OWNERSHIP" />
                <meta name="twitter:description" content="FANTASY SPORTS. REAL OWNERSHIP" />
                <meta name="twitter:image" content="https://www.playswoops.com/images/ssn1_just_minted.png" />
                <meta content="width=device-width, initial-scale=1" name="viewport" />
                <meta content="Webflow" name="generator" />
            </Head>
            <div className="pb-12 pt-4 px-2 lg:p-24 flex flex-col items-center justify-center">
                {(isSignedInWithWallet || isSignedInWithWeb3Auth) && (
                    <span className="w-full lg:w-fit flex flex-col items-center justify-center">
                        <LoggedInNotice
                            isWeb3AuthUser={isSignedInWithWeb3Auth}
                            userEmail={getUserDetail()?.email}
                            userAddress={getUserDetail()?.address}
                        />
                    </span>
                )}
                <GeneralPageHeader title="SSN2 MINT" accent="secondary" noMargin={isSignedIn} />
                <GeneralPageContent maxWidth="3xl">
                    <div>
                        {!isSignedIn && (
                            <SignUp
                                redirect={false}
                                onSuccess={(userInfo) => {
                                    setUserInfo(userInfo);
                                }}
                            />
                        )}
                    </div>
                    {isSignedInWithWeb3Auth && <Web3AuthMintPage userEmail={getUserDetail()?.email} userAddress={getUserDetail()?.address} />}
                    {isSignedInWithWallet && <WalletMintPage userEmail={getUserDetail()?.email} userAddress={getUserDetail()?.address} />}
                </GeneralPageContent>
            </div>
        </GeneralPageWrapper>
    );
};

export default Mint;

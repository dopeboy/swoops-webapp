import { ReactElement, useEffect, useState } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { AccountsService, User, ApiService } from 'src/lib/api';
import { useRouter } from 'next/router';
import {
    getOperatingSystem,
    hasValidAccessToken,
    logoutUserFromClient,
    setAccessToken,
    setRefreshToken,
    setUserDetail,
    setWalletAddress,
} from 'src/lib/utils';
import { LoginButton } from './LoginButton';
import { playerRosterRoute } from 'src/lib/routes';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { useTorus } from 'src/contexts/Torus.context';
import { useWeb3 } from 'src/contexts/Web3.context';
import { TorusLoginButton } from './TorusLoginButton';
import _ from 'lodash';
import { gmSubmitLineup } from 'src/lib/gm/utils';

const NONCE_MESSAGE = 'Hey, just one more step! We need you to confirm you wanna sign in by clicking the Sign button down below.\n\n Request nonce:';

const SignUp: React.FC<{
    redirect?: boolean;
    onSuccess?: (userInfo: { user: User; address: string; isWeb3AuthUser: boolean }) => void;
}> = ({ redirect = true, onSuccess }): ReactElement => {
    const { torus } = useTorus();
    const { getSignerAddress, signMessage: signTorusMessage } = useWeb3();
    const account = useAccount();
    const signMessage = useSignMessage();
    const { disconnect } = useDisconnect();
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [isMetamaskBrowser, setIsMetamaskBrowser] = useState(false);
    const [loadingRedirect, setLoadingRedirect] = useState(false);
    const [loadingTorusLogin, setLoadingTorusLogin] = useState(false);
    const [error, setError] = useState<{ code: number }>();
    const router = useRouter();
    const { lockerRoom, redirectUrl, tournamentId, referrer_code } = router.query;

    const loginWithTorus = async (): Promise<void> => {
        try {
            setLoadingTorusLogin(true);
            disconnect();
            if (torus?.isLoggedIn) {
                await torus.logout();
            }
            await torus?.login();
            const userInfo = await torus.getUserInfo('');
            const address = await getSignerAddress();
            if (!hasValidAccessToken()) {
                logoutUserFromClient();
            }

            const { nonce } = await AccountsService.accountsNonceCreate({ wallet_address: address });
            const signedNonce = await signTorusMessage(NONCE_MESSAGE + ' ' + nonce);
            const accessTokens = await AccountsService.accountsNonceVerifyCreate({
                wallet_address: address,
                signed_message: signedNonce,
                email: userInfo.email,
            });
            setWalletAddress(address);
            setAccessToken(accessTokens.access);
            setRefreshToken(accessTokens.refresh);
            const user = await AccountsService.accountsRead(accessTokens.id);
            setUserDetail({ ...user, is_web3_auth_user: true, address });
            if (!redirect) {
                onSuccess && onSuccess({ user, isWeb3AuthUser: true, address });
                return;
            }
            if (user.is_verified) {
                if (referrer_code) {
                    AccountsService.accountsPartialUpdate(user.id.toString(), { signup_referrer_code: referrer_code as string });
                }

                if (redirectUrl) {
                    if (tournamentId) {
                        const { id } = await ApiService.apiGameTournamentReservationCreate(tournamentId.toString());
                        router.push(`/tournament/${tournamentId}?reservationId=${id}&redirectToLineup=true&tournamentF2P=true`);
                        // router.push(redirectUrl as string, { query: { tournamentF2P: true } });
                    } else {
                        if (redirectUrl === '/gm/pending') {
                            const submittedLineup = await gmSubmitLineup(accessTokens.access);
                            if (submittedLineup) {
                                router.push(`gm/pending/${submittedLineup.uuid}`);
                            } else {
                                toast.error('There was an error submitting your GM Lineup. Please try again later');
                            }
                            return;
                        }
                        router.push(redirectUrl as string);
                    }
                    return;
                }

                if (user.tutorial?.completed_at === null) {
                    router.push('/tutorial-v2');
                    return;
                }
                if (lockerRoom) {
                    router.push((redirectUrl as string) || playerRosterRoute);
                    return;
                }
                router.push((redirectUrl as string) || playerRosterRoute);
            } else {
                toast.success("You're in! Verify your email address to start ball'n!");
                router.push('/verify-email');
            }
        } catch (error) {
            console.error(error);
            if (error?.body?.detail?.includes('email')) {
                toast.warn(error.body.detail + ' Please verify the login method you are using.');
            } else {
                toast.warn('There was an error while trying to log you in. Please try again later.');
            }
        } finally {
            setLoadingTorusLogin(false);
        }
    };

    const login = async (): Promise<void> => {
        try {
            setError(undefined);
            setLoadingLogin(true);
            const wallet = account?.address;

            logoutUserFromClient();

            const { nonce } = await AccountsService.accountsNonceCreate({ wallet_address: wallet });
            const signedNonce = await signMessage.signMessageAsync({ message: NONCE_MESSAGE + ' ' + nonce });
            setLoadingRedirect(true);
            const accessTokens = await AccountsService.accountsNonceVerifyCreate({ wallet_address: wallet, signed_message: signedNonce });
            setWalletAddress(wallet);
            setAccessToken(accessTokens.access);
            setRefreshToken(accessTokens.refresh);
            const user = await AccountsService.accountsRead(accessTokens.id);
            setUserDetail({ ...user, is_web3_auth_user: false, address: wallet });
            setLoadingLogin(false);
            if (!redirect) {
                onSuccess && onSuccess({ user, isWeb3AuthUser: false, address: wallet });
                return;
            }
            if (user.is_verified) {
                if (referrer_code) {
                    AccountsService.accountsPartialUpdate(user.id.toString(), { signup_referrer_code: referrer_code as string });
                }

                if (redirectUrl) {
                    if (tournamentId) {
                        const { id } = await ApiService.apiGameTournamentReservationCreate(tournamentId.toString());
                        router.push(`/tournament/${tournamentId}?reservationId=${id}&redirectToLineup=true&tournamentF2P=true`);
                        // router.push(redirectUrl as string, { query: { tournamentF2P: true } });
                    } else {
                        router.push(redirectUrl as string);
                    }
                    return;
                }

                if (user.tutorial?.completed_at === null) {
                    router.push('/tutorial-v2');
                    return;
                }
                if (lockerRoom) {
                    router.push((redirectUrl as string) || playerRosterRoute);
                    return;
                }
                router.push((redirectUrl as string) || playerRosterRoute);
            } else {
                toast.success("You're in! Verify your email address to start ball'n!");
                router.push('/verify-email');
            }
        } catch (error) {
            toast.warn('There was an error while trying to log you in. Please try again later.');
            setError(error);
        } finally {
            setLoadingLogin(false);
            setLoadingRedirect(false);
        }
    };

    useEffect(() => {
        if (!account.connector || !account.address) {
            return;
        }
        login();
    }, [account.connector, account.address]);

    useEffect(() => {
        const isBrowser = typeof window !== 'undefined';
        const hasEthereum = isBrowser && _.has(window, 'ethereum');
        const os = getOperatingSystem();
        setIsMetamaskBrowser(isBrowser && hasEthereum && os === 'Android');
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-white mt-2 gap-6 w-full max-w-[350px]">
            {referrer_code === "gm" && "To finish submitting your lineup, sign up below."}
            {!isMetamaskBrowser && <TorusLoginButton login={loginWithTorus} loading={loadingTorusLogin} />}
            {redirectUrl !== '/gm/pending' && (
                <LoginButton account={account} loadingLogin={loadingLogin} loadingRedirect={loadingRedirect} login={login} error={error} />
            )}
        </div>
    );
};

export default SignUp;

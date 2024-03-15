import { AtSymbolIcon } from '@heroicons/react/24/solid';
import { disconnect } from '@wagmi/core';
import { useRouter } from 'next/router';
import { useTorus } from 'src/contexts/Torus.context';
import { AccountsService } from 'src/lib/api';
import { loginRoute } from 'src/lib/routes';
import { logoutUserFromClient } from 'src/lib/utils';
import { MetamaskIcon } from '../common/MetamaskIcon';
import { RoundedButton } from '../common/RoundedButton';
import { Typography } from '../common/Typography';

interface LoggedInNoticeProps {
    userAddress?: string;
    userEmail?: string;
    isWeb3AuthUser?: boolean;
}
export const LoggedInNotice: React.FC<LoggedInNoticeProps> = ({ userAddress, userEmail, isWeb3AuthUser }) => {
    const router = useRouter();
    const { torus } = useTorus();

    const maskAddress = (address: string): string => {
        return `${address?.slice(0, 4)}********${address?.slice(-4)}`;
    };

    const logout = async (e?: any): Promise<void> => {
        if (e) e?.preventDefault();

        try {
            // clears cookie on client side + invalidates on server side
            await AccountsService.accountsLogoutCreate();
            if (torus && torus.isLoggedIn) {
                await torus.logout();
            }
        } catch (error) {
            console.error(error, 'error logging out');
        }
        // clears flag client side
        logoutUserFromClient();
        disconnect();

        // redirect
        router.push(loginRoute);
    };

    return (
        <span className="block lg:top-2 lg:fixed z-10 w-[85%] lg:w-fit lg:right-2 pb-6">
            <span className="flex flex-col items-center justify-start gap-3 bg-white rounded-3xl pt-5 pb-3 lg:py-3 px-5 border-primary border-[3px]">
                <div className="w-full flex flex-col items-start justify-start gap-3">
                    {!!userEmail && (
                        <div className="w-full flex flex-col items-start justify-start gap-2">
                            <Typography transform="capitalize" text="Email" variant="subheading-one" color="black" />
                            <div className="flex flex-row items-center justify-start gap-1.5 w-full">
                                <AtSymbolIcon className="h-6 w-6 text-black" />
                                <Typography text={userEmail} variant="subheading-two" color="black" />
                            </div>
                        </div>
                    )}
                    {!!userAddress && (
                        <div className="w-full flex flex-col items-start justify-start gap-2">
                            <Typography transform="capitalize" text="Wallet address" variant="subheading-one" color="black" />
                            <div className="flex flex-row items-center justify-start gap-1.5">
                                {isWeb3AuthUser ? <img src={'https://tor.us/images/Wallet.svg'} className="h-6 w-6" /> : <MetamaskIcon />}
                                <Typography text={maskAddress(userAddress)} variant="subheading-two" color="black" />
                            </div>
                        </div>
                    )}
                </div>
                {!!userEmail && !!userAddress && <div className="border-b-[2px] border-black w-full max-w-[80px] mt-2"></div>}
                <RoundedButton onClick={() => logout()} text="Leave" borderColor="black" hoverBackgroundColor="black" textColor="black" />
            </span>
        </span>
    );
};

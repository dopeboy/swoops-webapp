/* eslint-disable @typescript-eslint/no-empty-function */
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GetAccountResult } from '@wagmi/core';
import { RoundedButton } from '../common/RoundedButton';
import { ErrorDetail } from './ErrorDetail';
import { LoadingNotice } from './LoadingNotice';
import { NoticeDetail } from './NoticeDetail';
import { WalletConnectionIndicator } from './WalletConnectionIndicator';

interface LoginButtonProps {
    account: GetAccountResult;
    loadingLogin: boolean;
    loadingRedirect: boolean;
    error: { code: number };
    login: () => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ account, error, loadingLogin, loadingRedirect, login }) => {
    return (
        <ConnectButton.Custom>
            {({ chain, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <RoundedButton
                                        onClick={openConnectModal}
                                        text="Sign in using your Wallet"
                                        borderColor="secondary"
                                        maxWidth="xl"
                                        hoverBackgroundColor="secondary"
                                    />
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <div className="flex flex-col items-center justify-center w-full max-w-[300px] gap-2">
                                        <RoundedButton
                                            onClick={openChainModal}
                                            borderColor="error"
                                            hoverBackgroundColor="error"
                                            text="Retry Connection"
                                        />
                                        <ErrorDetail text="Selected Chain is unsupported" />
                                    </div>
                                );
                            }

                            if (account.isConnecting) {
                                return (
                                    <RoundedButton
                                        onClick={() => {}}
                                        borderColor="secondary"
                                        hoverBackgroundColor="secondary"
                                        loading={true}
                                        text=""
                                    />
                                );
                            }

                            return (
                                <>
                                    {account.isConnected && (
                                        <>
                                            <div className="flex flex-col items-center mt-2.5">
                                                <WalletConnectionIndicator />
                                                {error && error.code === 4001 ? (
                                                    <div className="flex flex-col items-center gap-3 mt-3">
                                                        <RoundedButton
                                                            onClick={login}
                                                            borderColor="error"
                                                            hoverBackgroundColor="error"
                                                            text="Retry Sign In"
                                                        />
                                                        <ErrorDetail text="Signing has been cancelled. Please try again." />
                                                    </div>
                                                ) : (
                                                    <>
                                                        {loadingRedirect && !loadingLogin ? (
                                                            <LoadingNotice text="Redirecting you..." />
                                                        ) : (
                                                            <>
                                                                {loadingLogin ? (
                                                                    <LoadingNotice text="Please press sign on your Wallet to be Signed In..." />
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-3 mt-2.5">
                                                                        <NoticeDetail text="If you're not redirected automatically, press this button to start Ball'n!" />
                                                                        <RoundedButton
                                                                            onClick={login}
                                                                            borderColor="secondary"
                                                                            hoverBackgroundColor="secondary"
                                                                            text="Head to Swoops!"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};

import { useEffect, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import intersection from 'lodash/intersection';
import useMetaMask from '../../lib/mint/useMetaMask';
import MintStats from './MintStats';
import MintMessage from './MintMessage';
import Button from './Button';
import MINT_STATES from '../../lib/MINT_STATES';
import { trackPageLanding } from '../../lib/tracking';
import { AmountPicker } from './AmountPicker';
import { RoundedButton } from '../common/RoundedButton';
import { ConsentCheckbox } from './ConsentCheckbox';
import { MintWithCrossmintButton } from './MintWithCrossmintButton';
import { MintPageTemplate } from './MintPageTemplate';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Typography } from '../common/Typography';

const {
    CONNECTED,
    CONNECTING,
    CONNECT_ERROR,
    ERROR_CONNECTING_TO_CONTRACT,
    INSUFFICIENT_FUNDS,
    NOT_IN_ALLOWLIST,
    MINTING,
    MINT_ERROR,
    MINT_IN_PROGRESS,
    MINT_SUCCEEDED,
    NOT_ON_CORRECT_NETWORK,
    NO_METAMASK,
    NO_TOKENS_LEFT,
    QUANTITY_EXCEEDS_REMAINING_TOKENS,
} = MINT_STATES;

interface validateProps {
    balance: BigNumber | null;
    connect: () => void;
    connectError: unknown | null;
    errorConnectingToContract: boolean;
    hasMetaMask: boolean;
    isInAllowList: boolean;
    isConnected: boolean;
    isConnecting: boolean;
    isMinting: boolean;
    isOnCorrectNetwork: boolean;
    mintCount: number;
    mintError: unknown | null;
    mintInProgress: boolean;
    price: BigNumber | null;
    mintAmount: number;
    remainingTokens: number;
    userTokens: number;
}
function validate({
    balance,
    connectError,
    errorConnectingToContract,
    hasMetaMask,
    isConnected,
    isConnecting,
    isMinting,
    isOnCorrectNetwork,
    mintCount,
    mintError,
    mintInProgress,
    price,
    mintAmount,
    remainingTokens,
}: validateProps): Set<MINT_STATES> {
    const states = new Set<MINT_STATES>();

    if (!hasMetaMask) {
        states.add(NO_METAMASK);
    }
    if (!isOnCorrectNetwork) {
        states.add(NOT_ON_CORRECT_NETWORK);
    }
    if (errorConnectingToContract) {
        states.add(ERROR_CONNECTING_TO_CONTRACT);
    }
    if (isConnected) {
        states.add(CONNECTED);
    }
    if (isConnecting) {
        states.add(CONNECTING);
    }
    if (connectError !== null) {
        states.add(CONNECT_ERROR);
    }
    if (isMinting) {
        states.add(MINTING);
    }
    if (mintInProgress) {
        states.add(MINT_IN_PROGRESS);
    }
    if (remainingTokens <= 0) {
        states.add(NO_TOKENS_LEFT);
    }
    if (remainingTokens < mintAmount) {
        states.add(QUANTITY_EXCEEDS_REMAINING_TOKENS);
    }
    if (balance && price) {
        const cost = price.mul(mintAmount);
        if (balance.lt(cost)) {
            states.add(INSUFFICIENT_FUNDS);
        }
    }
    if (mintError) {
        states.add(MINT_ERROR);
    }
    if (mintCount > 0) {
        states.add(MINT_SUCCEEDED);
    }

    return states;
}

const disableConnectStates = new Set([CONNECTING, CONNECTED, MINT_SUCCEEDED, NOT_ON_CORRECT_NETWORK, NO_METAMASK]);
const disableMintStates = new Set([
    ERROR_CONNECTING_TO_CONTRACT,
    INSUFFICIENT_FUNDS,
    MINTING,
    NOT_IN_ALLOWLIST,
    MINT_SUCCEEDED,
    NOT_ON_CORRECT_NETWORK,
    NO_METAMASK,
    NO_TOKENS_LEFT,
    QUANTITY_EXCEEDS_REMAINING_TOKENS,
]);
interface WalletMintPageProps {
    userAddress: string;
    userEmail: string;
}
export const WalletMintPage: React.FC<WalletMintPageProps> = ({ userAddress }) => {
    const [connectError, setConnectError] = useState<unknown | null>(null);
    const [mintError, setMintError] = useState<unknown | null>(null);
    const [mintCount, setMintCount] = useState(0);
    const [mintAmount, setMintAmount] = useState(1);
    const [maxMintAmount] = useState(1000);
    const [consent, setConsent] = useState(true);
    const metaMaskData = useMetaMask();
    const states = validate({
        ...metaMaskData,
        mintAmount,
        connectError,
        mintError,
        mintCount,
    });
    const disableConnect = intersection(Array.from(states), Array.from(disableConnectStates)).length > 0;
    const disableMint = intersection(Array.from(states), Array.from(disableMintStates)).length > 0;
    const disableCondition = useMemo((): boolean => {
        return metaMaskData.remainingTokens <= 0 || maxMintAmount <= 0;
    }, [maxMintAmount, metaMaskData?.remainingTokens]);

    const onConnect = async (): Promise<void> => {
        try {
            setConnectError(null);
            await metaMaskData.connect();
        } catch (e) {
            setConnectError(e);
        }
    };

    const onMint = async (): Promise<void> => {
        try {
            setMintError(null);
            setMintCount(0);
            await metaMaskData.mintWithQuota(mintAmount);
            setMintCount(mintAmount);
        } catch (e) {
            setMintError(e);
        }
    };

    useEffect(() => {
        trackPageLanding('Mint');
    }, []);

    return (
        <MintPageTemplate showShareImage={!metaMaskData.loadingContracts && metaMaskData.remainingTokens > 0}>
            <div className="w-full flex flex-col items-center justify-center space-y-4">
                {!metaMaskData.loadingContracts && metaMaskData.remainingTokens > 0 && (
                    <>
                        {metaMaskData.isConnected && <MintStats {...metaMaskData} currentSupply={650} season={2} />}
                        <MintMessage {...metaMaskData} states={states} mintCount={mintCount} />
                        {!userAddress && !metaMaskData.isConnected && (
                            <Button onClick={onConnect} disabled={disableConnect}>
                                Connect with Crypto Wallet
                            </Button>
                        )}
                        {metaMaskData.isConnected && (
                            <div className="gap-3 flex flex-col items-center justify-center w-full max-w-sm">
                                <RoundedButton
                                    text="Buy with Metamask"
                                    onClick={onMint}
                                    disabled={disableMint}
                                    borderColor="secondary"
                                    hoverBackgroundColor="secondary"
                                />
                            </div>
                        )}
                        {!userAddress && metaMaskData.isConnected && (
                            <div className="my-2 text-center sm:text-left">{"Select the amount of Swoopsters you'd like to mint"}</div>
                        )}
                        {userAddress && (
                            <div className="flex flex-col gap-4 items-center justify-center">
                                <MintWithCrossmintButton
                                    consent={consent}
                                    disabled={disableCondition}
                                    environment="production"
                                    mintAmount={mintAmount}
                                    userAddress={userAddress}
                                />
                                <AmountPicker
                                    mintAmount={mintAmount}
                                    maxMintAmount={maxMintAmount}
                                    setMintAmount={setMintAmount}
                                    disabled={disableCondition}
                                />
                            </div>
                        )}
                        {userAddress && <ConsentCheckbox consent={consent} setConsent={setConsent} />}
                    </>
                )}
                {metaMaskData.loadingContracts && (
                    <div className="w-full flex flex-row items-center justify-center gap-2 p-6">
                        <LoadingSpinner bgColor="transparent" fill="#f5f5f5" className="h-6 w-6" />
                        <Typography text="Loading drop info" variant="subheading-one" />
                    </div>
                )}
                {!metaMaskData.loadingContracts && metaMaskData.remainingTokens <= 0 && (
                    <div className="w-full flex flex-col items-center justify-center gap-2 p-6">
                        <Typography text="We've sold out!" variant="h3" />
                        <Typography text="Thanks to everyone that grabbed a Swoopster in this drop." variant="h5" />
                        <Typography text="See you next season!" variant="h5" />
                    </div>
                )}
            </div>
        </MintPageTemplate>
    );
};

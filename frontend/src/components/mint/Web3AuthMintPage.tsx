import { useMemo, useEffect, useState } from 'react';
import { trackPageLanding } from '../../lib/tracking';
import { AmountPicker } from './AmountPicker';
import { useTorus } from 'src/contexts/Torus.context';
import { useWeb3 } from 'src/contexts/Web3.context';
import SwoopsERC721ContractAbi from '../../lib/mint/useMetaMask/SwoopsERC721.abi.json';
import SwoopsMintContractAbi from '../../lib/mint/useMetaMask/SwoopsMint.abi.json';
import MintStats from './MintStats';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Typography } from '../common/Typography';
import { ConsentCheckbox } from './ConsentCheckbox';
import { MintWithCrossmintButton } from './MintWithCrossmintButton';
import { SwoopsERC721_CONTRACT_ADDRESS, SwoopsMint_CONTRACT_ADDRESS } from 'src/lib/mint/mintUtils';
import { MintPageTemplate } from './MintPageTemplate';
import { BigNumber } from 'ethers';

interface Web3AuthMintPageProps {
    userAddress: string;
    userEmail: string;
}
export const Web3AuthMintPage: React.FC<Web3AuthMintPageProps> = ({ userAddress }) => {
    const { torus } = useTorus();
    const { web3 } = useWeb3();
    const [loadingContracts, setLoadingContracts] = useState(true);
    const [mintAmount, setMintAmount] = useState(1);
    const [maxMintAmount] = useState(1000);
    const [consent, setConsent] = useState(true);
    const [totalTokens, setTotalTokens] = useState(0);
    const [remainingTokens, setRemainingTokens] = useState(0);
    const [price, setPrice] = useState<BigNumber | null>(null);

    const disableCondition = useMemo((): boolean => {
        return loadingContracts || remainingTokens <= 0 || maxMintAmount <= 0;
    }, [loadingContracts, remainingTokens, maxMintAmount]);

    const testWeb3ContractConnection = async (): Promise<void> => {
        setLoadingContracts(true);
        if (!torus || !torus.provider || !web3 || !web3.provider) {
            setTotalTokens(0);
            setRemainingTokens(0);
            setPrice(null);
            return;
        }

        try {
            const contract = new web3.eth.Contract(SwoopsMintContractAbi, SwoopsMint_CONTRACT_ADDRESS);
            let totalTokens;
            try {
                totalTokens = await contract.methods.maxTokenSupply().call();
            } catch (error) {
                console.error('Error getting total tokens: ' + error.message);
            }
            setTotalTokens(Number(totalTokens || 0));

            const erc721contract = new web3.eth.Contract(SwoopsERC721ContractAbi, SwoopsERC721_CONTRACT_ADDRESS, {
                from: userAddress,
            });
            const totalSupply = await erc721contract.methods.totalSupply().call();
            setRemainingTokens(Number(totalTokens || 0) - Number(totalSupply || 0));

            let price;
            try {
                price = await contract.methods.price().call();
            } catch (error) {
                console.error('Error getting token price: ' + error.message);
            }

            setPrice(price);
            setLoadingContracts(false);
        } catch (e) {
            console.error('Error occurred on web3', e);
            setTotalTokens(0);
            setRemainingTokens(0);
            setPrice(null);
            setLoadingContracts(false);
        }
    };

    useEffect(() => {
        testWeb3ContractConnection();
    }, [torus, web3]);

    useEffect(() => {
        trackPageLanding('Mint');
    }, []);

    return (
        <MintPageTemplate
            showShareImage={!loadingContracts && remainingTokens > 0 && !!userAddress}
            showSoldout={!loadingContracts && remainingTokens <= 0}
        >
            <div className="w-full flex flex-col items-center justify-center space-y-4">
                {!loadingContracts && remainingTokens > 0 && (
                    <MintStats
                        isWeb3Auth
                        hasMetaMask={false}
                        price={price}
                        remainingTokens={remainingTokens}
                        totalTokens={totalTokens}
                        currentSupply={650}
                        season={2}
                    />
                )}
                {loadingContracts && (
                    <div className="w-full flex flex-row items-center justify-center gap-2 p-6">
                        <LoadingSpinner bgColor="transparent" fill="#f5f5f5" className="h-6 w-6" />
                        <Typography text="Loading drop info" variant="subheading-one" />
                    </div>
                )}
                {!loadingContracts && remainingTokens > 0 && userAddress && (
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
                {!loadingContracts && remainingTokens > 0 && userAddress && <ConsentCheckbox consent={consent} setConsent={setConsent} />}
                {!loadingContracts && remainingTokens <= 0 && (
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

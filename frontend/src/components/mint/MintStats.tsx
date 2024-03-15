import { FC } from 'react';
import { BigNumber, utils } from 'ethers';
import { Typography } from '../common/Typography';

interface MintStatsProps {
    hasMetaMask: boolean;
    isWeb3Auth?: boolean;
    price: BigNumber | null;
    remainingTokens: number;
    totalTokens: number;
    currentSupply: number;
    season: number;
    maxTokensPerWallet?: number;
}

const MintStats: FC<MintStatsProps> = ({
    hasMetaMask,
    isWeb3Auth,
    price,
    remainingTokens,
    currentSupply,
    totalTokens,
    season,
    maxTokensPerWallet,
}): JSX.Element => {
    return (
        <div>
            {(hasMetaMask || isWeb3Auth) && price !== undefined && totalTokens > 0 && (
                <div className="w-full space-y-2">
                    <Typography text={`${remainingTokens} Swoopsters Remaining`} variant="h4" hasDot />
                    <Typography text={`${currentSupply} SSN${season} Supply`} variant="h5" />
                    <Typography text={`Price: ${utils.formatEther(price)} ETH`} variant="h5" />
                    {maxTokensPerWallet && <Typography text={`Max per wallet: ${maxTokensPerWallet} per day`} variant="h5" />}
                </div>
            )}
        </div>
    );
};

export default MintStats;

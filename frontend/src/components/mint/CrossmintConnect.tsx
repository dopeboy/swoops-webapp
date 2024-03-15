import { useState } from 'react';

import { BlockchainTypes, CrossmintEnvironment, CrossmintEVMWalletAdapter } from '@crossmint/connect';
import { RoundedButton } from '../common/RoundedButton';

interface CrossmintConnectProps {
    onConnect: (address: string) => void;
    onDisconnect: () => void;
}

const CrossmintConnect: React.FC<CrossmintConnectProps> = ({ onConnect }) => {
    const [address, setAddress] = useState<string | undefined>(undefined);

    async function connectToCrossmint() {
        // Initialize the Crossmint embed.
        const _crossmintEmbed = new CrossmintEVMWalletAdapter({
            apiKey: process.env.CROSSMINT_API_KEY as string,
            chain: BlockchainTypes.ETHEREUM, // BlockchainTypes.ETHEREUM || BlockchainTypes.POLYGON. For solana use BlockchainTypes.SOLANA
            environment: CrossmintEnvironment.PROD,
        });

        // Ask the user to sign in and give access to their publicKey
        const address = await _crossmintEmbed.connect();

        // If the user successfully connects to Crossmint, the address will be returned.
        if (address) {
            onConnect(address);
            setAddress(address);
        }
    }

    // async function disconnect() {
    //     // Initialize the Crossmint embed.
    //     const _crossmintEmbed = new CrossmintEVMWalletAdapter({
    //         apiKey: process.env.CROSSMINT_API_KEY as string,
    //         chain: BlockchainTypes.ETHEREUM, // BlockchainTypes.ETHEREUM || BlockchainTypes.POLYGON. For solana use BlockchainTypes.SOLANA
    //         environment: CrossmintEnvironment.PROD,
    //     });

    //     // Ask the user to sign in and give access to their publicKey
    //     await _crossmintEmbed.disconnect();

    //     // If the user successfully connects to Crossmint, the address will be returned.
    //     setAddress(undefined);
    //     onDisconnect();
    // }

    return (
        <div>
            {!address && (
                <RoundedButton
                    onClick={connectToCrossmint}
                    text="Buy with Credit Card"
                    borderColor="primary"
                    maxWidth="xl"
                    hoverBackgroundColor="primary"
                />
            )}
            {/* {address && (
        <Button disabled={false} onClick={disconnect} className="bg-white">
          {'Disconnect'}
        </Button>
      )} */}
        </div>
    );
};

export default CrossmintConnect;

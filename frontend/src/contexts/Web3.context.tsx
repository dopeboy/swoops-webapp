/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import { useTorus } from './Torus.context';

export interface Web3Context {
    web3: Web3 | null;
    setWeb3: (web3: Web3) => void;
    getSignerAddress: () => Promise<string>;
    signMessage: (message: string) => Promise<string>;
}

export const Web3Context = createContext<Web3Context>({
    web3: null,
    setWeb3: () => {},
    getSignerAddress: async () => '',
    signMessage: async () => '',
});

export const useWeb3 = (): Web3Context => useContext(Web3Context);

export const Web3Provider: React.FC = ({ children }) => {
    const { torus } = useTorus();
    const [web3, setWeb3] = useState<Web3 | null>(null);

    const signMessage = async (message: string): Promise<string | undefined> => {
        if (web3) {
            const signer = await getSignerAddress();
            const signedNonce = await web3.eth.personal.sign(message, signer, '');
            return signedNonce;
        }
    };

    const getSignerAddress = async (): Promise<string | undefined> => {
        if (web3) {
            const accounts = await web3.eth.getAccounts();
            const address = accounts[0];
            return address;
        }
    };

    const initializeWeb3 = async (): Promise<void> => {
        if (torus && torus.provider) {
            const web3Instance = new Web3(torus.provider);
            setWeb3(web3Instance);
        }
    };

    useEffect(() => {
        initializeWeb3();
    }, [torus]);

    return <Web3Context.Provider value={{ web3, setWeb3, getSignerAddress, signMessage }}>{children}</Web3Context.Provider>;
};

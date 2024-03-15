import { BigNumber, Contract, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import SwoopsERC721ContractAbi from './SwoopsERC721.abi.json';
import SwoopsMintContractAbi from './SwoopsMint.abi.json';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { addresses } from './whitelistedAddresses';
import { SwoopsERC721_CONTRACT_ADDRESS, SwoopsMint_CONTRACT_ADDRESS } from '../mintUtils';
import { Ethereum } from '@wagmi/core';

// Let TypeScript know about the ethereum property MetaMask adds to the Window object so we can access it without a warning / error
declare global {
    interface Window {
        ethereum?: Ethereum;
    }
}

const lowerCaseAddresses = addresses.map((a) => a.toLowerCase());

// Setting Sentry context so this information is included in any error logs
Sentry.setContext('contracts', {
    SwoopsERC721: SwoopsERC721_CONTRACT_ADDRESS,
    SwoopsMint: SwoopsMint_CONTRACT_ADDRESS,
});

Sentry.setContext('allowlist', {
    addresses,
});

// TODO - Move this code elsewhere and avoid redundantly recalculating tree on each function call
function generateMerkleProof(address: string) {
    const leaves = addresses.map((addr) => keccak256(addr));
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    return merkleTree.getHexProof(keccak256(address));
}

const CHAIN_ID = {
    MAINNET: 1,
    RINKEBY: 4,
    GOERLI: 5,
    LOCAL: 1337,
};

function useMetaMask() {
    // TODO - Good candidate for useReducer
    const [hasMetaMask, setHasMetaMask] = useState(false);
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<BigNumber | null>(null);
    const [totalTokens, setTotalTokens] = useState(0);
    const [remainingTokens, setRemainingTokens] = useState(0);
    const [userTokens, setUserTokens] = useState(0);
    const [price, setPrice] = useState<BigNumber | null>(null);
    const [contract, setContract] = useState<Contract | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [mintInProgress, setMintInProgress] = useState(false);
    const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState(false);
    const [errorConnectingToContract, setErrorConnectingToContract] = useState(false);
    const [isInAllowList, setIsInAllowList] = useState(false);
    const [loadingContracts, setLoadingContracts] = useState(true);

    // Setting Sentry user and context information so they're included in any error logs
    Sentry.setUser({
        walletAddress: address,
    });
    Sentry.setContext('provider', provider);

    // Wrapping this check in a useEffect ensures it only runs client-side and helps avoid an issue with rehydration
    useEffect(() => {
        // TODO - Won't come up, but might want to handle case where user disables MetaMask mid-session. Could add a mutation observer to window.ethereum.
        if (typeof window !== 'undefined' && window.ethereum && !hasMetaMask) {
            setHasMetaMask(true);
        }
    }, [hasMetaMask]);

    // Set provider once MetaMask is detected
    useEffect(() => {
        (async function () {
            if (!hasMetaMask) {
                setProvider(null);
                setIsOnCorrectNetwork(false);
                return;
            }

            // A provider represents a connection to the Ethereum network (https://docs.ethers.io/v5/api/providers/)
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const { chainId } = await provider.getNetwork();
            setProvider(provider);

            // TODO - For now we're always checking for mainnet. We should get this from an environment variable eventually.
            setIsOnCorrectNetwork(chainId === CHAIN_ID.MAINNET);
        })();
    }, [hasMetaMask]);

    // Update user address once provider is set and on the correct network
    useEffect(() => {
        (async function () {
            if (!provider || !isOnCorrectNetwork) {
                // Set dependent state back to its default values. TODO - clean this up w/ useReducer.
                setAddress(null);
                setIsInAllowList(false);
                return;
            }

            // MetaMask returns an array of addresses that will only have 1 address in it (https://docs.metamask.io/guide/getting-started.html#basic-considerations)
            const [address] = await provider.send('eth_accounts', []);
            setAddress(address || null);
        })();
    }, [provider, isOnCorrectNetwork]);

    // Update isInAllowList when address changes
    useEffect(() => {
        setIsInAllowList(typeof address === 'string' && lowerCaseAddresses.includes(address.toLowerCase()));
    }, [address]);

    // Update contract data once user is confirmed to be on the allow list
    useEffect(() => {
        (async function () {
            setLoadingContracts(true);
            setErrorConnectingToContract(false);

            if (!provider || !isOnCorrectNetwork) {
                // Set dependent state back to its default values. TODO - clean this up w/ useReducer.
                setTotalTokens(0);
                setRemainingTokens(0);
                setPrice(null);
                return;
            }

            try {
                // Get the smart contract and connect to it
                const contract = new ethers.Contract(SwoopsMint_CONTRACT_ADDRESS, SwoopsMintContractAbi, provider);
                const connection = contract.connect(provider);

                // Get token count
                const totalTokens = await connection.maxTokenSupply();
                setTotalTokens(totalTokens.toNumber());

                // Get remaining token count
                const erc721contract = new ethers.Contract(SwoopsERC721_CONTRACT_ADDRESS, SwoopsERC721ContractAbi, provider);
                const [totalSupply] = await erc721contract.functions.totalSupply();
                setRemainingTokens(totalTokens.toNumber() - totalSupply.toNumber());

                // Get the price of a single token in Ethereum
                const price = await connection.price();
                setPrice(price);
                setLoadingContracts(false);
            } catch (e) {
                Sentry.captureException(e);
                console.error('Error occurred metamask', e);

                setErrorConnectingToContract(true);

                // Set dependent state back to its default values in case some were set before error
                setTotalTokens(0);
                setRemainingTokens(0);
                setPrice(null);
                setLoadingContracts(false);
            }
        })();
    }, [provider, isOnCorrectNetwork]);

    // Update user data once we have their address and have confirmed it's in the allowlist
    useEffect(() => {
        (async function () {
            try {
                if (!address || !isInAllowList) {
                    // Set dependent state back to its default values. TODO - clean this up w/ useReducer.
                    setBalance(null);
                    setContract(null);
                    setUserTokens(0);
                }

                if (!provider || !address) {
                    return;
                }

                // Get the user's Ethereum balance
                const balance = await provider.getBalance(address);
                setBalance(balance);

                // Get signer. A signer represents an Ethereum account (https://docs.ethers.io/v5/api/signer/).
                const signer = provider.getSigner();

                // Get the smart contract and connect to it
                const contract = new ethers.Contract(SwoopsMint_CONTRACT_ADDRESS, SwoopsMintContractAbi, signer);

                // TODO - Can we get rid of this? At least the connection variable?
                const connection = contract.connect(signer);
                setContract(contract);

                // Get user's token count
                const erc721contract = new ethers.Contract(SwoopsERC721_CONTRACT_ADDRESS, SwoopsERC721ContractAbi, signer);
                const userTokens = await erc721contract.balanceOf(address);

                setUserTokens(userTokens.toNumber());
            } catch (e) {
                Sentry.captureException(e);
                console.error('Error occurred', e);
            }
        })();
    }, [provider, address, isInAllowList]);

    // TODO - Convert to arrow functions
    async function connect() {
        try {
            if (provider === null || isConnecting) {
                return;
            }
            setIsConnecting(true);
            const [address] = await provider.send('eth_requestAccounts', []);
            setAddress(address || null);
        } catch (e) {
            Sentry.captureException(e);
            console.error('Error occurred while connecting', e);
            throw e; // Rethrowing so caller can address error
        } finally {
            setIsConnecting(false);
        }
    }

    async function mint(quantity: number) {
        try {
            if (address === null || contract === null || price === null || isMinting) {
                return;
            }

            setIsMinting(true);

            const result = await contract.mint(quantity, {
                value: price.mul(quantity),
            });

            setMintInProgress(true);

            const response = await result.wait();

            // Resetting provider gets updated info like user's balance
            const newProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(newProvider);

            return response;
        } catch (e) {
            Sentry.captureException(e);
            console.error('Error occurred while minting', e);
            throw e; // Rethrowing so caller can address error
        } finally {
            setIsMinting(false);
            setMintInProgress(false);
        }
    }
    async function whitelistedMint(quantity: number) {
        try {
            if (address === null || contract === null || price === null || isMinting) {
                return;
            }

            setIsMinting(true);

            const merkleProof = generateMerkleProof(address);
            const result = await contract.whitelistedMint(quantity, merkleProof, {
                value: price.mul(quantity),
            });

            setMintInProgress(true);

            const response = await result.wait();

            // Resetting provider gets updated info like user's balance
            const newProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(newProvider);

            return response;
        } catch (e) {
            Sentry.captureException(e);
            console.error('Error occurred while minting', e);
            throw e; // Rethrowing so caller can address error
        } finally {
            setIsMinting(false);
            setMintInProgress(false);
        }
    }

    async function mintWithQuota(quantity: number) {
        try {
            if (address === null || contract === null || price === null || isMinting) {
                return;
            }

            setIsMinting(true);

            const result = await contract.mintWithQuota(quantity, address, {
                value: price.mul(quantity),
            });

            setMintInProgress(true);

            const response = await result.wait();

            // Resetting provider gets updated info like user's balance
            const newProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(newProvider);

            return response;
        } catch (e) {
            Sentry.captureException(e);
            console.error('Error occurred while minting', e);
            throw e; // Rethrowing so caller can address error
        } finally {
            setIsMinting(false);
            setMintInProgress(false);
        }
    }

    return {
        errorConnectingToContract,
        hasMetaMask,
        isOnCorrectNetwork,
        isConnected: !!address,
        isConnecting,
        connect,
        loadingContracts,
        isMinting,
        isInAllowList,
        whitelistedMint,
        mintWithQuota,
        mintInProgress,
        address,
        balance,
        totalTokens,
        remainingTokens,
        userTokens,
        price,
    };
}

export default useMetaMask;

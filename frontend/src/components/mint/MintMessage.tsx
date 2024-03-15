import { FC } from 'react';
import MINT_STATES from '../../lib/MINT_STATES';
import { Typography } from '../common/Typography';

interface MintMessageProps {
    mintCount: number;
    remainingTokens: number;
    states: Set<MINT_STATES>;
    userTokens: number;
}

const MintMessage: FC<MintMessageProps> = ({ mintCount, remainingTokens, states }): JSX.Element => {
    const {
        CONNECTING,
        CONNECT_ERROR,
        ERROR_CONNECTING_TO_CONTRACT,
        INSUFFICIENT_FUNDS,
        MINT_ERROR,
        MINT_IN_PROGRESS,
        MINT_SUCCEEDED,
        NOT_ON_CORRECT_NETWORK,
        NO_METAMASK,
        NO_TOKENS_LEFT,
        QUANTITY_EXCEEDS_REMAINING_TOKENS,
        USER_TOKEN_LIMIT_REACHED,
    } = MINT_STATES;

    let message: JSX.Element | string = '';

    // TODO - Should prioritize message with lower quantity needed to correct. Going to address after adding unit tests.
    if (states.has(MINT_SUCCEEDED)) {
        message = `Congratulations you've minted ${mintCount} ${mintCount > 1 ? 'Swoops NFTs' : 'Swoops NFT'}!`;
    } else if (states.has(NO_METAMASK)) {
        message = (
            <span>
                🦊 Install{' '}
                <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                    MetaMask
                </a>{' '}
                before connecting
            </span>
        );
    } else if (states.has(NOT_ON_CORRECT_NETWORK)) {
        message = 'Switch MetaMask to Mainnet and refresh your browser to mint';
    } else if (states.has(CONNECTING)) {
        message = 'Connecting...';
    } else if (states.has(CONNECT_ERROR)) {
        // NOTE - Currently showing this generic message for all connection errors. May want to indicate the specific error.
        message = 'An error occurred while connecting';
    } else if (states.has(ERROR_CONNECTING_TO_CONTRACT)) {
        message = 'An error occurred while connecting to contract';
    } else if (states.has(MINT_IN_PROGRESS)) {
        message = 'Minting... (may take up to 60 seconds)';
    } else if (states.has(NO_TOKENS_LEFT)) {
        message = 'No tokens left to mint';
    } else if (states.has(USER_TOKEN_LIMIT_REACHED)) {
        message = 'You have minted your limit of tokens';
    } else if (states.has(QUANTITY_EXCEEDS_REMAINING_TOKENS)) {
        if (remainingTokens === 1) {
            message = `There is only 1 remaining token`;
        } else {
            message = `There are only ${remainingTokens} remaining tokens`;
        }
    } else if (states.has(INSUFFICIENT_FUNDS)) {
        message = 'Insufficient funds';
    } else if (states.has(MINT_ERROR)) {
        // NOTE - Currently showing this generic message for all minting errors. May want to indicate the specific error. Might be worth moving this to a toast.
        message = 'An error occurred while minting';
    }

    return <Typography text={message as string} variant="subheading-one" />;
};

export default MintMessage;

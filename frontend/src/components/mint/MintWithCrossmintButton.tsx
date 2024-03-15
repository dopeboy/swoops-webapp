import { CrossmintPayButton } from '@crossmint/client-sdk-react-ui';

interface MintWithCrossmintButtonProps {
    userAddress: string;
    disabled: boolean;
    mintAmount: number;
    consent: boolean;
    price?: number;
    environment?: 'production' | 'staging';
}
export const MintWithCrossmintButton: React.FC<MintWithCrossmintButtonProps> = ({
    environment = 'staging',
    userAddress,
    disabled,
    price = 0.05,
    mintAmount,
    consent,
}) => {
    const clientId = process.env.CROSSMINT_CLIENT_ID as string;
    return (
        <CrossmintPayButton
            clientId={clientId}
            environment={environment}
            mintConfig={{
                type: 'erc-721',
                totalPrice: (Number(price) * mintAmount).toString(),
                quantity: mintAmount,
            }}
            whPassThroughArgs={JSON.stringify({
                consent,
            })}
            mintTo={userAddress}
            disabled={disabled}
            onClick={(e) => {
                if (disabled) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }}
            className="xmint-btn"
        />
    );
};

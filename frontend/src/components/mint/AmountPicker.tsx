import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { RoundedButton } from '../common/RoundedButton';

interface AmountPickerProps {
    mintAmount: number;
    maxMintAmount: number;
    setMintAmount: React.Dispatch<React.SetStateAction<number>>;
    disabled?: boolean;
}

export const AmountPicker: React.FC<AmountPickerProps> = ({ mintAmount, maxMintAmount, setMintAmount, disabled }) => {
    return (
        <div className="flex flex-row items-center justify-between gap-3 bg-transparent rounded-md px-1 py-0.5 w-full max-w-md text-white">
            <RoundedButton
                iconOnly
                borderColor="white"
                hoverBackgroundColor="white"
                disabled={disabled || mintAmount <= 1}
                onClick={() => {
                    if (!disabled && mintAmount > 1) {
                        setMintAmount((amount) => amount - 1);
                    }
                }}
            >
                <MinusIcon className="h-5 w-5" strokeWidth={2.5} />
            </RoundedButton>
            <span
                className={classNames(
                    'text-xl w-full rounded-tl-2xl rounded-br-2xl border-[3px] border-white text-center py-1',
                    disabled ? 'opacity-50' : ''
                )}
            >
                {mintAmount}
            </span>
            <RoundedButton
                iconOnly
                borderColor="white"
                hoverBackgroundColor="white"
                disabled={disabled || mintAmount >= maxMintAmount}
                onClick={() => {
                    if (!disabled && mintAmount < maxMintAmount) {
                        setMintAmount((amount) => amount + 1);
                    }
                }}
            >
                <PlusIcon className="h-5 w-5" strokeWidth={2.5} />
            </RoundedButton>
        </div>
    );
};

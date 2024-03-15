import { FC } from 'react';
import { RoundedButton } from '../common/RoundedButton';

interface MintButton {
    onClick: () => void;
    disabled: boolean;
}

const MintButton: FC<MintButton> = ({ children, onClick, disabled }): JSX.Element => {
    return (
        <RoundedButton onClick={() => onClick()} disabled={disabled}>
            {children}
        </RoundedButton>
    );
};

export default MintButton;

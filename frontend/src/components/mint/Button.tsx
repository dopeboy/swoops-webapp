import classNames from 'classnames';
import { FC, MouseEventHandler } from 'react';

interface ButtonProps {
    disabled: boolean;
    onClick: MouseEventHandler<HTMLButtonElement>;
    className?: string;
}
const Button: FC<ButtonProps> = ({ children, disabled, onClick, className }): JSX.Element => {
    return (
        <button onClick={onClick} disabled={disabled} className={classNames(className)}>
            {children}
        </button>
    );
};

export default Button;

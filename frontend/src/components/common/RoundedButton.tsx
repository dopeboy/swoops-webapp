import classNames from 'classnames';
import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Typography, TypographyColor } from './Typography';

const borderColorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    black: 'border-black',
    white: 'border-white',
    success: 'border-assist-green',
    error: 'border-defeat-red',
};

const maxWidthClasses = {
    xl: 'max-w-[350px]',
    lg: 'max-w-[300px]',
    md: 'max-w-[250px]',
    sm: 'max-w-[200px]',
};

const hoverColorClasses = {
    primary: 'hover:bg-primary hover:text-white',
    secondary: 'hover:bg-secondary hover:text-white',
    white: 'hover:bg-white hover:!text-black',
    black: 'hover:bg-black hover:text-white',
    success: 'hover:bg-assist-green hover:text-black',
    error: 'hover:bg-defeat-red hover:text-white',
};

interface RoundedButtonProps {
    /** Function to be called when the button is clicked */
    onClick: () => void;
    /** Text to be displayed inside the button */
    text?: string;
    /** Handles loading state. Prevents onClick action while loading */
    loading?: boolean;
    /** Marks button as disabled. Prevents onClick action */
    disabled?: boolean;
    /** If true, the button will be made rounded to include only the icon */
    iconOnly?: boolean;
    /** Maximum width of the button, can be 'xl' | 'lg' | 'md' | 'sm'. Defaults to 'md'. */
    maxWidth?: 'xl' | 'lg' | 'md' | 'sm';
    /** Color of the border, can be 'primary' | 'secondary' | 'black' | 'white' | 'success' | 'error' . Defaults to 'primary'. */
    borderColor?: 'primary' | 'secondary' | 'black' | 'white' | 'success' | 'error';
    /** Background color on hover, can be 'primary' | 'secondary' | 'black' | 'white' | 'success' | 'error' . Defaults to 'primary'. */
    hoverBackgroundColor?: 'primary' | 'secondary' | 'black' | 'white' | 'success' | 'error';
    /** Text color of the button, can be 'primary' | 'secondary' | 'black' | 'white'. Defaults to 'white'. */
    textColor?: 'primary' | 'secondary' | 'black' | 'white';
    /** Children to be displayed inside the button. Know that the text won't be displayed if children are present. */
    children?: React.ReactNode;
}
export const RoundedButton: React.FC<RoundedButtonProps> = ({
    text,
    onClick,
    disabled,
    loading,
    iconOnly,
    borderColor = 'primary',
    hoverBackgroundColor = 'primary',
    maxWidth = 'md',
    children,
    textColor = 'white',
}) => {
    const [isHovering, setIsHovering] = useState(false);
    return (
        <button
            onMouseEnter={() => {
                setIsHovering(true);
            }}
            onMouseLeave={() => {
                setIsHovering(false);
            }}
            onClick={() => {
                if (!disabled && !loading) onClick();
            }}
            className={classNames(
                'block transition-all duration-300 uppercase text-body font-[500] border-[3px] cursor-pointer rounded-full bg-transparent',
                `${maxWidthClasses[maxWidth]} ${borderColorClasses[borderColor]} ${hoverColorClasses[hoverBackgroundColor]}`,
                {
                    'opacity-50 cursor-not-allowed': disabled,
                    'w-full min-w-[200px] py-[10px] px-[30px]': !iconOnly,
                    'w-fit py-[10px] px-[10px]': iconOnly,
                }
            )}
        >
            {loading ? (
                <LoadingSpinner bgColor="transparent" fill="#F5F5F5" className="h-6 w-6" />
            ) : (
                <>
                    {children || (
                        <Typography
                            variant="button"
                            text={text}
                            color={isHovering ? (hoverColorClasses[hoverBackgroundColor].split(' ')[1] as TypographyColor) : textColor}
                        />
                    )}
                </>
            )}
        </button>
    );
};

import classNames from 'classnames';

export type TypographyColor = 'primary' | 'secondary' | 'black' | 'gray' | 'white' | 'blue';

const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

const transformClasses = {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
};

const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    black: 'text-black',
    blue: 'text-blue',
    white: 'text-white',
    gray: 'text-white/64',
};

const decorationThicknessClasses = {
    1: `decoration-[1px]`,
    2: `decoration-[2px]`,
    3: `decoration-[3px]`,
    4: `decoration-[4px]`,
};

const decorationColorClasses = {
    primary: `decoration-primary`,
    secondary: `decoration-secondary`,
    black: `decoration-black`,
    blue: `decoration-blue`,
    gray: `decoration-white/64`,
    white: `decoration-white`,
};

interface TypographyProps {
    /** The text that will be displayed */
    text: string;
    /** The variant will decide the style of the text */
    variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body' | 'subheading-one' | 'subheading-two' | 'subheading-three' | 'caption' | 'button';
    /** The color of the text. Defaults to white */
    color?: TypographyColor;
    /** Will decide whether to show an accentuated dot at the end. Defaults to false. */
    hasDot?: boolean;
    /** The color of the dot after the text. If present, it's defaulted to secondary. */
    dotAccentColor?: 'primary' | 'secondary' | 'black' | 'white' | 'blue';
    /** Alignment of the text. Defaults to center. */
    align?: 'left' | 'center' | 'right';
    /** The casing of the text. Defaults to uppercase. */
    transform?: 'uppercase' | 'lowercase' | 'capitalize';
    /** The decoration of the text. Defaults to none. */
    decoration?: 'underline' | 'line-through' | 'none';
    /** The thickness of the text decoration in px. Defaults to 3px. */
    decorationThickness?: 1 | 2 | 3 | 4;
    /** The color of the text decoration. Defaults to primary. */
    decorationColor?: 'primary' | 'secondary' | 'black' | 'gray' | 'white' | 'blue';
    /** Extra CSS classes that will be appended */
    className?: string;
}
export const Typography: React.FC<TypographyProps> = ({
    text,
    align = 'center',
    hasDot = false,
    dotAccentColor = 'secondary',
    transform = 'uppercase',
    variant,
    decoration = 'none',
    decorationColor = 'primary',
    decorationThickness = 3,
    color = 'white',
    className,
}) => {
    return (
        <>
            {variant === 'h1' && (
                <h1
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[60px] font-[900] leading-[1.1] tracking-[.05em] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </h1>
            )}
            {variant === 'h2' && (
                <h2
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[48px] font-[900] leading-[1.1] tracking-[.05em] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </h2>
            )}
            {variant === 'h3' && (
                <h3
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[36px] font-[800] leading-[1.1] tracking-[.05em] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </h3>
            )}
            {variant === 'h4' && (
                <h4
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[24px] font-[800] leading-[1.1] tracking-[.05em] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </h4>
            )}
            {variant === 'h5' && (
                <h5
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[18px] font-[700] leading-[1.1] tracking-[.05em] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </h5>
            )}
            {variant === 'body' && (
                <p
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[16px] font-[500] leading-[1.1] tracking-[.05em] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </p>
            )}
            {variant === 'subheading-one' && (
                <p
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[14px] font-[500] leading-[1.1] tracking-[.05em] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </p>
            )}
            {variant === 'subheading-two' && (
                <p
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[12px] font-[500] leading-[1.1] tracking-[.05em] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </p>
            )}
            {variant === 'subheading-three' && (
                <p
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[10px] font-[500] leading-[1.1] tracking-[.05em] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </p>
            )}
            {variant === 'caption' && (
                <p
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[8px] font-[500] leading-[1.1] tracking-[.05em] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </p>
            )}
            {variant === 'button' && (
                <p
                    className={classNames(
                        `${alignClasses[align]} ${transformClasses[transform]} text-[16px] font-[500] text-body ${colorClasses[color]} ${decoration} ${decorationThicknessClasses[decorationThickness]} ${decorationColorClasses[decorationColor]}`,
                        className || '',
                        {
                            'underline-offset-4': decoration === 'underline',
                        }
                    )}
                >
                    {text}
                    {hasDot && <span className={`${colorClasses[dotAccentColor]}`}>.</span>}
                </p>
            )}
        </>
    );
};

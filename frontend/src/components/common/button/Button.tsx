import React from 'react';
import classNames from 'classnames';
import ButtonLeftSide from './ButtonLeftSide';
import ButtonRightSide from './ButtonRightSide';
import { ButtonProps, ChipPosition, ColorTheme } from './types';
import { trackEvent } from '../../../lib/tracking';
import { LoadingSpinner } from '../LoadingSpinner';

const colorThemes = {
    [ColorTheme.AssistGreen]: 'btn-green',
    [ColorTheme.DefeatRed]: 'btn-red',
    [ColorTheme.Black]: 'btn-black',
    [ColorTheme.White]: 'btn-white',
};

const loadingThemes = {
    [ColorTheme.AssistGreen]: 'btn-green-loading',
    [ColorTheme.DefeatRed]: 'btn-red-loading',
    [ColorTheme.Black]: 'btn-black', // not implemented
    [ColorTheme.White]: 'btn-white-loading',
};

const fillThemes = {
    [ColorTheme.AssistGreen]: 'fill-assist-green',
    [ColorTheme.DefeatRed]: 'fill-defeat-red',
    [ColorTheme.Black]: '',
    [ColorTheme.White]: 'fill-white',
};

const loadingFillThemes = {
    [ColorTheme.AssistGreen]: 'fill-assist-green/32',
    [ColorTheme.DefeatRed]: 'fill-defeat-red/64',
    [ColorTheme.Black]: '',
    [ColorTheme.White]: 'fill-white/64',
};

const fillThemesDisabled = {
    [ColorTheme.AssistGreen]: 'fill-assist-green/32',
    [ColorTheme.DefeatRed]: 'fill-defeat-red/64',
    [ColorTheme.Black]: '',
    [ColorTheme.White]: 'fill-off-black',
};

const chipPositions = {
    [ChipPosition.Left]: 'btn-chip-left',
    [ChipPosition.Right]: 'btn-chip-right',
    [ChipPosition.None]: '',
};

const Button = ({
    colorTheme = ColorTheme.White,
    chipPosition = ChipPosition.None,
    disabled = false,
    onClick,
    isLoading = false,
    children,
    className,
    eventTrackingName,
}: ButtonProps): JSX.Element => {
    const colorClass = isLoading ? loadingThemes[colorTheme] : colorThemes[colorTheme];
    const chipPositionClass = chipPositions[chipPosition];

    if (colorTheme === ColorTheme.Black) {
        throw new Error('This color theme is not implemented for this button.  Revisit in SWP-860');
    }
    const classes = classNames(className, {
        'btn-component': true,
        'btn-loading': isLoading,
        [colorClass]: true,
        disabled,
        [chipPositionClass]: true,
        'max-h-[48px]': true,
    });
    const shouldDisableButtonClick = isLoading || disabled;
    let fillThemeChoice = fillThemes;
    if (isLoading) {
        fillThemeChoice = loadingFillThemes;
    } else if (disabled) {
        fillThemeChoice = fillThemesDisabled;
    }
    const fillThemeClass = fillThemeChoice[colorTheme];
    const chipClasses = classNames(className, {
        [fillThemeClass]: true,
    });

    const onButtonClick = () => {
        if (eventTrackingName) {
            trackEvent(eventTrackingName);
        }
        onClick();
    };

    return (
        <span
            onClick={shouldDisableButtonClick ? () => ({}) : onButtonClick}
            className={classNames('flex align-middle', { 'cursor-pointer': !shouldDisableButtonClick })}
        >
            <ButtonLeftSide colorTheme={colorTheme} chipPosition={chipPosition} className={chipClasses} disabled={disabled}></ButtonLeftSide>
            <button disabled={shouldDisableButtonClick} className={classes}>
                {isLoading && <LoadingSpinner className="w-4 h-4 mr-4" bgColor="transparent" />}
                {children}
            </button>
            <ButtonRightSide colorTheme={colorTheme} chipPosition={chipPosition} className={chipClasses} disabled={disabled}></ButtonRightSide>
        </span>
    );
};

export default Button;

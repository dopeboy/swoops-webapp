import React from 'react';

export enum ColorTheme {
    AssistGreen,
    DefeatRed,
    Black,
    White,
}

export enum ChipPosition {
    Left,
    Right,
    None,
}

export interface ButtonProps {
    colorTheme?: ColorTheme;
    chipPosition?: ChipPosition;
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    children?: React.ReactNode;
    className?: string;
    eventTrackingName?: string;
}

export interface ChipProps {
    className?: string;
    chipPosition: ChipPosition;
    colorTheme: ColorTheme;
    disabled: boolean;
}

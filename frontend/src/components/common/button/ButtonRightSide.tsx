import React from 'react';
import { ChipPosition, ChipProps,  } from './types';

const ButtonRightSide = (props: ChipProps) => {
    const { className, chipPosition } = props;

    /*  TODO - revisit in SWP-860
    if (colorTheme === ColorTheme.Black) {
        if (chipPosition === ChipPosition.Right) {
            return (
                <svg width={40} height={48} className={className} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
                    <g clipPath="url(#a)">
                        <path
                            className={classNames({ 'stroke-white/64': disabled })}
                            d="M0 1h32c3.9 0 7 3.1 7 7v9.4c0 4-1.6 7.8-4.4 10.6L20 42.6C17.2 45.4 13.4 47 9.4 47H0"
                            strokeWidth={2}
                        />
                    </g>
                    <defs>
                        <clipPath id="a">
                            <path fill="#fff" transform="rotate(-180 20 24)" d="M0 0h40v48H0z" />
                        </clipPath>
                    </defs>
                </svg>
            );
        }
        return (
            <svg width={40} height={48} className={className} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
                <mask id="a" fill="#fff">
                    <path d="M0 0h32a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8H0V0Z" />
                </mask>
                <path
                    d="M0-2h32c5.523 0 10 4.477 10 10h-4a6 6 0 0 0-6-6H0v-4Zm42 42c0 5.523-4.477 10-10 10H0v-4h32a6 6 0 0 0 6-6h4ZM0 48V0v48ZM32-2c5.523 0 10 4.477 10 10v32c0 5.523-4.477 10-10 10v-4a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6v-4Z"
                    fill="#FDFDFD"
                    mask="url(#a)"
                />
            </svg>
        );
    }
     */
    if (chipPosition === ChipPosition.Right) {
        return (
            <svg width={40} height={48} className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
                <path d="M0 0v48h9.373a16 16 0 0 0 11.313-4.686l14.628-14.628A16 16 0 0 0 40 17.373V8a8 8 0 0 0-8-8H0Z" />
            </svg>
        );
    }

    return (
        <svg width={40} height={48} className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M0 0h32a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8H0V0Z" />
        </svg>
    );
};

export default ButtonRightSide;

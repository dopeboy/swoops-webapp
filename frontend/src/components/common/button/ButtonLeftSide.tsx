import React from 'react';
import { ChipPosition, ChipProps } from './types';

const ButtonLeftSide = (props: ChipProps) => {
    const { className, chipPosition } = props;

    /* TODO - revisit in SWP-860
    if (colorTheme === ColorTheme.Black) {
        if (chipPosition === ChipPosition.Left) {
            return (
                <svg width={40} height={48} className={className} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
                    <g clipPath="url(#a)">
                        <path
                            className={classNames({ 'stroke-off-black/64': disabled })}
                            d="M40 47H8c-3.9 0-7-3.1-7-7v-9.4c0-4 1.6-7.8 4.4-10.6L20 5.4C22.8 2.6 26.6 1 30.6 1H40"
                            stroke="green"
                            strokeWidth={2}
                        />
                    </g>
                    <defs>
                        <clipPath id="a">
                            <path fill="#fff" d="M0 0h40v48H0z" />
                        </clipPath>
                    </defs>
                </svg>
            );
        }


        return (
            <svg width={40} height={48} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
                <mask id="a" fill="#fff">
                    <path d="M0 8a8 8 0 0 1 8-8h32v48H8a8 8 0 0 1-8-8V8Z" />
                </mask>
                <path
                    d="M-2 8C-2 2.477 2.477-2 8-2h32v4H8a6 6 0 0 0-6 6h-4Zm42 42H8C2.477 50-2 45.523-2 40h4a6 6 0 0 0 6 6h32v4ZM8 50C2.477 50-2 45.523-2 40V8C-2 2.477 2.477-2 8-2v4a6 6 0 0 0-6 6v32a6 6 0 0 0 6 6v4ZM40 0v48V0Z"
                    className="fill-white/64"
                    mask="url(#a)"
                />
            </svg>
        );
    }
    */

    if (chipPosition === ChipPosition.Left) {
        return (
            <svg width={40} height={48} className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
                <path d="M40 48V0h-9.373a16 16 0 0 0-11.313 4.686L4.686 19.314A16 16 0 0 0 0 30.627V40a8 8 0 0 0 8 8h32Z" />
            </svg>
        );
    }

    return (
        <svg width={40} height={48} className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M0 8a8 8 0 0 1 8-8h32v48H8a8 8 0 0 1-8-8V8Z" />
        </svg>
    );
};

export default ButtonLeftSide;

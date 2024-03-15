import React from 'react';

interface IProps {
    color: string;
}

function UnionIcon(props: IProps) {
    const { color } = props;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="26" fill="none" viewBox="0 0 40 26">
            <path
                fill={color}
                fillRule="evenodd"
                d="M0 1a1 1 0 011-1h9a1 1 0 011 1v11h5v-2a1 1 0 011-1h6a1 1 0 011 1v2h5V1a1 1 0 011-1h9a1 1 0 110 2h-8v22h8a1 1 0 110 2h-9a1 1 0 01-1-1V14h-5v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2h-5v11a1 1 0 01-1 1H1a1 1 0 110-2h8V2H1a1 1 0 01-1-1zm22 12v-2h-4v4h4v-2z"
                clipRule="evenodd"
            ></path>
        </svg>
    );
}

export default UnionIcon;

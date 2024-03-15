import React, { ReactElement } from 'react';

interface IProps {
    imageUrl?: string;
    children: JSX.Element | string;
}

const Badge = (props: IProps): ReactElement => {
    const { imageUrl, children } = props;

    return (
        <span className="badge bg-white flex items-center w-fit">
            <img src={`/images/${imageUrl}`} className="mr-1.5" alt={children + ' Badge'} />
            {children}
        </span>
    );
};

export default Badge;

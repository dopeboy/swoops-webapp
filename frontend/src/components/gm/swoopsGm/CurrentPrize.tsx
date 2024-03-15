import React, { ReactElement } from 'react';
import { getPrice } from 'src/lib/utils';

interface IProps {
    prize: string;
}

const CurrentPrize = (props: IProps): ReactElement => {
    const { prize } = props;

    return (
        <div className="px-6 py-7 bg-black min-w-0 bg-clip-border relative border-t border-b border-solid border-white/16">
            <div className="heading-three text-white text-center">Current Prize</div>
            <div className="heading-one text-white text-center">{getPrice(prize)}</div>
        </div>
    );
};

export default CurrentPrize;

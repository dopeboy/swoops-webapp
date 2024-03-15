import React, { ReactElement } from 'react';
import { getPrice } from 'src/lib/utils';

interface IProps {
    prize: string;
}

const CurrentPrizeCard = (props: IProps): ReactElement => {
    const { prize } = props;

    return (
        <div className="rounded-lg px-6 py-7 bg-black min-w-0 bg-clip-border relative border border-b border-solid border-white/16 mb-16">
            <div className="max-w-[13rem] mx-auto">
                <div className="text-[12px] leading-6 text-white/64 font-medium  uppercase font-header">Current Prize</div>
                <div className="heading-one text-white ">{getPrice(prize)}</div>
            </div>
        </div>
    );
};

export default CurrentPrizeCard;

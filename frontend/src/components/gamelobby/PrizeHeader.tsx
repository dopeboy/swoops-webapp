import { ReactElement } from 'react';

const PrizeHeader = (props): ReactElement => {
    const { buyIn, prizePool } = props;
    return (
        <div className="py-8 border-b border-white/16 flex flex-row justify-evenly">
            <div>
                <div className="text-white heading-three">BUY-IN</div>
                <div className="text-white heading-one">${buyIn}</div>
            </div>
            <div>
                <div className="text-white heading-three">Current prize</div>
                <div className="text-white heading-one">${prizePool}</div>
            </div>
        </div>
    );
};

export default PrizeHeader;

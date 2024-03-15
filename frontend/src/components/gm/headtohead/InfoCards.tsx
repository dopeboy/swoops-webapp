import { ReactElement } from 'react';

const InfoCards = (): ReactElement => {
    return (
        <>
            <div className="flex flex-row align-items py-12">
                <div className="roster-card w-1/2 h-36">
                    <h1 className="dark:text-white/64 pt-6 pl-6 heading-four">Teams joined</h1>
                    <text className="text-white heading-one pl-6">1 of 2</text>
                </div>
                <div className="roster-card w-1/2 h-36 ml-8">
                    <h4 className="dark:text-white/64 pt-6 pl-6 heading-four">Current prize</h4>
                    <text className="text-white heading-one pl-6 heading-one">$120,000</text>
                </div>
            </div>
        </>
    );
};

export default InfoCards;

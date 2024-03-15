import { ReactElement } from 'react';

interface InfoCardsProps {
    joinedCount: number;
}

const InfoCards: React.FC<InfoCardsProps> = ({ joinedCount }): ReactElement => {
    return (
        <>
            <div className="flex flex-row align-items py-12">
                <div className="roster-card w-1/2 h-36">
                    <h1 className="dark:text-white/64 pt-6 pl-6 heading-four">Teams joined</h1>
                    <span className="text-white heading-one pl-6">{joinedCount} of 2</span>
                </div>
                <div className="roster-card w-1/2 h-36 ml-8">
                    <h4 className="dark:text-white/64 pt-6 pl-6 heading-four">Current prize</h4>
                    <span className="text-white heading-one pl-6 heading-one">$ 0</span>
                </div>
            </div>
        </>
    );
};

export default InfoCards;

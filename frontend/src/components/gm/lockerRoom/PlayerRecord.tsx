import { ReactElement } from 'react';

const PlayerRecord = (): ReactElement => {
    return (
        <>
            <div className="flex flex-row align-items py-12">
                <div className="roster-card w-1/2 h-36">
                    <h1 className="dark:text-white/64 pt-6 pl-6 heading-four">Record</h1>
                    <text className="text-white text-6xl pl-6">64-15</text>
                </div>
                {/* we'll add back post-MVP */}
                {/* <div className="roster-card w-1/2 h-36 ml-8">
                    <h4 className="dark:text-white/64 pt-6 pl-6 heading-four">Trophies</h4>
                    <div className="flex flex-row relative pt-2">
                        <img className="pl-[20px] z-10 absolute" src="/images/Trophy.svg" />
                        <img className="pl-[44px] z-20 absolute" src="/images/Trophy.svg" />
                        <img className=" pl-[70px] z-30 absolute" src="/images/Trophy.svg" />
                        <img className=" pl-[96px] z-40 absolute" src="/images/MoreTrophies.svg" />
                    </div>
                </div> */}
            </div>
        </>
    );
};

export default PlayerRecord;

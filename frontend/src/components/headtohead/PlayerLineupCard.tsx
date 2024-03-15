import { ReactElement } from 'react';

const PlayerLineupCard = (): ReactElement => {
    return (
        <div
            className="
        dark:border-white/4 py-12
        h-[440px] w-52
        border-2
        box-border
        rounded-lg"
        >
            <div className="flex flex-col justify-start">
                <img src="../../images/lineup_player_card.png" width={178} height={265} className="m-auto" alt="Lineup player card" />
                <div className="flex flex-col justify-start ml-4">
                    <span className="label-text text-white/64">Shooting Guard</span>
                    <span className="heading-three text-white">Will</span>
                    <span className="heading-three text-white">Slaprock</span>
                    <button className="text-sm uppercase bg-white box-border rounded-xl w-1/2 mt-3">My Roster</button>
                </div>
            </div>
        </div>
    );
};

export default PlayerLineupCard;

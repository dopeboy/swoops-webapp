import React, { ReactElement } from 'react';
import RenderBadge from 'src/components/tournamentDetail/RenderBadge';

interface IProps {
    imageUrl: string;
    role: string;
    name: string;
    type: 'My Roster' | 'Autopopulated' | 'Free Agent';
}

const LineupCard = (props: IProps): ReactElement => {
    const { imageUrl, role, name, type } = props;

    return (
        <div className="border border-solid border-white/16 rounded-lg p-4">
            <div className="flex flex-col">
                <img className="h-auto w-full" src={`/images/${imageUrl}`} alt={name + ' Lineup Card'} />
                <div className="mt-4">
                    <div className="font-medium text-[12px] leading-6 font-display text-white/64">{role}</div>
                    <h2 className="heading-three text-white">{name}</h2>
                </div>
                <div className="mt-5">{<RenderBadge type={type} />}</div>
            </div>
        </div>
    );
};

export default LineupCard;

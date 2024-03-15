import React, { ReactElement } from 'react';
import PlayerCard from 'src/components/swoopsGm/PlayerCard';
import classnames from 'classnames';

interface IProps {
    title: string;
    description?: string;
    teams: any[];
    removeButton?: boolean;
}

const Team = (props: IProps): ReactElement => {
    const { title, description, teams, removeButton } = props;

    return (
        <div className="mb-14">
            <div
                className={classnames({
                    'mb-10': !description,
                    'mb-8': description,
                })}
            >
                <div className="heading-three text-white mb-3">{title}</div>
                {description && <div className="text-base font-display font-semibold text-white/64 text-lg">{description}</div>}
            </div>
            <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-7">
                    {teams.map((team, idx) => (
                        <PlayerCard key={idx} name={team.name} role={team.role} imageUrl={team.imageUrl} removeButton={removeButton} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Team;

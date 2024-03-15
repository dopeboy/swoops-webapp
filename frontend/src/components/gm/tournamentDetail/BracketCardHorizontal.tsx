import React, { ReactElement } from 'react';
import PlayerCard from 'src/components/gm/tournamentDetail/PlayerCard';
import classnames from 'classnames';

interface Player {
    imageUrl: string;
    name: string;
    score: string;
    live: boolean;
    title: string;
}

interface IProps {
    challenger: Player;
    challenged: Player;
    type: string;
    right?: boolean;
}

const BracketCardHorizontal = (props: IProps): ReactElement => {
    const { challenger, challenged, type, right } = props;

    return (
        <div className="relative">
            <div className="w-full w-[390px] break-words bg-white bg-clip-border rounded-lg ">
                <div className="flex flex-col relative">
                    <PlayerCard
                        title={challenger.title}
                        imageUrl={challenger.imageUrl}
                        name={challenger.name}
                        score={challenger.score}
                        live={challenger.live}
                    />
                    <PlayerCard
                        title={challenged.title}
                        imageUrl={challenged.imageUrl}
                        name={challenged.name}
                        score={challenged.score}
                        live={challenged.live}
                        last
                    />
                    <div className="absolute top-1/2 right-4 z-10" style={{ transform: 'translateY(-50%)' }}>
                        <span
                            className={classnames('badge', {
                                'bg-black text-white': type === 'Final',
                            })}
                        >
                            {type}
                        </span>
                    </div>
                </div>
            </div>
            {!right && <div className="absolute top-1/2   w-[16px] h-px bg-white/64 right-0" />}
            {right && <div className="absolute top-1/2   w-[16px] h-px bg-white/64 left-0" style={{ transform: 'translateX(-100%)' }} />}
        </div>
    );
};

export default BracketCardHorizontal;

import React from 'react';
import Player from 'src/components/tournamentDetail/Player';

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
    last?: boolean;
}

const BracketCard = (props: IProps) => {
    const { challenger, challenged, last } = props;

    return (
        <div className="relative">
            <div className="w-full w-[1120px] break-words bg-white bg-clip-border rounded-lg ">
                <div className="flex items-center flex-row">
                    <div className="w-auto grow shrink-0">
                        <Player
                            title={challenger.title}
                            imageUrl={challenger.imageUrl}
                            name={challenger.name}
                            score={challenged.score}
                            live={challenger.live}
                            left
                        />
                    </div>
                    <div className="shrink-0 mx-2">
                        <div className="uppercase font-extrabold text-lg font-display">Final</div>
                    </div>
                    <div className="w-auto grow shrink-0">
                        <Player
                            title={challenged.title}
                            imageUrl={challenged.imageUrl}
                            name={challenged.name}
                            score={challenged.score}
                            live={challenged.live}
                            left
                        />
                    </div>
                </div>
            </div>
            {!last && <div className="absolute top-1/2 right-0 w-[64px] h-px bg-white/64 " style={{ transform: 'translateY(-50%)' }} />}
        </div>
    );
};

export default BracketCard;

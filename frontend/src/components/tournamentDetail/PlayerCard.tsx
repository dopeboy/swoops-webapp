import React from 'react';
import classnames from 'classnames';

interface IProps {
    title: string;
    imageUrl: string;
    name: string;
    score: string;
    live?: boolean;
    last?: boolean;
}

const PlayerCard = (props: IProps) => {
    const { title, imageUrl, name, score, live, last } = props;

    return (
        <div
            className={classnames('flex h-24 px-4 flex-row', {
                'border-b border-solid border-black/8': !last,
            })}
        >
            <div className="shrink-0 flex flex-col justify-end">
                <img className="h-auto" src={`/images/${imageUrl}`} alt="Player" />
            </div>
            <div className="flex justify-between items-center w-full flex-row">
                <div className="text-left">
                    <div className="text-base font-bold font-display text-black">{name}</div>
                    <div className="text-xs font-medium leading-6 text-off-black">{score}</div>
                </div>
                <div className="flex items-center flex-row">
                    {live ? <div className="h-3 w-3 bg-assist-green rounded-full" /> : <div className="w-3" />}
                    <div className="heading-two ml-4">{title}</div>
                </div>
            </div>
        </div>
    );
};

export default PlayerCard;

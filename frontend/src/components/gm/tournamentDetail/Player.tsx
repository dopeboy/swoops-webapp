import React from 'react';
import classnames from 'classnames';

interface IProps {
    left?: boolean;
    title: string;
    imageUrl: string;
    name: string;
    score: string;
    live?: boolean;
}

const Player = (props: IProps) => {
    const { left, title, imageUrl, name, score, live } = props;

    return (
        <div
            className={classnames('flex h-24 px-8', {
                'flex-row': left,
                'flex-row-reverse': !left,
            })}
        >
            <div className="shrink-0 flex flex-col justify-end">
                <img className="h-auto" src={`/images/${imageUrl}`} alt="Player" />
            </div>
            <div
                className={classnames('flex justify-between items-center w-full', {
                    'flex-row': left,
                    'flex-row-reverse': !left,
                })}
            >
                <div
                    className={classnames({
                        'text-left': left,
                        'text-right mr-4': !left,
                    })}
                >
                    <div className="text-base font-bold font-display text-black">{name}</div>
                    <div className="text-xs font-medium leading-6 text-off-black">{score}</div>
                </div>
                <div
                    className={classnames('flex items-center', {
                        'flex-row': left,
                        'flex-row-reverse': !left,
                    })}
                >
                    <div className={classnames('heading-one', { 'mr-8': left, 'ml-8': !left })}>{title}</div>
                    {live ? <div className="h-3 w-3 bg-assist-green rounded-full" /> : <div className="w-3" />}
                </div>
            </div>
        </div>
    );
};

export default Player;

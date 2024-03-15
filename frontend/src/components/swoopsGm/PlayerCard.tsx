import React, { ReactElement } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import classnames from 'classnames';

interface IProps {
    role: string;
    name: string;
    imageUrl: string;
    removeButton?: boolean;
}

const PlayerCard = (props: IProps): ReactElement => {
    const { role, name, imageUrl, removeButton } = props;

    return (
        <div className="flex flex-col">
            <div
                className={classnames('border-2 border-solid border-assist-green rounded-lg bg-off-black w-full relative', {
                    'pt-16': removeButton,
                    'pt-2': !removeButton,
                })}
            >
                {removeButton && (
                    <div className="absolute top-3.5 left-3.5">
                        <button className="h-10 w-10 icon-btn">
                            <XMarkIcon className="w-6 h-6 text-white" />
                        </button>
                    </div>
                )}
                <div className="flex flex-col h-full justify-end">
                    <img src={`/images/${imageUrl}`} alt={name + ' Player Card'} className="w-full h-48  rounded-bl-lg rounded-br-lg" />
                </div>
            </div>
            <div className="py-4">
                <div className="text-[12px] font-medium font-display leading-6 text-white/64">{role}</div>
                <h2 className="heading-three text-white">{name}</h2>
            </div>
        </div>
    );
};

export default PlayerCard;

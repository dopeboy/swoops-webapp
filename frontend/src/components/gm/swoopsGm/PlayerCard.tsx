import React, { ReactElement } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { getStat } from 'src/lib/gm/utils';
import classnames from 'classnames';
import config from 'tailwind.config';
import DollarBadge from './DollarBadge';

interface IProps {
    name: string;
    position: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    price: number;
    yourLineup?: boolean;
    handleRemove?: () => void;
    errorBudget?: boolean;
}

const PlayerCard = (props: IProps): ReactElement => {
    const { name, position, firstName, lastName, imageUrl, price, yourLineup, handleRemove, errorBudget } = props;

    return (
        <div
            className={classnames('relative flex', {
                'justify-start': !yourLineup,
                'justify-end': yourLineup,
            })}
        >
            <div
                className={classnames('w-9 h-12 md:w-16 md:h-[88px] flex items-center min-w-0 gap-x-2 md:gap-x-4 grow', {
                    'flex-row-reverse': yourLineup,
                })}
            >
                {yourLineup && (
                    <div>
                        <button className="h-6 w-6 rounded-lg md:h-10 md:w-10 icon-btn" onClick={handleRemove}>
                            <XMarkIcon className="h-4 w-4 md:w-6 md:h-6 text-white" />
                        </button>
                    </div>
                )}

                <div
                    className={classnames('h-full shrink-0 bg-off-black flex flex-col justify-end rounded-lg border-2 border-solid', {
                        'border-white': !yourLineup,
                        'border-assist-green': yourLineup && !errorBudget,
                        'border-defeat-red': yourLineup && errorBudget,
                    })}
                >
                    <img
                        src={imageUrl}
                        alt={name + ' Player Card'}
                        className={classnames('object-cover w-8 h-10 md:h-20 md:w-16 rounded-bl-lg rounded-br-lg')}
                    />
                </div>
                <div
                    className={classnames('relative flex flex-col grow truncate', {
                        'text-left items-start': !yourLineup,
                        'text-right items-end': yourLineup,
                    })}
                >
                    <div className="text-[12px] leading-none font-display md:font-header font-medium mb-1 md:mb-2 w-full">
                        <span className="block md:hidden truncate">
                            {firstName.charAt(0)}. {lastName}
                        </span>
                        <span className="hidden md:block uppercase">{firstName + ' ' + lastName}</span>
                    </div>
                    <DollarBadge
                        color={config.theme.extend.colors.white}
                        className={classnames('md:py-1 md:px-2', {
                            'bg-assist-green/32': !errorBudget && yourLineup,
                            'bg-defeat-red': errorBudget && yourLineup,
                            'bg-off-black': !yourLineup,
                        })}
                    >
                        {getStat(price)}
                    </DollarBadge>
                </div>
            </div>
            {/* {!yourLineup && (
                <div className="absolute top-1/2 -right-2.5 md:-right-[18px]" style={{ transform: 'translateY(-50%)', zIndex: '1' }}>
                    <div className="bg-black py-2">
                        <span className="rounded bg-off-black w-5 h-7 md:w-9 md:h-9 flex items-center justify-center text-base leading-6 font-bold font-display">
                            {position}
                        </span>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default PlayerCard;

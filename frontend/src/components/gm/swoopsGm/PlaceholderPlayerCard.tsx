import React, { ReactElement } from 'react';
import classnames from 'classnames';

interface IProps {
    position: string;
    imageUrl: string;
}

const PlaceholderPlayerCard = (props: IProps): ReactElement => {
    const { position, imageUrl } = props;

    return (
        <div className={classnames('relative flex justify-end')}>
            <div className={classnames('w-9 h-12 md:w-16 md:h-[88px] flex items-center min-w-0 gap-x-2 md:gap-x-4 flex-row-reverse grow')}>
                <div
                    className={classnames('h-full shrink-0 bg-off-black flex flex-col justify-end rounded-lg border-2 border-solid border-white/16')}
                >
                    <img
                        src={`/images/${imageUrl}`}
                        alt={'Placeholder Card'}
                        className={classnames('object-cover w-8 h-10 md:h-20 md:w-16 rounded-bl-lg rounded-br-lg')}
                    />
                </div>
                <div className={classnames('relative flex flex-col items-end grow truncate text-right')}>
                    <div className="text-[12px] leading-none normal-case md:uppercase font-display md:font-header font-medium text-white/64 truncate w-full">
                        {position}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderPlayerCard;

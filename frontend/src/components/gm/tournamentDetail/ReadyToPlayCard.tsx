import React, { ReactElement } from 'react';
import classnames from 'classnames';

interface IProps {
    title: string;
    summary: string;
    button: string;
    handleJoin: () => void;
    size: 'medium' | 'large';
    mb?: boolean;
}

const ReadyToPlayCard = (props: IProps): ReactElement => {
    const { title, summary, button, handleJoin, size, mb } = props;

    return (
        <div
            className={classnames('border border-solid border-white/16 rounded-lg', {
                'py-9': size === 'medium',
                'py-24': size === 'large',
                'mb-8': mb,
            })}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div className="relative px-8 md:px-0">
                    <div className="hidden md:block absolute top-1/2 left-1/2 " style={{ transform: 'translate(-50%, -50%)' }}>
                        <img
                            src="/images/headtoheadmain.png"
                            className={classnames('', {
                                'h-[247px]': size === 'medium',
                                'h-[381px]': size === 'large',
                            })}
                            alt="Swoops Card Stacked"
                        />
                    </div>
                    <div className="block md:hidden ">
                        <img src="/images/headtoheadmain.png" className="h-auto mx-auto" alt="Swoops Card Stacked" />
                    </div>
                </div>
                <div className="relative px-8 md:px-0">
                    <div className="mx-auto">
                        <h2 className="heading-one text-white">{title}</h2>
                        <p className="text-base font-medium text-white/64 font-display">{summary}</p>
                        <div className="mt-7">
                            <button className="btn-rounded-green" onClick={handleJoin}>
                                {button}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReadyToPlayCard;

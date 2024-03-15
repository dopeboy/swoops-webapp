import React from 'react';
import classnames from 'classnames';

interface IProps {
    step: number;
    title: string;
    summary: string;
    button: string;
    active: boolean;
    isLast: boolean;
}

const Step = (props: IProps) => {
    const { step, title, summary, button, active, isLast } = props;

    return (
        <div className="flex relative">
            <div
                className={classnames('max-w-[30rem] ml-20  sm:ml-36  mt-4', {
                    'mb-32': !isLast,
                    'mb-2': isLast,
                })}
            >
                <h2 className="text-xl font-bold font-header uppercase text-white mb-2.5 md:whitespace-nowrap">{title}</h2>
                <p className="font-display text-white/64 text-base leading-6 ">{summary}</p>
                <div className="mt-12 ">
                    <button
                        className={classnames({
                            'btn-rounded-green': active,
                            'btn-rounded-white': !active,
                        })}
                    >
                        {button}
                    </button>
                </div>
            </div>
            <div className="absolute top-0 left-1  sm:left-[2rem] z-10">
                {' '}
                <div className="bg-black py-3">
                    <div className="h-12 w-12 rounded-full  bg-white">
                        <div className="text-black flex items-center justify-center h-full heading-three">{step}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step;

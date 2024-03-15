import React, { ReactElement } from 'react';

interface IProps {
    time: string;
    title: string;
    summary: string;
    button: string;
}

const RoundCard = (props: IProps): ReactElement => {
    const { time, title, summary, button } = props;

    return (
        <div className="bg-white rounded-lg px-8 py-9 mt-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div className="flex items-center mb-6 md:mb-0">
                    <div className="mr-9">
                        <span className="badge text-lg leading-none border border-solid border-black/8">{time}</span>
                    </div>
                    <div>
                        <h2 className="heading-two text-black">{title}</h2>
                        <p className="text-base font-display text-off-black font-bold">{summary}</p>
                    </div>
                </div>
                <button className="btn bg-white border border-solid border-black/8">{button}</button>
            </div>
        </div>
    );
};

export default RoundCard;

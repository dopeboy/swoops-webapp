import React from 'react';
import moment from 'moment';

interface IProps {
    date: Date | string;
    title: string;
    description?: string;
}

const DailyChallenge = (props: IProps) => {
    const { date, title, description } = props;

    return (
        <div className="mb-6">
            <div className="flex flex-wrap items-center gap-x-2 md:gap-x-4">
                <span className="text-[12px] uppercase font-header font-bold md:heading-three text-white/64 whitespace-nowrap">Daily challenge</span>
                <span className="shrink-0 w-1 h-1 md:h-2 md:w-2 bg-white/64 rounded-full" />
                <span className="text-[12px] uppercase font-header font-bold md:heading-three text-white/64 whitespace-nowrap">
                    {moment(date).format('ddd MMMM D, YYYY')}
                </span>
            </div>
            <h1 className="heading-two md:heading-one text-white">{title}</h1>
            {description && (
                <p className="font-display font-medium md:font-semibold md:text-lg text-[12px] text-white/64 mt-2 md:mt-3.5">{description}</p>
            )}
        </div>
    );
};

export default DailyChallenge;

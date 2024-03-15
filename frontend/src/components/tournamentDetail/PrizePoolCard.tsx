import React, { ReactElement } from 'react';
import classnames from 'classnames';

interface IProps {
    title: string;
    summary: string;
    tournaments: any[];
    mr?: boolean;
}

const PrizePoolCard = (props: IProps): ReactElement => {
    const { title, summary, tournaments, mr } = props;

    return (
        <div
            className={classnames(
                'w-full md:w/1-2 relative flex flex-col min-w-0 break-words bg-clip-border rounded-lg border border-solid border-white/16 rounded-lg',
                {
                    'mr-8': mr,
                }
            )}
        >
            <div className="px-8 py-8 border-b border-solid border-white/16">
                <div className="heading-four text-[12px] font-normal text-white/64">{title}</div>
                <div className="heading-two font-normal text-white">{summary}</div>
            </div>
            {tournaments.map((tournament, idx) => (
                <div
                    key={idx}
                    className={classnames('flex justify-between px-8 py-4 ', {
                        'border-b border-solid border-white/16': idx !== tournaments.length - 1,
                    })}
                >
                    <div className="text-base font-bold text-white">{tournament.title}</div>
                    <div className="text-right">
                        <div className="heading-three text-white">{tournament.prizepool}</div>
                        <div className="text-xs font-medium text-white/64  font-display">{tournament.currency}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PrizePoolCard;

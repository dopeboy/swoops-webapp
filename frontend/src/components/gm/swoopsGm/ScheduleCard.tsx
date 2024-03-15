import React, { ReactElement } from 'react';
import moment from 'moment';

interface IProps {
    challengerTeam: string;
    challengerScore?: string;
    challengerPoint?: string;
    challengerLive?: boolean;
    challengedTeam: string;
    challengedScore?: string;
    challengedPoint?: string;
    challengedLive?: boolean;
    time: Date | string;
}

const ScheduleCard = (props: IProps): ReactElement => {
    const {
        challengerTeam,
        challengerScore,
        challengerPoint,
        challengerLive,
        challengedTeam,
        challengedScore,
        challengedPoint,
        challengedLive,
        time,
    } = props;

    return (
        <div className="bg-white rounded-lg bg-clip-border min-w-0 p-6 md:px-12">
            <div className="flex gap-y-6 flex-col md:flex-row">
                <div className=" block md:hidden text-center uppercase font-display font-extrabold text-lg text-black">
                    {typeof time === 'string' ? time : `Starts in ${moment(time).format('hh:mm')}`}
                </div>
                <div className="grow">
                    <div className="flex  md:justify-end">
                        <div className="md:mr-8">
                            <div className="flex items-center md:justify-end">
                                <div className="heading-one text-black text-right">{challengerPoint}</div>
                                <div className="md:hidden block">
                                    {challengerPoint > challengedPoint ? (
                                        <div className="h-3 w-3 bg-assist-green rounded-full ml-4" />
                                    ) : (
                                        <div className="w-3" />
                                    )}
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="text-off-black font-bold text-[18px] font-header uppercase md:text-right">{challengerTeam}</div>
                                {challengerScore && (
                                    <div className="text-off-black font-bold text-base font-display uppercase md:text-right">{challengerScore}</div>
                                )}
                            </div>
                        </div>
                        <div className="hidden md:block">
                            {challengerPoint > challengedPoint ? (
                                <div className="h-3 w-3 bg-assist-green rounded-full  mt-[18px]" />
                            ) : (
                                <div className="w-3" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="hidden md:block shrink-0 mx-12 mt-3">
                    <div className="text-center uppercase font-display font-extrabold text-lg text-black">
                        {typeof time === 'string' ? time : `Starts in ${moment(time).format('hh:mm')}`}
                    </div>
                </div>
                <div className="grow">
                    <div className="flex">
                        <div className="hidden md:block">
                            {challengedPoint > challengerPoint ? (
                                <div className="h-3 w-3 bg-assist-green rounded-full  mt-[18px]" />
                            ) : (
                                <div className="w-3" />
                            )}
                        </div>
                        <div className="md:ml-8">
                            {' '}
                            <div className="flex items-center">
                                <div className="heading-one text-black">{challengedPoint}</div>
                                <div className="block md:hidden">
                                    {challengedPoint > challengerPoint ? (
                                        <div className="h-3 w-3 bg-assist-green rounded-full ml-4" />
                                    ) : (
                                        <div className="w-3" />
                                    )}
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="text-off-black font-bold text-[18px] font-header uppercase">{challengedTeam}</div>
                                <div className="text-off-black font-bold text-base font-display uppercase ">{challengedScore}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleCard;

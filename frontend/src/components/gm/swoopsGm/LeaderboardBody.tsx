import React from 'react';
import ordinal from 'ordinal';
import { Leaderboard } from 'src/lib/gm/api/models/Leaderboard';

interface IProps {
    leaderboard: Leaderboard;
}

const LeaderboardBody = (props: IProps) => {
    const { leaderboard } = props;

    return (
        <tr className="border-b border-white/16 border-solid">
            <td align="left" className="py-3.5 md:py-5 align-center whitespace-nowrap px-4 md:px-6 heading-three">
                {ordinal(leaderboard.position)}
            </td>
            <td align="left" className="py-3.5 md:py-5 align-center px-3 md:px-4 font-display font-extrabold text-xs lg:text-lg xl:text-lg 2xl:text-lg">
                <div className='whitespace-nowrap w-28 lg:w-full xl:w-full 2xl:w-full text-ellipsis overflow-hidden '>{leaderboard.amended_id}</div>
            </td>
            <td align="left" className="py-3.5 md:py-5 align-center whitespace-nowrap px-3 md:px-4 font-display font-medium text-base">
                {leaderboard.wins}-{leaderboard.losses}
            </td>
            <td align="left" className="py-3.5 md:py-5 align-center whitespace-nowrap px-3 md:px-4 font-display font-medium text-base">
                {~~leaderboard.win_percentage}
            </td>
            <td align="left" className="py-3.5 md:py-5 align-center whitespace-nowrap px-3 md:px-4 font-display font-medium text-base">
                {leaderboard.points_differential}
            </td>
        </tr>
    );
};

export default LeaderboardBody;

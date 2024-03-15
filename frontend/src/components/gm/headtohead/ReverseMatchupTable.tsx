import { ReactElement } from 'react';

const getStatCell = (stat, statName): ReactElement => {
    return (
        <td className="pl-14">
            <div className="heading-three text-white">{stat}</div>
            <div className="text-white/64 text-display">{statName}</div>
        </td>
    );
};
const statList = ['APG', 'PPG', 'PPG'];

const ReverseMatchupTable = (props): ReactElement => {
    const { players } = props;
    return (
        <>
            <table className="w-1/2  border border-white/16 table-fixed">
                <div className="heading-four text-white w-full">Los Angeles Lineup</div>
                {players.map((player) => (
                    <tr className="border border-white/16 h-24">
                        {statList.map((stat) => getStatCell((Math.random() * 100).toFixed(1), stat))}
                        <td>
                            <div className="text-display text-white text-base">{`${player.first_name} ${player.last_name}`}</div>
                            <div className="text-display text-white/64 text-base">Point Guard</div>
                        </td>
                        <td>
                            <img className="h-10 rounded-full" src={player.image_url} alt="Player image" />
                        </td>
                    </tr>
                ))}
            </table>
        </>
    );
};

export default ReverseMatchupTable;

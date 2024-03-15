import { ReactElement } from 'react';

const getStatCell = (stat, statName): ReactElement => {
    return (
        <td className="pr-14">
            <div className="heading-three text-white">{stat}</div>
            <div className="text-white/64 text-display">{statName}</div>
        </td>
    );
};
const statList = ['PPG', 'RBG', 'APG'];

const MatchupTable = (props): ReactElement => {
    const { players } = props;
    return (
        <>
            <table className="w-1/2  border border-white/16 table-fixed">
                <div className="heading-four text-white w-full">Los Angeles Lineup</div>
                {players.map((player) => (
                    <tr className="border border-white/16 h-24">
                        <td className="pl-4 ">
                            <img className="h-10 rounded-full" src={player.image_url} alt="Player image" />
                        </td>
                        <td>
                            <div className="text-display text-white text-base">{`${player.first_name} ${player.last_name}`}</div>
                            <div className="text-display text-white/64 text-base">Point Guard</div>
                        </td>
                        {statList.map((stat) => getStatCell((Math.random() * 100).toFixed(1), stat))}
                    </tr>
                ))}
            </table>
        </>
    );
};

export default MatchupTable;

import { ReactElement } from 'react';
import classnames from 'classnames';

interface IProps {
    title: string;
    players: any;
    right?: boolean;
}

const MatchupTable = (props: IProps): ReactElement => {
    const { title, players, right } = props;
    const renderPlayers = (player, idx): ReactElement => {
        if (right) {
            return (
                <tr key={idx}>
                    <td
                        align="right"
                        className="min-w-[100px] align-center border-b border-white/16 border-solid whitespace-nowrap text-sm text-white"
                    >
                        <div className="heading-three text-base text-white">{player.APG}</div>
                        <div className="text-[12px] leading-6 font-display font-medium text-white/64">APG</div>
                    </td>
                    <td
                        align="right"
                        className="min-w-[100px] align-center border-b border-white/16 border-solid whitespace-nowrap text-sm text-white"
                    >
                        <div className="heading-three text-base text-white">{player.PPG}</div>
                        <div className="text-[12px] leading-6 font-display font-medium text-white/64">PPG</div>
                    </td>
                    <td
                        align="right"
                        className="min-w-[100px] align-center border-b border-white/16 border-solid whitespace-nowrap text-sm text-white"
                    >
                        <div className="heading-three text-base text-white">{player.RBG}</div>
                        <div className="text-[12px] leading-6 font-display font-medium text-white/64">RBG</div>
                    </td>
                    <td align="right" className="min-w-[240px] border-b border-white/16 border-solid whitespace-nowrap text-sm  px-6 text-white">
                        <div className="h-24 flex items-center">
                            <div>
                                <div className="font-display font-extrabold text-white text-base ">{player.name}</div>
                                <div className="font-display font-bold text-white text-base text-white/64">{player.position}</div>
                            </div>
                            <div className="h-full shrink-0  flex flex-col justify-end ml-8">
                                <img src={`/images/${player.imageUrl}`} alt={`${player.name} Player`} className="h-auto" />
                            </div>
                        </div>
                    </td>
                </tr>
            );
        } else {
            return (
                <tr key={idx}>
                    <td className="min-w-[240px] border-b border-white/16 border-solid whitespace-nowrap text-sm  px-6 text-white">
                        <div className="h-24 flex items-center">
                            <div className="h-full shrink-0  flex flex-col justify-end">
                                <img src={`/images/${player.imageUrl}`} alt={`${player.name} Player`} className="h-auto" />
                            </div>
                            <div>
                                <div className="flex">
                                    <span className="font-display font-extrabold text-white text-base ">{player.name}</span>
                                    {player.badge && (
                                        <div className="shrink-0 ml-2">
                                            <img src="/images/shield_icon.png" alt="Shield" />
                                        </div>
                                    )}
                                </div>
                                <div className="font-display font-bold text-white text-base text-white/64">{player.position}</div>
                            </div>
                        </div>
                    </td>
                    <td
                        align="left"
                        className="min-w-[100px] align-center border-b border-white/16 border-solid whitespace-nowrap text-sm text-white"
                    >
                        <div className="heading-three text-base text-white">{player.PPG}</div>
                        <div className="text-[12px] leading-6 font-display font-medium text-white/64">PPG</div>
                    </td>
                    <td
                        align="left"
                        className="min-w-[100px] align-center border-b border-white/16 border-solid whitespace-nowrap text-sm text-white"
                    >
                        <div className="heading-three text-base text-white">{player.RBG}</div>
                        <div className="text-[12px] leading-6 font-display font-medium text-white/64">RBG</div>
                    </td>
                    <td
                        align="left"
                        className="min-w-[100px] align-center border-b border-white/16 border-solid whitespace-nowrap text-sm text-white"
                    >
                        <div className="heading-three text-base text-white">{player.APG}</div>
                        <div className="text-[12px] leading-6 font-display font-medium text-white/64">APG</div>
                    </td>
                </tr>
            );
        }
    };

    return (
        <>
            <div
                className={classnames('w-full md:w-1/2 align-middle  border-solid border-white/16  border-l border-t  overflow-x-auto ', {
                    'border-r rounded-tr-lg rounded-l-lg md:rounded-l-none  md:rounded-r-lg': right,
                    'border-r md:border-r-none rounded-r-lg  md:rounded-r-none  md:rounded-l-lg': !right,
                })}
            >
                <div className="w-full p-4 ">
                    <div
                        className={classnames('heading-four text-white font-medium text-[12px]', {
                            'text-right': right,
                            'text-left': !right,
                        })}
                    >
                        {title}
                    </div>
                </div>
                <table className="w-full">
                    <tbody className={classnames('rounded-b-lg bg-black border-t  border-solid border-white/16  rounded-lg')}>
                        {players && players.map((player, idx) => renderPlayers(player, idx))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default MatchupTable;

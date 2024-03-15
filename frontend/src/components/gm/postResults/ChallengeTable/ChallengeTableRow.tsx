import classNames from 'classnames';
import { getStat } from 'src/lib/gm/utils';

const cellClasses = 'align-center border-b border-white/16 text-[11px] md:text-[15px] border-solid whitespace-nowrap md:px-4 py-2';

interface ChallengeTableRowProps {
    player: any;
    isDesktop: boolean;
    isChallengeTeam: boolean;
    index: number;
}
export const ChallengeTableRow: React.FC<ChallengeTableRowProps> = ({ player, isDesktop, isChallengeTeam, index }) => {
    const getImageBgColor = (): string => {
        switch (isChallengeTeam) {
            case true:
                return 'border border-white/16 bg-off-black/16';
            case false:
                return 'border border-white/16 bg-off-black';
            default:
                return 'border border-white/16 bg-off-black';
        }
    };

    return (
        <tr key={player.id} className={index % 2 === 0 ? 'bg-black' : 'bg-white/4'}>
            <td className="border-b border-white/16 border-solid whitespace-nowrap pl-2.5 md:pr-3 py-2">
                <div className="h-fit md:h-20 flex w-fit items-center">
                    <div className="hidden sm:flex h-full shrink-0 flex-col justify-center md:justify-end mr-2.5">
                        <img
                            src={player.player?.image_url}
                            alt={`${player.player.full_name} Player`}
                            className={classNames('object-cover h-24 w-24 rounded-lg', getImageBgColor())}
                        />
                    </div>
                    <div>
                        <div className="font-display text-[11px]">
                            <div className="hidden md:block md:text-[16px]"> {player.player.first_name + ' ' + player.player.last_name}</div>
                            <div className="md:hidden break-words flex flex-row items-center justify-start gap-2">
                                <div className="flex flex-col items-center justify-center">
                                    <div>{player.player.first_name.charAt(0) + '. '}</div> <div>{player.player.last_name}</div>
                                </div>
                            </div>
                        </div>
                        <div className="font-display font-semibold text-[11px] md:text-[16px] text-white/64 hidden md:block">
                            {player.player.position}
                        </div>
                    </div>
                </div>
            </td>
            {!isDesktop && (
                <td
                    align="center"
                    className="text-white/64 font-medium align-center border-b border-white/16 text-[11px] border-solid whitespace-nowrap pl-0 pr-2 md:px-4 py-2"
                >
                    {player.player.position}
                </td>
            )}
            <td align="center" className={cellClasses}>
                {getStat(player.fg)}-{getStat(player.fga)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(player.three_p)}-{getStat(player.three_pa)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(player.ft)}-{getStat(player.fta)}
            </td>
            {isDesktop && (
                <td align="center" className={cellClasses}>
                    {getStat(player.drb)}
                </td>
            )}
            {isDesktop && (
                <td align="center" className={cellClasses}>
                    {getStat(player.orb)}
                </td>
            )}
            <td align="center" className={cellClasses}>
                {getStat(player.trb)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(player.ast)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(player.stl)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(player.blk)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(player.tov)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(player.pf)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(player.pts)}
            </td>
        </tr>
    );
};

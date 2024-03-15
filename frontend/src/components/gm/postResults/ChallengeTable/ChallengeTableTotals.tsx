import { getStat } from 'src/lib/gm/utils';

const cellClasses = 'align-center border-b border-white/16 text-[11px] md:text-[15px] border-solid whitespace-nowrap md:px-4 md:py-4 py-3';

interface ChallengeTableTotalsProps {
    totals: any;
    isDesktop: boolean;
}
export const ChallengeTableTotals: React.FC<ChallengeTableTotalsProps> = ({ totals, isDesktop }) => {
    return (
        <tr key={totals.id} className="text-white bg-white/4">
            <td className="border-b border-white/16 border-solid text-[12px] uppercase sm:text-[14px] sm:font-semibold font-medium whitespace-nowrap pl-2.5 md:pl-6 md:py-4 py-3">
                Totals
            </td>
            {!isDesktop && (
                <td
                    align="center"
                    className="text-white/64 font-medium align-center border-b border-white/16 text-[11px] border-solid whitespace-nowrap pl-0 pr-2 md:px-4 md:py-4 py-3"
                ></td>
            )}
            <td align="center" className={cellClasses}>
                {getStat(totals.fg)}-{getStat(totals.fga)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(totals.three_p)}-{getStat(totals.three_pa)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(totals.ft)}-{getStat(totals.fta)}
            </td>
            {isDesktop && (
                <td align="center" className={cellClasses}>
                    {getStat(totals.drb)}
                </td>
            )}
            {isDesktop && (
                <td align="center" className={cellClasses}>
                    {getStat(totals.orb)}
                </td>
            )}
            <td align="center" className={cellClasses}>
                {getStat(totals.trb)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(totals.ast)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(totals.stl)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(totals.blk)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(totals.tov)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(totals.pf)}
            </td>
            <td align="center" className={cellClasses}>
                {getStat(totals.pts)}
            </td>
        </tr>
    );
};

const positionHeaderClasses = 'pl-0 pr-2 py-2 sm:py-0';
const largeHeaderClasses =
    'px-1 py-2 sm:py-0 md:px-4 md:py-5 whitespace-nowrap text-[11px] sm:text-[14px] sm:font-semibold font-medium uppercase tracking-wider';
const smallHeaderClasses =
    'px-0.5 py-2 sm:py-0 md:px-4 md:py-5 whitespace-nowrap text-[11px] sm:text-[14px] sm:font-semibold font-medium uppercase tracking-wider';
const lastColumnCellClasses =
    'pl-0.5 pr-2 py-2 sm:py-0 md:px-4 md:py-5 whitespace-nowrap text-[11px] sm:text-[14px] sm:font-semibold font-medium uppercase tracking-wider';
const playerHeaderClasses =
    'w-fit max-w-[70px] md:min-w-[300px] pl-2 md:px-6 py-2 sm:py-0 whitespace-nowrap text-left text-[11px] sm:text-[14px] sm:font-semibold font-medium uppercase tracking-wider';

interface ChallengeTableHeaderProps {
    isDesktop: boolean;
}
export const ChallengeTableHeader: React.FC<ChallengeTableHeaderProps> = ({ isDesktop }) => {
    return (
        <tr className="bg-white text-black border-b border-solid border-white/16">
            <th scope="col" className={playerHeaderClasses}>
                Player
            </th>
            {!isDesktop && <th align="center" scope="col" className={positionHeaderClasses}></th>}
            <th align="center" scope="col" className={largeHeaderClasses}>
                {isDesktop ? 'FG/FGA' : 'FG'}
            </th>
            <th align="center" scope="col" className={largeHeaderClasses}>
                {isDesktop ? '3PT/3PTA' : '3PT'}
            </th>
            <th align="center" scope="col" className={largeHeaderClasses}>
                {isDesktop ? 'FT/FTA' : 'FT'}
            </th>
            {!isDesktop && (
                <th align="center" scope="col" className={smallHeaderClasses}>
                    REB
                </th>
            )}
            {isDesktop && (
                <th align="center" scope="col" className={smallHeaderClasses}>
                    DRB
                </th>
            )}
            {isDesktop && (
                <th align="center" scope="col" className={smallHeaderClasses}>
                    ORB
                </th>
            )}
            {isDesktop && (
                <th align="center" scope="col" className={smallHeaderClasses}>
                    TRB
                </th>
            )}
            <th align="center" scope="col" className={smallHeaderClasses}>
                AST
            </th>
            <th align="center" scope="col" className={smallHeaderClasses}>
                STL
            </th>
            <th align="center" scope="col" className={smallHeaderClasses}>
                BLK
            </th>
            <th align="center" scope="col" className={smallHeaderClasses}>
                TO
            </th>
            <th align="center" scope="col" className={smallHeaderClasses}>
                PF
            </th>
            <th align="center" scope="col" className={lastColumnCellClasses}>
                PTS
            </th>
        </tr>
    );
};

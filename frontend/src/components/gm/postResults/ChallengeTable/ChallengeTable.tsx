import { ReactElement } from 'react';
import useMediaQuery from 'src/hooks/gm/useMediaQuery';
import { LineupHeaderWithBadge } from './LineupHeaderWithBadge';
import { ChallengeTableHeader } from './ChallengeTableHeader';
import { ChallengeTableRow } from './ChallengeTableRow';
import { ChallengeTableTotals } from './ChallengeTableTotals';

export const ChallengeTable = (props): ReactElement => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const { salaryCap, yourLineup, yourLineupTotals, enemyLineup, enemyLineupTotals } = props;

    return (
        <div className="align-middle inline-block min-w-full overflow-x-auto w-full rounded-lg border-t border-r border-l border-solid border-white/16">
            <table className="min-w-full text-white">
                <tbody className="bg-black">
                    <LineupHeaderWithBadge title="Your lineup" color="home" value={salaryCap?.yourSalary} isDesktop={isDesktop} />
                    <ChallengeTableHeader isDesktop={isDesktop} />
                    {yourLineup &&
                        yourLineup
                            .slice(0, 5)
                            .map((player, index) => (
                                <ChallengeTableRow player={player} isDesktop={isDesktop} isChallengeTeam={false} index={index} />
                            ))}
                    {yourLineupTotals && <ChallengeTableTotals totals={yourLineupTotals} isDesktop={isDesktop} />}
                    <LineupHeaderWithBadge title="Challenge team" color="away" value={salaryCap?.enemySalary} isDesktop={isDesktop} />
                    <ChallengeTableHeader isDesktop={isDesktop} />
                    {enemyLineup &&
                        enemyLineup
                            .slice(0, 5)
                            .map((player, index) => <ChallengeTableRow player={player} isDesktop={isDesktop} isChallengeTeam index={index} />)}
                    {enemyLineupTotals && <ChallengeTableTotals totals={enemyLineupTotals} isDesktop={isDesktop} />}
                </tbody>
            </table>
        </div>
    );
};

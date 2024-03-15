import { TrophyIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { PlayByPlayBoxScore } from 'src/hooks/usePlayByPlay';
import { getTeamLogoFinalResolutionPath } from 'src/lib/utils';
const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL;

interface TeamStatsDisplayProps {
    lineupOneBoxScore: PlayByPlayBoxScore[];
    lineupTwoBoxScore: PlayByPlayBoxScore[];
    game: any;
    firstHeaderColor: string;
    secondHeaderColor: string;
    lineupOneName: string;
    lineupTwoName: string;
    addDecimalPlaces?: boolean;
}
export const TeamStatsDisplay: React.FC<TeamStatsDisplayProps> = ({
    game,
    firstHeaderColor,
    secondHeaderColor,
    lineupOneBoxScore,
    lineupTwoBoxScore,
    lineupOneName,
    lineupTwoName,
    addDecimalPlaces = false,
}) => {
    const getTextColor = (color: string) => {
        if (color) {
            const c = color.substring(1);
            const rgb = parseInt(c, 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;

            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
            if (luma > 128) {
                return 'text-black';
            } else {
                return 'text-white';
            }
        }
    };

    const evaluateStatWinner = (stat: string): string => {
        const lineupOneStat = Number(getTeamBoxScoreSum(lineupOneBoxScore, stat));
        const lineupTwoStat = Number(getTeamBoxScoreSum(lineupTwoBoxScore, stat));
        if (stat === 'pf' || stat === 'tov') {
            if (lineupOneStat < lineupTwoStat) {
                return 'lineupOne';
            } else if (lineupOneStat > lineupTwoStat) {
                return 'lineupTwo';
            } else {
                return 'tie';
            }
        } else if (lineupOneStat > lineupTwoStat) {
            return 'lineupOne';
        } else if (lineupOneStat < lineupTwoStat) {
            return 'lineupTwo';
        } else {
            return 'tie';
        }
    };

    const getTeamBoxScoreSum = (lineup: PlayByPlayBoxScore[], stat: string): string => {
        const statSum = lineup?.reduce((accumulator, { boxScore }) => {
            if (boxScore && boxScore[stat]) {
                return accumulator + boxScore[stat];
            }
            return accumulator;
        }, 0);
        return statSum ? (addDecimalPlaces ? Number(statSum)?.toFixed(1) : Math.round(Number(statSum))?.toFixed(0)) : '0';
    };

    return (
        <div className="grid grid-cols-4 w-full justify-between rounded-lg border border-white/16 subheading-one divide-y divide-white/16 text-white">
            <div className="col-span-4 flex flex-row items-center justify-between px-2 pt-2.5 pb-2.5 rounded-t-lg text-black bg-white subheading-three md:subheading-two">
                <div className="flex flex-row items-center justify-start gap-2 max-w-[50%]">
                    {(game?.lineup_1?.team?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_1?.team?.path)}` : null) ? (
                        <img
                            src={`${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_1?.team?.path)}`}
                            className="aspect-square h-8 w-8 rounded-full"
                        />
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center aspect-square h-8 w-8 rounded-full"
                            style={{ backgroundColor: firstHeaderColor }}
                        >
                            <TrophyIcon className={classNames('w-5 h-5', getTextColor(firstHeaderColor || '#13FF0D'))} />
                        </div>
                    )}
                    <span>{lineupOneName}</span>
                </div>
                <div className="flex flex-row items-center justify-end max-w-[50%] text-right gap-2">
                    <span>{lineupTwoName}</span>
                    {(game?.lineup_2?.team?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_2?.team?.path)}` : null) ? (
                        <img
                            src={`${imageBaseUrl}${getTeamLogoFinalResolutionPath(game?.lineup_2?.team?.path)}`}
                            className="aspect-square h-8 w-8 rounded-full"
                        />
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center aspect-square h-8 w-8 rounded-full"
                            style={{ backgroundColor: secondHeaderColor }}
                        >
                            <TrophyIcon className={classNames('w-5 h-5', getTextColor(secondHeaderColor || '#4E4E4E'))} />
                        </div>
                    )}
                </div>
            </div>
            <div
                className={classNames('border-t border-white/16 col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('pts') === 'lineupOne',
                })}
            >
                {getTeamBoxScoreSum(lineupOneBoxScore, 'pts')}
            </div>
            <div className="col-span-2 text-center py-4">Points</div>
            <div
                className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('pts') === 'lineupTwo',
                })}
            >
                {getTeamBoxScoreSum(lineupTwoBoxScore, 'pts')}
            </div>
            <div
                className={classNames('flex flex-row items-center gap-0.5 col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('fg') === 'lineupOne',
                })}
            >
                <span>{getTeamBoxScoreSum(lineupOneBoxScore, 'fg')}</span>/<span>{getTeamBoxScoreSum(lineupOneBoxScore, 'fga')}</span>
            </div>
            <div className="col-span-2 text-center py-4">Field Goals</div>
            <div
                className={classNames('flex flex-row items-center justify-end gap-0.5 col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('fg') === 'lineupTwo',
                })}
            >
                <span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'fg')}</span>/<span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'fga')}</span>
            </div>
            <div
                className={classNames('flex flex-row items-center gap-0.5 col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('three_p') === 'lineupOne',
                })}
            >
                <span>{getTeamBoxScoreSum(lineupOneBoxScore, 'three_p')}</span>/<span>{getTeamBoxScoreSum(lineupOneBoxScore, 'three_pa')}</span>
            </div>
            <div className="col-span-2 text-center py-4">3 Pointers</div>
            <div
                className={classNames('flex flex-row items-center justify-end gap-0.5 col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('three_p') === 'lineupTwo',
                })}
            >
                <span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'three_p')}</span>/<span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'three_pa')}</span>
            </div>
            <div
                className={classNames('flex flex-row items-center gap-0.5 col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('ft') === 'lineupOne',
                })}
            >
                <span>{getTeamBoxScoreSum(lineupOneBoxScore, 'ft')}</span>/<span>{getTeamBoxScoreSum(lineupOneBoxScore, 'fta')}</span>
            </div>
            <div className="col-span-2 text-center py-4">Free Throws</div>
            <div
                className={classNames('flex flex-row items-center justify-end gap-0.5 col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('ft') === 'lineupTwo',
                })}
            >
                <span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'ft')}</span>/<span>{getTeamBoxScoreSum(lineupTwoBoxScore, 'fta')}</span>
            </div>
            <div
                className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('ast') === 'lineupOne',
                })}
            >
                {getTeamBoxScoreSum(lineupOneBoxScore, 'ast')}
            </div>
            <div className="col-span-2 text-center py-4">Assists</div>
            <div
                className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('ast') === 'lineupTwo',
                })}
            >
                {getTeamBoxScoreSum(lineupTwoBoxScore, 'ast')}
            </div>
            <div
                className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('orb') === 'lineupOne',
                })}
            >
                {getTeamBoxScoreSum(lineupOneBoxScore, 'orb')}
            </div>
            <div className="col-span-2 text-center py-4">Offensive Rebounds</div>
            <div
                className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('orb') === 'lineupTwo',
                })}
            >
                {getTeamBoxScoreSum(lineupTwoBoxScore, 'orb')}
            </div>
            <div
                className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('drb') === 'lineupOne',
                })}
            >
                {getTeamBoxScoreSum(lineupOneBoxScore, 'drb')}
            </div>
            <div className="col-span-2 text-center py-4">Defensive Rebounds</div>
            <div
                className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('drb') === 'lineupTwo',
                })}
            >
                {getTeamBoxScoreSum(lineupTwoBoxScore, 'drb')}
            </div>
            <div
                className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('trb') === 'lineupOne',
                })}
            >
                {getTeamBoxScoreSum(lineupOneBoxScore, 'trb')}
            </div>
            <div className="col-span-2 text-center py-4">Total Rebounds</div>
            <div
                className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('trb') === 'lineupTwo',
                })}
            >
                {getTeamBoxScoreSum(lineupTwoBoxScore, 'trb')}
            </div>
            <div
                className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('stl') === 'lineupOne',
                })}
            >
                {getTeamBoxScoreSum(lineupOneBoxScore, 'stl')}
            </div>
            <div className="col-span-2 text-center py-4">Steals</div>
            <div
                className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('stl') === 'lineupTwo',
                })}
            >
                {getTeamBoxScoreSum(lineupTwoBoxScore, 'stl')}
            </div>
            <div
                className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('blk') === 'lineupOne',
                })}
            >
                {getTeamBoxScoreSum(lineupOneBoxScore, 'blk')}
            </div>
            <div className="col-span-2 text-center py-4">Blocks</div>
            <div
                className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('blk') === 'lineupTwo',
                })}
            >
                {getTeamBoxScoreSum(lineupTwoBoxScore, 'blk')}
            </div>
            <div
                className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('tov') === 'lineupOne',
                })}
            >
                {getTeamBoxScoreSum(lineupOneBoxScore, 'tov')}
            </div>
            <div className="col-span-2 text-center py-4">Turnovers</div>
            <div
                className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('tov') === 'lineupTwo',
                })}
            >
                {getTeamBoxScoreSum(lineupTwoBoxScore, 'tov')}
            </div>
            <div
                className={classNames('col-span-1 text-start pl-3 md:pl-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('pf') === 'lineupOne',
                })}
            >
                {getTeamBoxScoreSum(lineupOneBoxScore, 'pf')}
            </div>
            <div className="col-span-2 text-center py-4">Team Fouls</div>
            <div
                className={classNames('col-span-1 text-end pr-3 md:pr-8 py-4', {
                    'text-yellow-400': evaluateStatWinner('pf') === 'lineupTwo',
                })}
            >
                {getTeamBoxScoreSum(lineupTwoBoxScore, 'pf')}
            </div>
        </div>
    );
};

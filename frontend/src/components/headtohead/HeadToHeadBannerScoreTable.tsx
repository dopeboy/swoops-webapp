import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { ProgressiveQuarters } from 'src/hooks/usePlayByPlay';

interface HeadToHeadBannerScoreTableProps {
    loading?: boolean;
    challengedTeamName: string;
    animateHeader: boolean;
    challengerTeamName: string;
    quarters: ProgressiveQuarters;
}
export const HeadToHeadBannerScoreTable: React.FC<HeadToHeadBannerScoreTableProps> = ({
    loading,
    animateHeader,
    challengedTeamName,
    challengerTeamName,
    quarters,
}) => {
    const [quarterScore, setQuarterScore] = useState<{
        Q1: { challenged_score: number; challenger_score: number };
        Q2: { challenged_score: number; challenger_score: number };
        Q3: { challenged_score: number; challenger_score: number };
        Q4: { challenged_score: number; challenger_score: number };
    }>({
        Q1: { challenged_score: 0, challenger_score: 0 },
        Q2: { challenged_score: 0, challenger_score: 0 },
        Q3: { challenged_score: 0, challenger_score: 0 },
        Q4: { challenged_score: 0, challenger_score: 0 },
    });

    const displayQuarterScore = (quarterKey: string): boolean => {
        if (quarterKey === 'Q1') return true;
        if (!quarterScore[quarterKey]) return false;
        return quarterScore[quarterKey].challenged_score !== 0 || quarterScore[quarterKey].challenger_score !== 0;
    };

    const calculateQuarterScore = (
        quarters: ProgressiveQuarters,
        quarterKey: 'Q1' | 'Q2' | 'Q3' | 'Q4'
    ): { challenged_score: number; challenger_score: number } => {
        if (quarters[quarterKey]?.plays?.length === 0) return;
        let challenged_score = 0;
        let challenger_score = 0;
        let previousQuarterScores = { challenged_score: 0, challenger_score: 0 };
        switch (quarterKey) {
            case 'Q1':
                challenged_score = quarters[quarterKey].currentScores.challenged_score;
                challenger_score = quarters[quarterKey].currentScores.challenger_score;
                break;
            case 'Q2':
                previousQuarterScores = quarters.Q1.currentScores;
                challenged_score = quarters[quarterKey].currentScores.challenged_score - previousQuarterScores.challenged_score;
                challenger_score = quarters[quarterKey].currentScores.challenger_score - previousQuarterScores.challenger_score;
                break;
            case 'Q3':
                previousQuarterScores = quarters.Q2.currentScores;
                challenged_score = quarters[quarterKey].currentScores.challenged_score - previousQuarterScores.challenged_score;
                challenger_score = quarters[quarterKey].currentScores.challenger_score - previousQuarterScores.challenger_score;

                break;
            case 'Q4':
                previousQuarterScores = quarters.Q3.currentScores;
                challenged_score = quarters[quarterKey].currentScores.challenged_score - previousQuarterScores.challenged_score;
                challenger_score = quarters[quarterKey].currentScores.challenger_score - previousQuarterScores.challenger_score;
                break;
        }
        return { challenged_score, challenger_score };
    };

    useEffect(() => {
        const Q1 = calculateQuarterScore(quarters, 'Q1');
        const Q2 = calculateQuarterScore(quarters, 'Q2');
        const Q3 = calculateQuarterScore(quarters, 'Q3');
        const Q4 = calculateQuarterScore(quarters, 'Q4');

        setQuarterScore({ Q1, Q2, Q3, Q4 });
    }, [quarters]);

    return (
        <div
            className={classNames('flex flex-col justify-center items-center h-full w-full', {
                hidden: animateHeader,
            })}
        >
            {!loading && (
                <table>
                    <thead>
                        <tr className="border-b border-off-black/16">
                            <th className="text-black font-bold uppercase text-left pl-2"></th>
                            <th
                                className={classNames('font-bold uppercase text-center px-3.5', {
                                    'text-black': displayQuarterScore('Q1'),
                                    'text-black/16': !displayQuarterScore('Q1'),
                                })}
                            >
                                1
                            </th>
                            <th
                                className={classNames('font-bold uppercase text-center px-3.5', {
                                    'text-black': displayQuarterScore('Q2'),
                                    'text-black/16': !displayQuarterScore('Q2'),
                                })}
                            >
                                2
                            </th>
                            <th
                                className={classNames('font-bold uppercase text-center px-3.5', {
                                    'text-black': displayQuarterScore('Q3'),
                                    'text-black/16': !displayQuarterScore('Q3'),
                                })}
                            >
                                3
                            </th>
                            <th
                                className={classNames('font-bold uppercase text-center px-3.5', {
                                    'text-black': displayQuarterScore('Q4'),
                                    'text-black/16': !displayQuarterScore('Q4'),
                                })}
                            >
                                4
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-black font-bold uppercase text-left pl-2">{challengedTeamName}</td>
                            <td className="text-black font-bold uppercase text-center px-3.5">{quarterScore.Q1?.challenger_score || 0}</td>
                            <td className="text-black font-bold uppercase text-center px-3.5">{quarterScore.Q2?.challenger_score || 0}</td>
                            <td className="text-black font-bold uppercase text-center px-3.5">{quarterScore.Q3?.challenger_score || 0}</td>
                            <td className="text-black font-bold uppercase text-center px-3.5">{quarterScore.Q4?.challenger_score || 0}</td>
                        </tr>
                        <tr>
                            <td className="text-black font-bold uppercase text-left pl-2">{challengerTeamName}</td>
                            <td className="text-black font-bold uppercase text-center px-3.5">{quarterScore.Q1?.challenged_score || 0}</td>
                            <td className="text-black font-bold uppercase text-center px-3.5">{quarterScore.Q2?.challenged_score || 0}</td>
                            <td className="text-black font-bold uppercase text-center px-3.5">{quarterScore.Q3?.challenged_score || 0}</td>
                            <td className="text-black font-bold uppercase text-center px-3.5">{quarterScore.Q4?.challenged_score || 0}</td>
                        </tr>
                    </tbody>
                </table>
            )}
            {loading && <div className="w-52 h-24 rounded-xl animate-pulse bg-gray-300"></div>}
        </div>
    );
};

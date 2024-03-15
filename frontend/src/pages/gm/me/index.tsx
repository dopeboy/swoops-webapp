import React, { useState, useEffect, ReactElement } from 'react';
import GameTable from 'src/components/gm/swoopsGm/GameTable';
import MainLayout from 'src/components/gm/common/MainLayout';
import { Leaderboard } from 'src/lib/gm/api/models/Leaderboard';
import { useRouter } from 'next/router';
import ClipLoader from 'react-spinners/ClipLoader';
import { getStatsByUserEmail } from 'src/lib/gm/customapi';
import { getUserDetail } from 'src/lib/utils';
import withAuth from 'src/components/common/withAuth';
import { HeadingDivider } from 'src/components/gm/common/HeadingDivider';
import { WinLossDonutChart } from 'src/components/gm/common/WinLossDonutChart';
import {
    AverageBudgetUsedLineChartWithFilters,
    AveragePointDifferentialLineChartWithFilters,
    GmGradeAreaChartWithFilters,
    GmGradeExplanation,
    HistoricalResultsStatsTracker,
    HistoricalResultsTwoChartLayout,
} from 'src/components/gm/historicalResults';
import { trackPageLanding } from 'src/lib/tracking';

const gmGradeAreaChartData = [
    {
        date: '01/22/22',
        'Average GM Grade': 21,
        'Your GM Grade': 13,
    },
    {
        date: '02/22/22',
        'Average GM Grade': 30,
        'Your GM Grade': 24,
    },
    {
        date: '03/22/22',
        'Average GM Grade': 13,
        'Your GM Grade': 26,
    },
    {
        date: '05/22/22',
        'Average GM Grade': 51,
        'Your GM Grade': 69,
    },
    {
        date: '07/22/22',
        'Average GM Grade': 81,
        'Your GM Grade': 76,
    },
    {
        date: '08/22/22',
        'Average GM Grade': 69,
        'Your GM Grade': 94,
    },
    {
        date: '10/22/22',
        'Average GM Grade': 81,
        'Your GM Grade': 76,
    },
    {
        date: '12/22/22',
        'Average GM Grade': 69,
        'Your GM Grade': 94,
    },
    {
        date: '01/22/23',
        'Average GM Grade': 21,
        'Your GM Grade': 13,
    },
    {
        date: '02/22/23',
        'Average GM Grade': 30,
        'Your GM Grade': 24,
    },
    {
        date: '03/22/23',
        'Average GM Grade': 13,
        'Your GM Grade': 26,
    },
    {
        date: '04/22/23',
        'Average GM Grade': 51,
        'Your GM Grade': 69,
    },
    {
        date: '07/27/23',
        'Average GM Grade': 81,
        'Your GM Grade': 76,
    },
    {
        date: '07/22/23',
        'Average GM Grade': 81,
        'Your GM Grade': 76,
    },
    {
        date: '08/20/23',
        'Average GM Grade': 69,
        'Your GM Grade': 94,
    },
    {
        date: '08/22/23',
        'Average GM Grade': 74,
        'Your GM Grade': 82,
    },
    {
        date: '09/12/23',
        'Average GM Grade': 68,
        'Your GM Grade': 73,
    },
    {
        date: '09/15/23',
        'Average GM Grade': 69,
        'Your GM Grade': 83,
    },
];

const winLossDonutChartData = [
    {
        name: 'Wins',
        winLoss: 74,
    },
    {
        name: 'Losses',
        winLoss: 12,
    },
];

const averagePointDifferentialLineChartData = [
    {
        date: '01/22/22',
        'Average Differential': 21,
        'Your Average Differential': 13,
    },
    {
        date: '02/22/22',
        'Average Differential': 30,
        'Your Average Differential': 24,
    },
    {
        date: '03/22/22',
        'Average Differential': 13,
        'Your Average Differential': 26,
    },
    {
        date: '05/22/22',
        'Average Differential': 51,
        'Your Average Differential': 69,
    },
    {
        date: '07/22/22',
        'Average Differential': 81,
        'Your Average Differential': 76,
    },
    {
        date: '08/22/22',
        'Average Differential': 69,
        'Your Average Differential': 94,
    },
    {
        date: '10/22/22',
        'Average Differential': 81,
        'Your Average Differential': 76,
    },
    {
        date: '12/22/22',
        'Average Differential': 69,
        'Your Average Differential': 94,
    },
    {
        date: '01/22/23',
        'Average Differential': 21,
        'Your Average Differential': 13,
    },
    {
        date: '02/22/23',
        'Average Differential': 30,
        'Your Average Differential': 24,
    },
    {
        date: '03/22/23',
        'Average Differential': 13,
        'Your Average Differential': 26,
    },
    {
        date: '04/22/23',
        'Average Differential': 51,
        'Your Average Differential': 69,
    },
    {
        date: '07/27/23',
        'Average Differential': 81,
        'Your Average Differential': 76,
    },
    {
        date: '07/22/23',
        'Average Differential': 81,
        'Your Average Differential': 76,
    },
    {
        date: '08/20/23',
        'Average Differential': 69,
        'Your Average Differential': 94,
    },
    {
        date: '08/22/23',
        'Average Differential': 74,
        'Your Average Differential': 82,
    },
    {
        date: '09/12/23',
        'Average Differential': 68,
        'Your Average Differential': 73,
    },
    {
        date: '09/15/23',
        'Average Differential': 69,
        'Your Average Differential': 83,
    },
];

const averageBudgetUsedLineChartData = [
    {
        date: '01/22/22',
        'Average Budget Used': 21,
        'Your Average Budget Used': 13,
    },
    {
        date: '02/22/22',
        'Average Budget Used': 30,
        'Your Average Budget Used': 24,
    },
    {
        date: '03/22/22',
        'Average Budget Used': 13,
        'Your Average Budget Used': 26,
    },
    {
        date: '05/22/22',
        'Average Budget Used': 51,
        'Your Average Budget Used': 69,
    },
    {
        date: '07/22/22',
        'Average Budget Used': 81,
        'Your Average Budget Used': 76,
    },
    {
        date: '08/22/22',
        'Average Budget Used': 69,
        'Your Average Budget Used': 94,
    },
    {
        date: '10/22/22',
        'Average Budget Used': 81,
        'Your Average Budget Used': 76,
    },
    {
        date: '12/22/22',
        'Average Budget Used': 69,
        'Your Average Budget Used': 94,
    },
    {
        date: '01/22/23',
        'Average Budget Used': 21,
        'Your Average Budget Used': 13,
    },
    {
        date: '02/22/23',
        'Average Budget Used': 30,
        'Your Average Budget Used': 24,
    },
    {
        date: '03/22/23',
        'Average Budget Used': 13,
        'Your Average Budget Used': 26,
    },
    {
        date: '04/22/23',
        'Average Budget Used': 51,
        'Your Average Budget Used': 69,
    },
    {
        date: '07/27/23',
        'Average Budget Used': 81,
        'Your Average Budget Used': 76,
    },
    {
        date: '07/22/23',
        'Average Budget Used': 81,
        'Your Average Budget Used': 76,
    },
    {
        date: '08/20/23',
        'Average Budget Used': 69,
        'Your Average Budget Used': 94,
    },
    {
        date: '08/22/23',
        'Average Budget Used': 74,
        'Your Average Budget Used': 82,
    },
    {
        date: '09/12/23',
        'Average Budget Used': 68,
        'Your Average Budget Used': 73,
    },
    {
        date: '09/15/23',
        'Average Budget Used': 69,
        'Your Average Budget Used': 83,
    },
];

const MyGames = (): ReactElement => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState(null);
    const [games, setGames] = useState<Leaderboard[]>([]);
    const [winLoss, setWinLoss] = useState([]);
    const [winLossPercentage, setWinLossPercentage] = useState(0);
    const [ptDiff, setPtDiff] = useState([]);
    const [budget, setBudget] = useState([]);

    useEffect(() => {
        if (!router.isReady) return;

        const fetchGames = async (): Promise<void> => {
            setIsLoading(true);
            const user = getUserDetail();
            try {
                const data: any = await getStatsByUserEmail(user.email);
                //const data: any = await getStatsByUserEmail('manish@playswoops.com');
                setGames(data.games);
                
                // WL
                setWinLoss([
                    {
                        name: 'Wins',
                        winLoss: data.wins,
                    },
                    {
                        name: 'Losses',
                        winLoss: data.losses,
                    },
                ])
                setWinLossPercentage((data.wins / (data.wins+data.losses)) * 100);
    
                // PT diff
                function isDatePresent(record) {
                    return record.date === this.globalDate
                }

                function formatDate(objectDate) {
                    let day = objectDate.getDate();
                    let month = objectDate.getMonth();
                    let year = objectDate.getFullYear()  % 100;
                    
                    return `${month+1}/${day}/${year}`; 
                }
                
                setPtDiff(
                    data.ptdiff_global.map((ptDiffRecord) => ({
                        date: formatDate(new Date(ptDiffRecord.date)),
                        'Average Differential': ptDiffRecord.pt_diff_avg,
                        'Your Average Differential': data.ptdiff_me.find(isDatePresent, {globalDate: ptDiffRecord.date}) ? data.ptdiff_me.find(isDatePresent, {globalDate: ptDiffRecord.date}).pt_diff : null
                    }))
                )
               
                // Budget
                setBudget(
                    data.budget_global.map((budgetRecord) => ({
                        date: formatDate(new Date(budgetRecord.date)),
                        'Average Budget Used': budgetRecord.budget_used_avg,
                        'Your Average Budget Used': data.budget_me.find(isDatePresent, {globalDate: budgetRecord.date}) ? data.budget_me.find(isDatePresent, {globalDate: budgetRecord.date}).budget_used : null
                    })) 
                )

                setError(null);
            } catch (err) {
                setError(err);
                console.error('Error getting games: ' + err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGames();
    }, [router.isReady]);

    useEffect(() => {
        trackPageLanding(`GM - Historical Results page`);
    }, []);

    if (error) {
        return (
            <MainLayout>
                <div className="md:h-[calc(100vh-88px)] h-[calc(100vh-50px)] flex items-center justify-center bg-black">
                    <div className="container-sm text-center">
                        <span className="text-[12px] leading-6 uppercase font-header font-bold md:heading-three text-white/64">No games found</span>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (isLoading) {
        return (
            <MainLayout>
                <div className="md:h-[calc(100vh-88px)] h-[calc(100vh-50px)] flex items-center justify-center bg-black">
                    <ClipLoader color="#FDFDFD" size={70} />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="dark flex flex-col md:min-h-[calc(100vh-88px)] min-h-[calc(100vh-50px)] bg-black py-5 md:py-14">
                <div className="container-md text-center">
                    <HeadingDivider title="My Stats" />
                    {/*
                    <HistoricalResultsStatsTracker />
                    <HeadingDivider title="Analytics" />
                    <GmGradeAreaChartWithFilters title="Average GM Grade" chartData={gmGradeAreaChartData} />
                    <GmGradeExplanation />
                    */}
                    {winLoss && ptDiff.length && budget.length &&
                    <>
                        <HistoricalResultsTwoChartLayout
                            firstSlot={
                                <WinLossDonutChart
                                    title="Win/Loss %"
                                    chartData={winLoss}
                                    label={`${winLossPercentage?.toFixed(1)}% won` || '0%'}
                                />
                            }
                            secondSlot={
                                <AveragePointDifferentialLineChartWithFilters
                                    title="Average Point Differential"
                                    chartData={ptDiff}
                                />
                            }
                        />
                        <AverageBudgetUsedLineChartWithFilters title="Average Budget Used" chartData={budget} />
                    </>
                    }
                    <HeadingDivider title="My Games" />
                    <GameTable games={games} />
                </div>
            </div>
        </MainLayout>
    );
};

export default withAuth(MyGames);

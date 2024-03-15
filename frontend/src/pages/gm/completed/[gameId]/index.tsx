import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, ReactElement } from 'react';
import { useRouter } from 'next/router';
import { ApiService } from 'src/lib/gm/api';
import ClipLoader from 'react-spinners/ClipLoader';
import TweetImage from 'src/components/gm/swoopsGm/TweetImage';
import MainLayout from 'src/components/gm/common/MainLayout';
import { HeadingDivider, PlayAgainButton, WinLossDonutChart } from 'src/components/gm/common';
import {
    BugetSpentBarChart,
    ChallengeTable,
    PointDifferentialLineChart,
    PostResultsStatTrackers,
    PostResultsTwoChartLayout,
} from 'src/components/gm/postResults';
import {
    GmGradeExplanation,
} from 'src/components/gm/historicalResults';
import { trackPageLanding } from 'src/lib/tracking';
import { getStatsForChallengeByGame } from 'src/lib/gm/customapi';

const budgetSpentChartData = [
    {
        budget: '$6',
        Lost: 0,
        Won: 1,
    },
    {
        budget: '$6',
        Lost: 8,
        Won: 2,
    },
    {
        budget: '$7',
        Lost: 7,
        Won: 3,
    },
    {
        budget: '$8',
        Lost: 5,
        Won: 4,
    },
    {
        budget: '$9',
        Lost: 3,
        Won: 7,
    },
    {
        budget: '$10',
        Lost: 19,
        Won: 34,
    },
    {
        budget: '$11',
        Lost: 16,
        Won: 84,
    },
    {
        budget: '$12',
        Lost: 11,
        Won: 89,
    },
    {
        budget: '$13',
        Lost: 5,
        Won: 95,
    },
];

const pointDifferentialChartData = [
    {
        pointDifference: -32,
        'Total Users': 21,
    },
    {
        pointDifference: -31,
        'Total Users': 21,
    },
    {
        pointDifference: -22,
        'Total Users': 30,
    },
    {
        pointDifference: -19,
        'Total Users': 30,
    },
    {
        pointDifference: -10,
        'Total Users': 13,
    },
    {
        pointDifference: -8,
        'Total Users': 8,
    },
    {
        pointDifference: -3,
        'Total Users': 23,
    },
    {
        pointDifference: -1,
        'Total Users': 51,
    },
    {
        pointDifference: 1,
        'Total Users': 51,
    },
    {
        pointDifference: 10,
        'Total Users': 81,
    },
    {
        pointDifference: 20,
        'Total Users': 69,
    },
];

const winLossDonutChartData = [
    {
        name: 'Wins',
        winLoss: 23,
    },
    {
        name: 'Losses',
        winLoss: 32,
    },
];

const GM21010 = (): ReactElement => {
    const router = useRouter();
    const { gameId } = router.query;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(undefined);
    const [resultImage, setResultImage] = useState(undefined);
    const [salaryCap, setSalaryCap] = useState(undefined);
    const [yourLineup, setYourLineup] = useState([]);
    const [enemyLineup, setEnemyLineup] = useState([]);
    const [yourLineupTotals, setYourLineupTotals] = useState({});
    const [enemyLineupTotals, setEnemyLineupTotals] = useState({});
    const players = yourLineup?.map((player) => player.player.full_name + '($' + player.price + ')').join(', ');
    const [winLoss, setWinLoss] = useState([]);
    const [winLossPercentage, setWinLossPercentage] = useState(0);
    const [ptDiff, setPtDiff] = useState([]);
    const [budget, setBudget] = useState([]);
    const [userWon, setUserWon] = useState(false);
    const [userSpent, setUserSpent] = useState(0);
    const [userPtDiff, setUserPtDiff] = useState(0);
    const [grade, setGrade] = useState('-');
    const [rank, setRank] = useState('-');
    const [streak, setStreak] = useState('-');
    const [totalEntrants, setTotalEntrants] = useState('-');

    useEffect(() => {
        if (!router.isReady) return;

        const fetchGame = async (): Promise<void> => {
            setIsLoading(true);
            try {
                const data: any = await ApiService.gameGenerateResultImage(gameId as string);
                setSalaryCap({
                    yourSalary: data.user_lineup.price,
                    enemySalary: data.challenge_lineup.price,
                });
                setResult(data.simulation.result);
                setResultImage(data.result_image);
                setYourLineupTotals({
                    ...data.simulation.result.user_lineup_box_score,
                });
                setEnemyLineupTotals({
                    ...data.simulation.result.challenge_lineup_box_score,
                });
                setYourLineup([
                    { ...data.simulation.result.user_player_1_box_score, ...data.user_lineup.player_1 },
                    { ...data.simulation.result.user_player_2_box_score, ...data.user_lineup.player_2 },
                    { ...data.simulation.result.user_player_3_box_score, ...data.user_lineup.player_3 },
                    { ...data.simulation.result.user_player_4_box_score, ...data.user_lineup.player_4 },
                    { ...data.simulation.result.user_player_5_box_score, ...data.user_lineup.player_5 },
                ]);
                setEnemyLineup([
                    { ...data.simulation.result.challenge_player_1_box_score, ...data.challenge_lineup.player_1 },
                    { ...data.simulation.result.challenge_player_2_box_score, ...data.challenge_lineup.player_2 },
                    { ...data.simulation.result.challenge_player_3_box_score, ...data.challenge_lineup.player_3 },
                    { ...data.simulation.result.challenge_player_4_box_score, ...data.challenge_lineup.player_4 },
                    { ...data.simulation.result.challenge_player_5_box_score, ...data.challenge_lineup.player_5 },
                ]);
                
                setUserWon(data.simulation.result.user_score > data.simulation.result.challenge_score)
                setUserPtDiff(data.simulation.result.user_score - data.simulation.result.challenge_score)
                setUserSpent(data.user_lineup.price)

                const statsData: any = await getStatsForChallengeByGame(gameId as string);
                
                // WL
                setWinLoss([
                    {
                        name: 'Wins',
                        winLoss: statsData.wins,
                    },
                    {
                        name: 'Losses',
                        winLoss: statsData.losses,
                    },
                ])
                setWinLossPercentage((statsData.wins / (statsData.wins+statsData.losses)) * 100);

                // PT diff
                setPtDiff(
                    statsData.ptdiff_challenge.map((ptDiffRecord) => ({
                        pointDifference: ptDiffRecord.pt_diff,
                        'Total Users': ptDiffRecord.magnitude
                    }))
                )

                // Budget
                setBudget(
                    statsData.budget_challenge.map((budgetRecord) => ({
                        budget: `${budgetRecord.budget_used}`,
                        Entries: budgetRecord.magnitude,
                    }))
                )

                // Rank
                setRank(statsData.rank.toString())
                
                // Letter grade
                setGrade(statsData.grade)
                
                // Total entrants
                setTotalEntrants(statsData.total_entrants)
                
                // Streak
                setStreak(statsData.streak)

                setError(null);
            } catch (err) {
                setResult(undefined);
                setResultImage(undefined);
                setSalaryCap(undefined);
                setYourLineup([]);
                setEnemyLineup([]);
                setError(err);
                console.error('Error getting players: ' + err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGame();
    }, [router.isReady]);

    useEffect(() => {
        trackPageLanding(`GM - Post results page`);
    }, []);

    if (isLoading) {
        return (
            <MainLayout>
                <div className="md:h-[calc(100vh-88px)] h-[calc(100vh-50px)] flex items-center justify-center bg-black">
                    <ClipLoader color="#FDFDFD" size={70} />
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="md:h-[calc(100vh-88px)] h-[calc(100vh-50px)] flex items-center justify-center bg-black">
                    <div className="container-sm text-center">
                        <span className="text-[12px] leading-6 uppercase font-header font-bold md:heading-three text-white/64">
                            An error occurred getting game data
                        </span>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="flex flex-col bg-black py-5 md:py-12 dark">
                <div className="container-md">
                    <div className="flex items-center justify-center w-full sm:mb-6 mb-1.5">
                        <PlayAgainButton />
                    </div>
                    <PostResultsStatTrackers grade={grade} rank={rank} streak={streak} totalEntrants={totalEntrants}/>
                    {/* <GmGradeExplanation /> */}
                    <TweetImage
                        status={result?.is_user_winner ? 'win' : 'loss'}
                        gameUrl={window.location.href}
                        imageUrl={resultImage}
                        players={players}
                    />
                    <HeadingDivider title="Analytics" />
                    {ptDiff && budget && winLoss && 
                        <>
                            <PointDifferentialLineChart
                                title="Point Differential VS Community"
                                chartData={ptDiff}
                                userPointDifferential={userPtDiff}
                            />
                            <PostResultsTwoChartLayout
                                firstSlot={<BugetSpentBarChart title="Budget Spent VS Community" chartData={budget} userBudget={userSpent} />}
                                secondSlot={
                                    <WinLossDonutChart
                                        title="Community Win/Loss %"
                                        label={`${winLossPercentage?.toFixed(1)}% won` || '0% won'}
                                        chartData={winLoss}
                                        result={`${userWon ? 'Win' : 'Loss'}`}
                                    />
                                }
                            />
                        </>
                    }
                    <HeadingDivider title="Box Score" />
                    <ChallengeTable
                        salaryCap={salaryCap}
                        yourLineupTotals={yourLineupTotals}
                        enemyLineupTotals={enemyLineupTotals}
                        yourLineup={yourLineup}
                        enemyLineup={enemyLineup}
                    />
                    <div className="flex items-center justify-center w-full mt-6 mb-12">
                        <PlayAgainButton />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default GM21010;

import React, { useState, useEffect, ReactElement } from 'react';
import LeaderboardTable from 'src/components/gm/swoopsGm/LeaderboardTable';
import MainLayout from 'src/components/gm/common/MainLayout';
import { Leaderboard } from 'src/lib/gm/api/models/Leaderboard';
import { ApiService } from 'src/lib/gm/api';
import { useRouter } from 'next/router';
import ClipLoader from 'react-spinners/ClipLoader';
// import analytics from 'src/lib/analytics';

const Leaderboard = (): ReactElement => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState(null);
    const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
    const [partnerSlug, setPartnerSlug] = useState<string>('');

    useEffect(() => {
        if (!router.isReady) return;
        const { slug } = router.query;

        if (slug) setPartnerSlug(slug[0]);

        const fetchLeaderboard = async (): Promise<void> => {
            setIsLoading(true);
            try {
                const data: any = await ApiService.apiGameLeaderboard(slug ? slug[0] : null);
                setLeaderboard(data.results);
                setError(null);
            } catch (err) {
                setError(err);
                console.error('Error getting leaderboard: ' + err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
        // analytics.page({
        //     name: 'Leaderboard',
        // });
    }, [router.isReady]);

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
            <div className="flex flex-col md:min-h-[calc(100vh-88px)] min-h-[calc(100vh-50px)] bg-black py-5 md:py-14">
                <div className="container-md text-center">
                    {!partnerSlug && 
                        <>
                            <span className="flex-wrap text-[22px] uppercase font-header font-bold text-white">SWOOPS/GM MONTHLY CHALLENGE</span>
                            <br />
                            <span className="flex-wrap text-[22px] uppercase font-header font-bold text-white">MONTH OF SEPTEMBER LEADERBOARD</span>
                            <p className="font-display font-medium md:font-semibold md:text-lg text-[12px] text-white/64 mt-2 md:mt-3.5">Challenge ends September 31st at 5 pm PT. Winners are determined by win total with ties respectively broken by win % and point differential.</p>
                            <ul className="font-display font-medium md:font-semibold md:text-lg text-[12px] text-white/64 mt-2 md:mt-3.5">
                                <ol>• 1st Place: $100</ol>
                                <ol>• 2nd Place: $70</ol>
                                <ol>• 3rd Place: $50</ol>
                                <ol>• 4th Place: $30</ol>
                                <ol>• 5th Place: $20</ol>
                            </ul>
                        </>
                    }
                    <br />
                    <LeaderboardTable leaderboards={leaderboard} />
                </div>
            </div>
        </MainLayout>
    );
};

export default Leaderboard;
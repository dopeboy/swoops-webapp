import React, { useState, useEffect, ReactElement } from 'react';
import DailyChallenge from 'src/components/gm/swoopsGm/DailyChallenge';
import TweetImage from 'src/components/gm/swoopsGm/TweetImage';
import ScheduleCard from 'src/components/gm/swoopsGm/ScheduleCard';
import MainLayout from 'src/components/gm/common/MainLayout';
import { ApiService } from 'src/lib/gm/api';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import WonCard from 'src/components/gm/tournamentDetail/WonCard';
import ClipLoader from 'react-spinners/ClipLoader';
import { LineupSubmittedModal } from 'src/components/gm/lineupSubmitted/LineupSubmittedModal';
import { trackPageLanding } from 'src/lib/tracking';
import { getStreakByUser } from 'src/lib/gm/customapi';
import { getUserDetail } from 'src/lib/utils';

const GM21020 = (): ReactElement => {
    const router = useRouter();
    const { gameId } = router.query;
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [players, setPlayers] = useState('');
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (!router.isReady) return;

        const fetchGame = async (): Promise<void> => {
            setIsLoading(true);
            try {
                const data: any = await ApiService.gameGenerateLineupImage(gameId as string);
                const stateYourLineup = [
                    { ...data.user_lineup.player_1 },
                    { ...data.user_lineup.player_2 },
                    { ...data.user_lineup.player_3 },
                    { ...data.user_lineup.player_4 },
                    { ...data.user_lineup.player_5 },
                ];
                const statePlayers = stateYourLineup.map((player) => player.player.full_name + '($' + player.price + ')').join(', ');
                setPlayers(statePlayers);
                setData(data);
                
                const user = getUserDetail();
                // TODO - this exception shouldn't happen. Need to pass
                // JWT so that it can create user if it doesn't exist.
                try {
                    const streakData: any = await getStreakByUser(user.email as string);
                    setStreak(streakData.streak)
                }
                
                catch (err) {
                    setStreak(0)
                }

                setOpenModal(true)
                setError(null);
            } catch (err) {
                setPlayers('');
                setData(null);
                setError(err);
                console.error('Error getting game: ' + err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGame();
    }, [router.isReady]);

    useEffect(() => {
        trackPageLanding(`GM - Lineup submitted page`);
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
            <LineupSubmittedModal isOpen={openModal} setOpenModal={setOpenModal} streak={streak}/>
            <div className="flex flex-col bg-black pt-5 md:py-12">
                <div className="container-md">
                    <DailyChallenge date={data?.challenge.date} title={data?.challenge.description} />
                    <WonCard
                        title="Lineup Submitted"
                        summary={
                            <>
                                <p className="my-3">You'll be notified via Email or SMS text at 9:30pm EST tonight.</p>
                                <p>All winners will be announced on Twitter @PlaySwoopsGM at 12:00pm EST tomorrow.</p>
                            </>
                        }
                        size="medium"
                        mb="md:mb-12"
                    />
                    <TweetImage status="lineup" imageUrl={data?.lineup_image} players={players} gameUrl={'Come play at https://gm.playswoops.com'} />
                    <ScheduleCard
                        challengerPoint="-"
                        challengerTeam="Challenge team"
                        challengedPoint="-"
                        challengedTeam="Your lineup"
                        time="Email/SMS Texts to Winners at 9:30PM EST"
                    />
                </div>
            </div>
            {/* 
            9/7/23 - DISABLING
            <SubmitLineupModal open={openModal} setOpen={setOpenModal} />
            */}
        </MainLayout>
    );
};

export default GM21020;

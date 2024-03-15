import { ReactElement, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import 'rc-tabs/assets/index.css';
import { ApiService, PlayerV2, Team, AccountsService } from 'src/lib/api';
import { getUserDetail } from 'src/lib/utils';
import { TutorialProgress } from 'src/components/common/TutorialProgress';
import Confetti from 'react-dom-confetti';
import { toast } from 'react-toastify';
import PlayerService from 'src/services/PlayerService';
import { trackEvent } from '../../lib/tracking';

const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_IMAGE_BASEURL;
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener('resize', handleResize);

        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

const TutotialIntro = (): ReactElement => {
    const router = useRouter();
    const [loadingTutorial, setLoadingTutorial] = useState<boolean>(true);
    const [player, setPlayer] = useState<PlayerV2>(null);
    const [revealed, setRevealed] = useState(false);
    const windowSize = useWindowSize();
    const isMobile = windowSize.width < 768;

    const confettiConfig = {
        spread: isMobile ? 180 : 360,
        elementCount: isMobile ? 50 : 100,
        width: isMobile ? '5px' : '10px',
        height: isMobile ? '5px' : '10px',
        angle: 90,
        startVelocity: 50,
        dragFriction: 0.12,
        duration: 3000,
        stagger: 3,
        colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
    };

    const [videoEnded, setVideoEnded] = useState<boolean>(false);

    const handleVideoEnd = async () => {
        setVideoEnded(true);
        const user = await getUserDetail();
        //AccountsService.accountsPartialUpdate(user.id.toString(), { tutorial: { completed_step_number: 100 } });
    };

    const checkTutorial = async () => {
        const userId = await getUserDetail().id;
        const user = await AccountsService.accountsRead(userId.toString());
        if (user.tutorial?.completed_at !== null) {
            router.push('/locker-room');
        }
    };

    useEffect(() => {
        checkTutorial();
        if (isMobile) {
            handleVideoEnd();
        } else {
            const video = document.getElementById('tutorialVideo') as HTMLVideoElement;
            if (video) {
                video.addEventListener('ended', handleVideoEnd, false);
            }

            return () => {
                if (video) {
                    video.removeEventListener('ended', handleVideoEnd, false);
                }
            };
        }
    }, []);

    useEffect(() => {
        getPlayers();
    }, [router.isReady]);

    const getPlayers = async () => {
        const rosterPlayers = (await PlayerService.getPlayerRoster(getUserDetail()?.team?.id)) as PlayerV2[];
        setPlayer(rosterPlayers.find((p) => p?.kind === PlayerV2.kind.OFF_CHAIN));
        if (!rosterPlayers.find((p) => p?.kind === PlayerV2.kind.OFF_CHAIN)) {
            trackEvent(`Offchain player missed`);
            router.push('/locker-room');
        }
    };

    const handleClick = () => {
        setRevealed(true);
    };

    const goToLineup = async () => {
        const user = await getUserDetail();
        //AccountsService.accountsPartialUpdate(user.id.toString(), { tutorial: { completed_step_number: 200 } });
        router.push('/gamelobby-tutorial/roster');
    };

    const skipTutorial = async () => {
        setLoadingTutorial(true);
        const user = await getUserDetail();
        try {
            //await AccountsService.accountsPartialUpdate(user.id.toString(), { tutorial: { skip_tutorial: true, completed_step_number: 100 } });
            setLoadingTutorial(false);
            router.push('/locker-room');
        } catch (e) {
            setLoadingTutorial(false);
            toast.error('Error skipping tutorial');
        }
    };

    useEffect(() => {
        if (revealed) {
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                document.body.style.overflow = 'auto';
            }, 4000);
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [revealed]);

    return (
        <>
            <TutorialProgress currentStep={0} />
            <div>
                {!videoEnded && !isMobile ? (
                    <video
                        id="tutorialVideo"
                        autoPlay
                        src="/videos/intro.mp4"
                        muted
                        playsInline
                        className="fixed top-0 left-0 w-screen h-screen object-cover z-50"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-8 mt-6 sm:mt-10 px-4 sm:px-0 fade-in">
                        <h1 className="text-xl sm:text-2xl font-bold text-white heading-one">{!revealed ? 'Unlock your Swoopster' : 'UNLOCKED!'}</h1>
                        <p className="text-center text-white sm:w-[700px] px-4 sm:px-0">
                            {revealed ? (
                                <>
                                    <div className="subheading-one text-assist-green">Congrats! You now have your very first Swoopster!</div> <br />{' '}
                                    This Swoopster is now yours to compete with, but ownership has not been transferred…yet! Once you finish the NEW
                                    OWNER TUTORIAL and complete an in-game challenge, ownership changes hands and this free agent Swoopster becomes
                                    100% yours. Sell, trade, or play; as its rightful owner, what you do with it will be up to you!
                                </>
                            ) : (
                                <>
                                    Welcome to the Swoops virtual basketball league! <br />
                                    You are THIS close to owning and operating your own franchise.
                                    {/* To get into the action you will need a player, also known as a Swoopster! Let's get you started with your
                                    very own Swoopster now! <b> CLICK REVEAL BELOW</b>.{' '} */}
                                </>
                            )}
                        </p>
                        <img
                            src={revealed ? `${imageBaseUrl}${player?.token}.png?auto=format&width=300` : 'images/offchain.png'}
                            alt="Some description"
                            className="w-full sm:w-[400px]"
                            width={200}
                        />
                        <div className="fixed bottom-4 bg-black flex flex-col gap-4">
                            <p className="text-center text-white sm:w-[700px] px-4 sm:px-0">
                                {revealed ? (
                                    <>
                                        The community will tell you, the best way to learn more about your Swoopster is by getting them on the court!
                                        What do you say we enter a game? <b>SELECT ENTER A GAME TO CONTINUE</b>
                                    </>
                                ) : (
                                    <>Click the button below to claim your free agent and get started.</>
                                )}
                            </p>
                            <div className="flex justify-center">
                                {revealed ? (
                                    <button className="btn-rounded-green w-60" onClick={goToLineup}>
                                        Enter a Game
                                    </button>
                                ) : (
                                    <button className="btn-rounded-green px-4 sm:px-4 w-60" onClick={handleClick}>
                                        Claim Free Agent
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <Confetti active={revealed && !isMobile} config={confettiConfig} />
                </div>
            </div>
        </>
    );
};

export default TutotialIntro;

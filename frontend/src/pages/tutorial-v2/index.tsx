import { ReactElement, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import PlayerService from 'src/services/PlayerService';
import { getUserDetail } from 'src/lib/utils';
import { ApiService, PlayerV2, Team, AccountsService } from 'src/lib/api';
import { PlayerBackCard } from 'src/components/playerDetail/PlayerBackCard';
import withAuth from 'src/components/common/withAuth';

const TutorialV2 = (): ReactElement => {
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [player, setPlayer] = useState<PlayerV2>(null);
    const router = useRouter();
    const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_IMAGE_BASEURL;

    const updateCurrentSlide = (index) => {
        if (currentSlide !== index) {
            setCurrentSlide(index)
        }
       
    };

    const next = async () => {
        if (currentSlide == 7) {
            const userId = await getUserDetail().id;
            await AccountsService.accountsPartialUpdate(userId.toString(), { tutorial: { skip_tutorial: true } });
            router.push('/games/open');
        }
        setCurrentSlide(currentSlide + 1)
    };

    const getPlayers = async () => {
        const rosterPlayers = (await PlayerService.getPlayerRoster(getUserDetail()?.team?.id)) as PlayerV2[];
        setPlayer(rosterPlayers.find((p) => p?.kind === PlayerV2.kind.OFF_CHAIN));
        /*
        if (!rosterPlayers.find((p) => p?.kind === PlayerV2.kind.OFF_CHAIN)) {
            router.push('/locker-room');
        }
        */
    };

    useEffect(() => {
        getPlayers();
    }, [router.isReady]);
    
    return (
        <div className="bg-[url('/images/tutorial-v2/bg.jpg')]">
            <div className="hidden md:block">
                <Carousel selectedItem={currentSlide} onClickItem={next} onChange={updateCurrentSlide} showArrows={true} showThumbs={false} emulateTouch={true} showStatus={false}>
                <div className="flex justify-center pb-9 h-screen" >
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/desktop/1.png" alt="" />
                    </div>
                    <div className="static flex justify-center  pb-9 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/desktop/2.png" alt="" />
                        <div className="absolute top-[28%]">
                            <div className="h-[45vh]">
                                <img
                                    src={`${imageBaseUrl}${player?.token}.png?auto=format`}
                                    alt="Some description"
                                    className="h-full"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center  pb-9 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/desktop/3.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-9 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/desktop/4.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-9 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/desktop/5.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-9 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/desktop/6.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-9 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/desktop/7.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-9 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/desktop/8.png" alt="" />
                    </div>
                </Carousel>
            </div>
            <div className="md:hidden">
                <Carousel selectedItem={currentSlide} onClickItem={next} onChange={updateCurrentSlide} showArrows={true} showThumbs={false} emulateTouch={true} showStatus={false}>
                    <div className="flex justify-center  pb-16 h-screen" >
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/mobile/1.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-16 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/mobile/2.png" alt="" />
                        <div className="absolute top-[25%]">
                            <img
                                src={`${imageBaseUrl}${player?.token}.png?auto=format`}
                                alt="Some description"
                                className="w-[200px] h-[200px]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-center  pb-16 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/mobile/3.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-16 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/mobile/4.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-16 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/mobile/5.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-16 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/mobile/6.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-16 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/mobile/7.png" alt="" />
                    </div>
                    <div className="flex justify-center  pb-16 h-screen">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/tutorial-v2/mobile/8.png" alt="" />
                    </div>
                </Carousel>
            </div>
        </div>
    );
};

export default withAuth(TutorialV2);
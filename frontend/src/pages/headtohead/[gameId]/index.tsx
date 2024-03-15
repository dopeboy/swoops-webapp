import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AuthedLayout from 'src/components/common/AuthedLayout';
import withAuth from 'src/components/common/withAuth';
import InfoCards from 'src/components/headtohead/InfoCards';
import { HeadToHeadHeader } from 'src/components/headtohead/HeadToHeadHeader';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import { ApiService, Game } from 'src/lib/api';
import { trackPageLanding } from '../../../lib/tracking';

const Games = (): ReactElement => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [joinedCount] = useState<number>(1);
    const [game, setGame] = useState<Game>();

    const getInitialData = async (): Promise<void> => {
        await getGame();
    };

    const getGame = async (): Promise<void> => {
        try {
            // TODO - update teamId when we have Team ID on front-end
            const { gameId } = router.query;
            const game = await ApiService.apiGameRead(gameId.toString());
            setGame(game);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.error('Error getting players: ' + err);
        }
    };

    useEffect(() => {
        if (!router.isReady) return;
        trackPageLanding(`Head-to-head`);
        getInitialData();
    }, [router.isReady]);

    return (
        <PageLoadingWrapper loading={loading}>
            <AuthedLayout>
                <div className="h-screen bg-black w-screen ">
                    <HeadToHeadHeader date={game?.contest?.played_at} />
                    <div className="px-36">
                        <InfoCards joinedCount={joinedCount} />
                        <div className="dark:border-white/4 border-2 box-border rounded-lg h-[480px]">
                            <div className="flex flex-row">
                                <img
                                    className="relative top-[-30px] inline-block"
                                    src="../../../images/headtoheadmain.png"
                                    width={625}
                                    height={547}
                                    alt="Head to Head main"
                                />
                                <div>
                                    <span className="float-right heading-one text-white top-[35%] relative "> Ready to play? </span>
                                    <div className="text-white/64 relative top-[35%]">Assemble your lineup and win big</div>
                                    <button
                                        className="btn bg-assist-green top-[39%] relative"
                                        onClick={() => router.push('/headtohead/somegameid/lobby')}
                                    >
                                        Join game
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthedLayout>
        </PageLoadingWrapper>
    );
};

export default withAuth(Games);

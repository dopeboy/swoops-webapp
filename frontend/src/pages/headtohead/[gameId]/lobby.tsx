import { ReactElement, useEffect, useState } from 'react';
import AuthedLayout from 'src/components/common/AuthedLayout';
import withAuth from 'src/components/common/withAuth';
import InfoCards from 'src/components/headtohead/InfoCards';
import { HeadToHeadHeader } from 'src/components/headtohead/HeadToHeadHeader';
import { useRouter } from 'next/router';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import classNames from 'classnames';
import { CurrentLineup } from 'src/components/gamelobby/CurrentLineup';
import { ApiService, Game } from 'src/lib/api';
import { EmptyRosterPlayer } from 'src/lib/utils';
import { trackEvent } from '../../../lib/tracking';

const emptyRosterState = [EmptyRosterPlayer, EmptyRosterPlayer, EmptyRosterPlayer, EmptyRosterPlayer, EmptyRosterPlayer];

const Games = (): ReactElement => {
    const router = useRouter();
    const [selectedPlayers] = useState(emptyRosterState);
    const [joinedCount] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
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
        getInitialData();
    }, [router.isReady]);

    return (
        <PageLoadingWrapper loading={loading}>
            <AuthedLayout>
                <div className="h-full flex flex-col bg-black w-screen pb-32">
                    <HeadToHeadHeader date={game?.contest?.played_at} />
                    <div className="px-36">
                        <InfoCards joinedCount={joinedCount} />
                        <div className="flex flex-row items-center justify-between">
                            <div className="heading-three text-white">Your Lineup</div>
                            <div className="flex flex-row justify-end gap-2">
                                <button
                                    onClick={() => {
                                        trackEvent('Edit lineup clicked');
                                        router.push('/gamelobby');
                                    }}
                                    className="btn-rounded-white align-top"
                                >
                                    Edit Lineup
                                </button>
                                <button
                                    onClick={() => router.push('/gamelobby')}
                                    className={classNames('btn-rounded-green align-top', {
                                        'opacity-100': joinedCount >= 2,
                                        'opacity-10': joinedCount < 2,
                                    })}
                                >
                                    Start Game
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between">
                            <CurrentLineup tokensRequired={5} selectedPlayers={selectedPlayers} showOnlyLineup={true} />
                        </div>
                    </div>
                </div>
            </AuthedLayout>
        </PageLoadingWrapper>
    );
};

export default withAuth(Games);

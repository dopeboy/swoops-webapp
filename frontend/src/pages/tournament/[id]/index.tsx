import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import { ApiService } from 'src/lib/api';
import { trackPageLanding } from 'src/lib/tracking';

const TournamentIndex: NextPage<{ id: string }> = ({ id }) => {
    const router = useRouter();
    const { redirectToLineup, reservationId, tournamentF2P } = router.query;

    const reroute = async (): Promise<void> => {
        try {
            const tournament = await ApiService.apiGameTournamentRead(id.toString());

            if (!tournament) {
                router.push('/404');
                return;
            }
            const rounds = tournament.rounds.length;
            router.push(
                `/tournament/${tournament.id}/${redirectToLineup === 'true' ? 'line-up-roster' : 'bracket'}/${Math.pow(2, rounds) || 64}${
                    reservationId ? `?reservationId=${reservationId}${tournamentF2P ? '&tournamentF2P=true' : ''}` : ''
                }`
            );
        } catch {
            console.error('Error while fetching tournament');
            router.push('/404');
        }
    };

    useEffect(() => {
        if (!router.isReady) return;
        trackPageLanding(`Tournament Index`);
        reroute();
    }, [router.isReady]);

    return (
        <PageLoadingWrapper loading>
            <></>
        </PageLoadingWrapper>
    );
};

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const { id } = context.params;
    if (!id) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            id,
        },
    };
};

export default TournamentIndex;

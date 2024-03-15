import { ReactElement, useState, useEffect } from 'react';
import { LayoutDecider } from 'src/components/common/LayoutDecider';
import 'rc-tabs/assets/index.css';
import { TableNavBar } from 'src/components/common/TableNavBar';
import { TournamentGameSection } from 'src/components/tournaments/gameSection/TournamentGameSection';
import { ApiService, TournamentDetail } from 'src/lib/api';
import { TournamentBracketSection } from 'src/components/tournaments/bracketSection/TournamentBracketSection';
import { TournamentLineupSection } from 'src/components/tournaments/lineupSection/TournamentLineupSection';
import { TournamentPageHeader } from 'src/components/tournaments/TournamentPageHeader';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PageLoadingWrapper } from 'src/components/common/PageLoadingWrapper';
import { TeamElegibleModal } from 'src/components/tournaments/lineupSection/TeamElegibleModal';

const Tournament: NextPage = (): ReactElement => {
    const [tournament, setTournament] = useState<TournamentDetail>();
    const [loading, setLoading] = useState<boolean>(true);
    const [roundAmount, setRoundAmount] = useState<number>();
    const [openElegibleModal, setOpenElegibleModal] = useState(false);
    const router = useRouter();
    const { id, section, round: queryRound } = router.query;
    const [round, setRound] = useState<string | string[]>(queryRound);
    const getTournament = async (): Promise<void> => {
        try {
            setLoading(true);
            const swooperBowl = await ApiService.apiGameTournamentRead(id.toString() || '1');
            // const swooperBowl = testData;

            setRoundAmount(swooperBowl.rounds.length);
            const seriesAmount = swooperBowl.rounds[0].series.length;
            // router.push({ pathname: `/tournament/${id}/${section}/${seriesAmount * 2 || 64}` }, undefined, { shallow: true });
            setRound((seriesAmount * 2 || 64).toString());
            setTournament(swooperBowl);

        } catch (error) {
            router.push({ pathname: `/404` });
        } finally {
            setLoading(false);
        }
    };

    const routesToUse = [
        { title: 'Bracket', path: `/tournament/${id}/bracket/${round || 64}`, section: 'bracket' },
        { title: 'Series', path: `/tournament/${id}/series/${round || 64}`, section: 'series' },
        { title: 'Lineup', path: `/tournament/${id}/line-up-roster/${round || 64}`, section: 'line-up-roster' },
    ];

    useEffect(() => {
        if (router.isReady) {
            if (queryRound && typeof queryRound === 'string') {
                if (Number(queryRound) > tournament?.rounds[0]?.series?.length * 2) {
                    setRound((tournament.rounds[0].series.length * 2).toString());
                    return;
                }
            }
            setRound(queryRound);
        }
    }, [router.isReady, queryRound]);

    useEffect(() => {
        if (router.isReady) {
            getTournament();
        }
    }, [router.isReady]);

    return (
        <PageLoadingWrapper loading={loading}>
            <LayoutDecider>
                <TournamentPageHeader roundAmount={roundAmount} tournament={tournament} />
                <div className="h-12 z-50 relative bg-inherit" />
                <div className="pl-2 sm:pl-12 flex z-50 relative bg-inherit">
                    {section && (
                        <>
                            <TableNavBar routesToUse={routesToUse} />
                        </>
                    )}
                </div>
                <div className="h-full flex bg-black">
                    <TournamentGameSection
                        id={id}
                        roundAmount={roundAmount}
                        tournament={tournament}
                        round={round}
                        shouldDisplay={section === 'series'}
                    />
                    <TournamentBracketSection
                        id={id}
                        roundAmount={roundAmount}
                        tournament={tournament}
                        round={round}
                        shouldDisplay={section === 'bracket'}
                    />
                    <TournamentLineupSection
                        showElegibleModal={() => setOpenElegibleModal(true)}
                        roundAmount={roundAmount}
                        id={id}
                        tournament={tournament}
                        round={round}
                        shouldDisplay={section === 'line-up-roster'}
                    />
                    <TeamElegibleModal open={openElegibleModal} id={id} round={round} />
                </div>
            </LayoutDecider>
        </PageLoadingWrapper>
    );
};

export default Tournament;

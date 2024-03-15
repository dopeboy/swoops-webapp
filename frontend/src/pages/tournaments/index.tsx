import { ReactElement, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LayoutDecider } from 'src/components/common/LayoutDecider';
import 'rc-tabs/assets/index.css';
import PageHeader from '../../components/common/PageHeader';
import { ApiService, TournamentListing } from 'src/lib/api';
import { getUserDetail } from 'src/lib/utils';
import { Helmet } from 'react-helmet';
import TourneyTable from 'src/components/tournament/TourneyTable';
import MobileTourneyTable from 'src/components/tournament/MobileTourneyTable';
import { TableNavBar } from 'src/components/common/TableNavBar';
import PlayerService, { ReadonlyPlayer } from 'src/services/PlayerService';
import { MaxSwoopstersButtonGroup } from 'src/components/court/MaxSwoopstersButtonGroup';
import { toast } from 'react-toastify';

const Stats = (): ReactElement => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [tournaments, setTournaments] = useState<TournamentListing[]>([]);
    const [pageTournaments, setPageTournaments] = useState<number>(1);
    const [status, setStatus] = useState<string>('OPEN');
    const [userOwnedPlayerAmount, setUserOwnedPlayerAmount] = useState<number>(0);
    const [tokensRequired, setTokensRequired] = useState<number>(5);
    const [tokenGatedTournaments, setTokenGatedTournaments] = useState<TournamentListing[]>([]);

    const routesToUse = [
        { title: 'Open', path: 'open', section: 'OPEN' },
        { title: 'Completed', path: 'completed', section: 'COMPLETE' },
    ];

    useEffect(() => {
        if (router.isReady) {
            setPageTournaments(1);
            setTournaments([]);
            setTokenGatedTournaments([]);
            getTournaments('OPEN');
        }
    }, [router.isReady]);

    useEffect(() => {
        verifyUserOwnsAtLeastOnePlayer();
    }, []);

    const getTournaments = async (status: string): Promise<void> => {
        setLoading(true);
        try {
            const { results: tournamentsResults } = await ApiService.apiGameTournamentList(status, TournamentListing.kind.IN_SEASON, null);
            setPageTournaments(pageTournaments + 1);
            setTournaments(tournamentsResults);
            setLoading(false);
        } catch (err) {
            console.error('Error getting tournaments: ' + err);
        }
    };

    const getOwnedPlayers = async (): Promise<ReadonlyPlayer[]> => {
        const teamId = getUserDetail()?.team?.id;
        if (!teamId) {
            toast.error('You must have a team to join a Tournament. If you are a team owner, please signin.');
            return [];
        }
        return PlayerService.getPlayerRoster(teamId);
    };

    const verifyUserOwnsAtLeastOnePlayer = async (): Promise<void> => {
        try {
            const ownedPlayers = await getOwnedPlayers();
            if (ownedPlayers.length === 0) {
                toast.warning('You must have players to join a game. If you are a team owner, please signin.');
            }
            setUserOwnedPlayerAmount(ownedPlayers.length);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const filteredTournaments = tournaments.filter((t) => !t?.tokens_required || t.tokens_required === tokensRequired);
        setTokenGatedTournaments(filteredTournaments);
    }, [tokensRequired]);

    useEffect(() => {
        const filteredTournaments = tournaments.filter((t) => !t?.tokens_required || t.tokens_required === tokensRequired);
        setTokenGatedTournaments(filteredTournaments);
    }, [tournaments]);

    return (
        <LayoutDecider>
            <Helmet>
                <title> Tournaments | Swoops</title>
            </Helmet>
            <PageHeader title="Tournaments" />
            <div className="h-12" />
            <div className="pl-0 sm:pl-12 sm:pr-10 pr-0">
                <div className="flex justify-between">
                    <TableNavBar
                        routesToUse={routesToUse}
                        useRoutes={false}
                        changeTab={(tab) => {
                            setStatus(tab);
                            setTokenGatedTournaments([]);
                            setPageTournaments(1);
                            setTournaments([]);
                            getTournaments(tab);
                        }}
                    />
                    {status === 'OPEN' && !loading && (
                        <div className="-mt-4">
                            <MaxSwoopstersButtonGroup
                                userOwnedPlayerAmount={userOwnedPlayerAmount}
                                tokensRequired={tokensRequired}
                                onClick={(selectedOption: number) => {
                                    setTokensRequired(selectedOption);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="dark">
                {/* <InfiniteScroll
                    dataLength={tournaments.length}
                    next={() => getTournaments(status, pageTournaments)}
                    hasMore={true}
                    loader={<h4></h4>}
                > */}

                {status === 'OPEN' ? (
                    <>
                        <TourneyTable
                            open={true}
                            loadingTournaments={loading}
                            userOwnedPlayerAmount={userOwnedPlayerAmount}
                            tournaments={tokenGatedTournaments}
                        />
                        <MobileTourneyTable
                            open={true}
                            loadingTournaments={loading}
                            userOwnedPlayerAmount={userOwnedPlayerAmount}
                            tournaments={tokenGatedTournaments}
                        />
                    </>
                ) : (
                    <>
                        <TourneyTable
                            open={false}
                            loadingTournaments={loading}
                            userOwnedPlayerAmount={userOwnedPlayerAmount}
                            tournaments={tokenGatedTournaments}
                        />
                        <MobileTourneyTable
                            open={false}
                            loadingTournaments={loading}
                            userOwnedPlayerAmount={userOwnedPlayerAmount}
                            tournaments={tokenGatedTournaments}
                        />
                    </>
                )}

                {/* </InfiniteScroll> */}
            </div>
        </LayoutDecider>
    );
};

export default Stats;

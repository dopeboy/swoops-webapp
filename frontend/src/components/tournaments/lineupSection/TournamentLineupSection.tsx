import { ReactElement, useState, useEffect } from 'react';
import 'rc-tabs/assets/index.css';
import { TournamentLineupSelection } from './LineupSelection';
import classNames from 'classnames';
import { TournamentDetail, ApiService, Lineup, TournamentEntry, TournamentReservation } from 'src/lib/api';
import { LineupNotAuth } from './LineupNotAuth';
import { isUserLoggedIn, getUserTeam, getUserDetail } from 'src/lib/utils';
import { LineupMissed } from './LineupMissed';
import { LineupSelected } from './LineupSelected';
import { LineupNotQualified } from './LineupNotQualified';
import { LineupNotStarted } from './LineupNotStarted';
import { LineupAllSelected } from './LineupAllSelected';
import { TableLoadingSpinner } from 'src/components/common/TableLoadingSpinner';
import { useRouter } from 'next/router';

interface TournamentLineupSectionProps {
    tournament: TournamentDetail;
    shouldDisplay: boolean;
    round: string | string[];
    id: string | string[];
    roundAmount: number;
    showElegibleModal: () => void;
}

enum Status {
    NOT_AUTH = 'NOT_AUTH',
    SELECTION = 'SELECTION',
    SELECTED = 'SELECTED',
    NOT_QUALIFIED = 'NOT_QUALIFIED',
    MISSED = 'MISSED',
    LINEUP_NOT_STARTED = 'LINEUP_NOT_STARTED',
    ALL_LINEUPS_SELECTED = 'ALL_LINEUPS_SELECTED',
}

export const TournamentLineupSection: React.FC<TournamentLineupSectionProps> = ({
    id,
    round,
    shouldDisplay,
    tournament,
    roundAmount,
    showElegibleModal,
}): ReactElement => {
    const [lineupState, setLineupState] = useState('');
    const [currentLineup, setCurrentLineup] = useState<Lineup>();
    const [currentLineups, setCurrentLineups] = useState<TournamentEntry[]>();
    const [reservation, setReservation] = useState<TournamentReservation>();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { reservationId, tournamentF2P, showModalF2P } = router.query;

    useEffect(() => {
        if (router.isReady) {
            loadLineupState();
            if (showModalF2P) {
                showElegibleModal();
            }
        }
    }, [tournament, router.isReady]);

    const loadLineupState = async () => {
        if (reservationId) {
            try {
                setLoading(true);
                const reservationResult = await ApiService.apiGameTournamentReservationRead(reservationId.toString(), tournament?.id.toString());
                const currentTime = new Date().getTime();

                if (reservationResult?.team.id === getUserDetail()?.team?.id) {
                    const lineupSubmissionDateTime = new Date(reservationResult?.expires_at).getTime();
                    setReservation(reservationResult);
                    const remainingDayTimeForLineupSubmission = lineupSubmissionDateTime - currentTime;
                    setLoading(false);
                    if (remainingDayTimeForLineupSubmission < 0) {
                        setLineupState(Status.MISSED);
                    } else {
                        setLineupState(Status.SELECTION);
                    }
                } else {
                    setLineupState(Status.NOT_QUALIFIED);
                }
            } catch (e) {
                setLoading(false);
                setLineupState(Status.NOT_QUALIFIED);
            }
        } else {
            setLoading(true);
            const currentTime = new Date().getTime();

            const lineupStartDateTime = new Date(tournament?.lineup_submission_start).getTime();

            const lineupSubmissionDateTime = new Date(tournament?.lineup_submission_cutoff).getTime();

            const lineupRevealDateTime = new Date(tournament?.lineup_reveal_date).getTime();

            const remainingDayTimeForLineupSubmission = lineupSubmissionDateTime - currentTime;

            const remainingDayTimeForLineupStart = lineupStartDateTime - currentTime;

            const remainingDayTimeForLineupReveal = lineupRevealDateTime - currentTime;

            if (remainingDayTimeForLineupReveal < 0) {
                if (!isUserLoggedIn()) {
                    setLineupState(Status.NOT_AUTH);
                    setLoading(false);
                    return;
                }

                const tournamentEntries = await getAllLineups();

                const userTeam = await getUserTeam();
                const isUserPartOfTournament = tournamentEntries.find((team) => Number(team.id) === Number(userTeam.id));

                if (!isUserPartOfTournament) {
                    setLoading(false);
                    setLineupState(Status.ALL_LINEUPS_SELECTED);
                    setCurrentLineups(tournamentEntries);
                    return;
                }

                try {
                    const lineup = await getUserLineup();

                    setCurrentLineups(tournamentEntries);

                    if (!lineup?.player_1?.id) {
                        setLineupState(Status.ALL_LINEUPS_SELECTED);
                    } else {
                        setLineupState(Status.ALL_LINEUPS_SELECTED);
                        setCurrentLineup(lineup);
                    }
                    setLoading(false);
                } catch (e) {
                    setLineupState(Status.NOT_QUALIFIED);
                    setLoading(false);
                }
            } else {
                if (!isUserLoggedIn()) {
                    setLineupState(Status.NOT_AUTH);
                    setLoading(false);
                } else if (tournament?.id) {
                    try {
                        const lineup = await getUserLineup();
                        if (!lineup?.player_1?.id) {
                            const teams = await getTournamentTeams();
                            const userTeam = await getUserTeam();
                            if (teams.length) {
                                setLoading(false);
                                const isUserPartOfTournament = teams.find((team) => Number(team.id) === Number(userTeam.id));
                                if (isUserPartOfTournament) {
                                    if (remainingDayTimeForLineupSubmission < 0) {
                                        setLineupState(Status.MISSED);
                                    } else {
                                        if (remainingDayTimeForLineupStart < 0) {
                                            // if (!geTeamTournamentElegiblelModalViewed()) {
                                            //     // showElegibleModal();
                                            //     setTeamTournamentElegiblelModalViewed();
                                            // }
                                            setLineupState(Status.SELECTION);
                                        } else {
                                            setLineupState(Status.LINEUP_NOT_STARTED);
                                        }
                                    }
                                } else {
                                    setLineupState(Status.NOT_QUALIFIED);
                                }
                            } else {
                                setLoading(false);
                                setLineupState(Status.LINEUP_NOT_STARTED);
                            }
                        } else {
                            setLineupState(Status.SELECTED);
                            setLoading(false);
                            setCurrentLineup(lineup);
                        }
                    } catch (e) {
                        setLineupState(Status.SELECTION);
                        setLoading(false);
                    }
                } else {
                    setLineupState(Status.SELECTION);
                    setLoading(false);
                }
            }
        }
    };

    const getUserLineup = async () => {
        const currentLineup = await ApiService.apiGameTournamentLineupRead(tournament.id.toString());
        return currentLineup;
    };

    const getTournamentTeams = async () => {
        const teams = await ApiService.apiGameTournamentTeamsRead(tournament.id.toString());
        return teams;
    };

    const getAllLineups = async () => {
        const tournamentEntries = await ApiService.apiGameTournamentLineupsList(tournament.id.toString());
        return tournamentEntries;
    };

    return (
        <div
            className={classNames('bg-black w-full h-screen', {
                hidden: !shouldDisplay,
            })}
        >
            {!loading ? (
                <div className="pb-32">
                    <TournamentLineupSelection
                        lineupCreated={() => {
                            if (tournamentF2P) {
                                showElegibleModal();
                                router.push(`/tournament/${tournament.id}/line-up-roster/32?showModalF2P=true`);
                            } else {
                                router.push(`/tournament/${tournament.id}/line-up-roster/32`);
                            }
                            loadLineupState();
                        }}
                        id={id}
                        tournament={tournament}
                        round={round}
                        shouldDisplay={lineupState === Status.SELECTION}
                        submissionCutoff={tournament?.lineup_submission_cutoff}
                        tokensRequired={reservation?.tokens_required}
                        reservationExpiresAt={reservation?.expires_at}
                    />
                    <LineupNotAuth shouldDisplay={lineupState === Status.NOT_AUTH} />
                    <LineupSelected currentLineup={currentLineup} shouldDisplay={lineupState === Status.SELECTED} />
                    <LineupNotQualified id={id} roundAmount={roundAmount} shouldDisplay={lineupState === Status.NOT_QUALIFIED} />
                    <LineupNotStarted
                        id={id}
                        roundAmount={roundAmount}
                        shouldDisplay={lineupState === Status.LINEUP_NOT_STARTED}
                        startDate={tournament?.lineup_submission_start}
                    />
                    <LineupMissed id={id} shouldDisplay={lineupState === Status.MISSED} />
                    <LineupAllSelected
                        currentLineup={currentLineup}
                        shouldDisplay={lineupState === Status.ALL_LINEUPS_SELECTED}
                        tournamentEntries={currentLineups}
                    />
                </div>
            ) : (
                <TableLoadingSpinner loading={loading} />
            )}
        </div>
    );
};

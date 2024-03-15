import { ReactElement, useState } from 'react';
import { NoTournamentsFoundPlaceholder } from '../common/NoTournamentsFoundPlaceholder';
import { TableLoadingSpinner } from '../common/TableLoadingSpinner';
import moment from 'moment';
import { TournamentListing, ApiService } from 'src/lib/api';
import { getPrice } from 'src/lib/utils';
import Button from '../common/button/Button';
import { ColorTheme, ChipPosition } from '../common/button/types';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { utcToZonedTime } from 'date-fns-tz';
import { isBefore } from 'date-fns';

interface MobileTourneyTableProps {
    tournaments: TournamentListing[];
    loadingTournaments: boolean;
    reloadTournaments?: () => void;
    userOwnedPlayerAmount: number;
    open: boolean;
}

export const MobileTourneyTable: React.FC<MobileTourneyTableProps> = ({
    tournaments,
    loadingTournaments,
    userOwnedPlayerAmount,
    open,
}): ReactElement => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const joinTournament = async (tournament: TournamentListing) => {
        setLoading(true);
        try {
            const { id } = await ApiService.apiGameTournamentReservationCreate(tournament?.id.toString());
            router.push({ pathname: `/tournament/${tournament?.id}`, query: { reservationId: id, redirectToLineup: true } });
            setLoading(false);
        } catch (e) {
            toast.error(e?.body[0]);
            setLoading(false);
        }
    };

    const goToTournament = async (tournament: TournamentListing) => {
        router.push(`/tournament/${tournament?.id}`);
    };

    const beforeSubmissionStart = (tournament: TournamentListing) => {
        const timeZone = 'America/New_York';
        const now = utcToZonedTime(new Date(), timeZone);
        const lineupSubmissionStart = utcToZonedTime(tournament?.lineup_submission_start, timeZone);
        return isBefore(now, lineupSubmissionStart);
    };

    const handleSpotCount = (tournament: TournamentListing): number => {
        return tournament.entries || 0;
    };

    const maxTeams = (tournament: TournamentListing): number => {
        return !isNaN(Math.pow(2, tournament?.round_count)) ? Math.pow(2, tournament.round_count) : 0;
    };

    return (
        <div className="sm:hidden flex flex-col bg-black pb-12">
            <div className="-my-2 overflow-x-auto">
                <div className="py-2 align-middle inline-block w-full">
                    <div className="shadow sm:rounded-lg divide-y-1 divide-white/64">
                        {tournaments &&
                            tournaments.length > 0 &&
                            !loadingTournaments &&
                            tournaments?.map((tournament) => (
                                <div key={tournament?.id} className="w-full flex flex-col gap-2 pt-2 pb-4 px-2">
                                    <div className="flex flex-col items-center gap-0.5 text-left text-white uppercase subheading-two">
                                        <div className="flex flex-row w-full items-center gap-1.5 justify-center">
                                            <div className="flex flex-row items-center justify-start gap-1">
                                                <span className="subheading-three uppercase">ID</span>
                                                <span className="subheading-three">{tournament?.id}</span>
                                            </div>
                                        </div>
                                        <div className="w-full flex flex-col items-center justify-center gap-1 border border-white/16 rounded-lg p-2">
                                            {tournament?.name}
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-row items-start justify-between gap-3 px-2 border border-white/16 rounded-lg p-2">
                                        <div className="flex flex-col gap-0.5 text-end text-white uppercase subheading-three">
                                            Prize Pool
                                            <div className="flex flex-col">
                                                <div className="text-xs capitalize font-bold">{getPrice(tournament?.payout)}</div>
                                                <div className="text-[8px] text-white/64">
                                                    <span>{'USD'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 text-end text-white uppercase subheading-three">
                                            Bracket
                                            <div className="text-xs">
                                                {tournament?.meta
                                                    ? !isNaN(Math.pow(2, JSON.parse(tournament?.meta).rounds))
                                                        ? `${Math.pow(2, JSON.parse(tournament?.meta).rounds)} Teams`
                                                        : 'No Teams'
                                                    : ''}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 text-end text-white uppercase">
                                            <span className="subheading-three">Date</span>
                                            {tournament?.start_date && (
                                                <div>
                                                    <div className="capitalize text-[11px] font-bold">
                                                        {moment(tournament?.start_date)?.isSame(
                                                            moment().clone().subtract(1, 'days').startOf('day'),
                                                            'd'
                                                        )
                                                            ? 'Yesterday'
                                                            : moment(tournament?.start_date)?.isSame(moment().clone().startOf('day'), 'd')
                                                            ? 'Today'
                                                            : moment(tournament?.start_date).format('MM/DD/YYYY')}
                                                    </div>
                                                    <div className="text-[10px] text-white/64">
                                                        <span>{moment(tournament?.start_date).format('hh:mma')}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {!tournament?.start_date && (
                                                <div className="pr-2">
                                                    <div className="text-base capitalize font-bold">-</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-row items-start justify-around gap-3 px-2 border border-white/16 rounded-lg p-2">
                                        {open ? (
                                            <>
                                                <div className="flex flex-col items-center gap-2 justify-start w-fit">
                                                    <div className="whitespace-nowrap text-center w-full text-white uppercase tracking-wider detail-one">
                                                        Max Swoopsters
                                                    </div>
                                                    <div className="align-top text-center whitespace-nowrap text-white w-full">
                                                        <div className="subheading-one font-bold">{tournament?.tokens_required || '-'}</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="whitespace-nowrap text-center w-full text-white uppercase tracking-wider detail-one">
                                                        Teams Joined
                                                    </div>
                                                    <div className="heading-three font-bold text-white">
                                                        {handleSpotCount(tournament)}/{maxTeams(tournament)}
                                                    </div>
                                                    <div className="text-xs text-white/64 font-medium leading-6">
                                                        <span>{(handleSpotCount(tournament) / maxTeams(tournament)) * 100}% Full</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    disabled={
                                                        (handleSpotCount(tournament) === maxTeams(tournament) && maxTeams(tournament) > 0) ||
                                                        userOwnedPlayerAmount <= 0 ||
                                                        tournament?.is_current_user_enrolled ||
                                                        beforeSubmissionStart(tournament)
                                                    }
                                                    colorTheme={
                                                        handleSpotCount(tournament) === maxTeams(tournament) && !tournament?.is_current_user_enrolled
                                                            ? ColorTheme.White
                                                            : ColorTheme.AssistGreen
                                                    }
                                                    onClick={() => joinTournament(tournament)}
                                                    isLoading={loading}
                                                    chipPosition={ChipPosition.Right}
                                                >
                                                    {beforeSubmissionStart(tournament)
                                                        ? 'Upcoming'
                                                        : tournament?.is_current_user_enrolled
                                                        ? 'Joined'
                                                        : 'Join'}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                disabled={false}
                                                colorTheme={ColorTheme.AssistGreen}
                                                onClick={() => goToTournament(tournament)}
                                                isLoading={false}
                                                chipPosition={ChipPosition.Right}
                                            >
                                                View
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        <TableLoadingSpinner loading={loadingTournaments} />
                        {!loadingTournaments && (!tournaments || tournaments.length === 0) && <NoTournamentsFoundPlaceholder />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileTourneyTable;

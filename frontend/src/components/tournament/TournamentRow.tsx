import { TournamentListing, ApiService } from 'src/lib/api';
import { useEffect, useState } from 'react';
import { getPrice } from 'src/lib/utils';
import moment from 'moment';
import Button from '../common/button/Button';
import { ColorTheme, ChipPosition } from '../common/button/types';
import { toast } from 'react-toastify';
import { isBefore } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import 'react-toastify/dist/ReactToastify.css';

interface TournamentRowProps {
    tournament: TournamentListing;
    userOwnedPlayerAmount: number;
    open: boolean;
    // reloadGames: () => void;
}

const TournamentRow: React.FC<TournamentRowProps> = ({ tournament, userOwnedPlayerAmount, open }) => {
    const [currentTournament, setCurrentTournament] = useState<TournamentListing>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (tournament) {
            setCurrentTournament(tournament);
        }
    }, [tournament]);

    const beforeSubmissionStart = () => {
        const timeZone = 'America/New_York';
        const now = utcToZonedTime(new Date(), timeZone);
        const lineupSubmissionStart = utcToZonedTime(tournament?.lineup_submission_start, timeZone);
        return isBefore(now, lineupSubmissionStart);
    };

    const goToTournament = async (tournament: TournamentListing) => {
        window.open(`/tournament/${tournament?.id}`, '_blank');
    };

    const joinTournament = async () => {
        setLoading(true);
        try {
            const { id } = await ApiService.apiGameTournamentReservationCreate(tournament?.id.toString());
            window.open(`/tournament/${currentTournament?.id}?reservationId=${id}&redirectToLineup=true`, '_blank');
            setLoading(false);
        } catch (e) {
            toast.error('You have already joined an in-season tournament today');
            setLoading(false);
        }
    };

    const handleSpotCount = (): number => {
        return tournament.entries || 0;
    };

    const maxTeams = (): number => {
        return !isNaN(Math.pow(2, currentTournament?.round_count)) ? Math.pow(2, currentTournament.round_count) : 0;
    };

    return (
        <tr key={currentTournament?.id} className="hover:cursor-pointer hover:hover:bg-off-black/40">
            <td className="pl-2 pr-6 py-4 subheading-three whitespace-nowrap text-base text-display text-gray-500 text-left font-semibold dark:text-white">
                {currentTournament?.id}
            </td>
            <td className="pr-6 py-4 subheading-three whitespace-nowrap text-base text-display text-gray-500 text-left font-semibold dark:text-white">
                {currentTournament?.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 dark:text-white">
                <div className="text-base leading-6 capitalize font-bold">{getPrice(currentTournament?.payout)}</div>
                <div className="text-xs leading-6 text-white/64 font-medium">
                    <span>{'USD'}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap subheading-one text-right text-gray-500 dark:text-white">
                {currentTournament?.meta
                    ? !isNaN(Math.pow(2, currentTournament.round_count))
                        ? `${Math.pow(2, currentTournament.round_count)} Teams`
                        : 'No Teams'
                    : ''}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 dark:text-white">
                {currentTournament?.start_date && (
                    <div>
                        <div className="text-base leading-6 capitalize font-bold">
                            {moment(currentTournament?.start_date)?.isSame(moment().clone().subtract(1, 'days').startOf('day'), 'd')
                                ? 'Yesterday'
                                : moment(currentTournament?.start_date)?.isSame(moment().clone().startOf('day'), 'd')
                                ? 'Today'
                                : moment(currentTournament?.start_date).format('MM/DD/YYYY')}
                        </div>
                        <div className="text-xs leading-6 text-white/64 font-medium">
                            <span>{moment(currentTournament?.start_date).format('hh:mma')}</span>
                        </div>
                    </div>
                )}
                {!currentTournament?.start_date && (
                    <div className="pr-2">
                        <div className="text-base leading-6 capitalize font-bold">-</div>
                        <div className="text-xs leading-6 text-white/64 font-medium ">
                            <span>-</span>
                        </div>
                    </div>
                )}
            </td>
            <td
                align="right"
                className="text-center align-middle w-fit max-w-40 border-b border-white/16 border-solid py-6 whitespace-nowrap text-sm text-gray-500 dark:text-white"
            >
                <div className="heading-three font-bold">{currentTournament?.tokens_required || '-'}</div>
            </td>
            <td
                align="right"
                className="align-top border-b border-white/16 border-solid  py-6  whitespace-nowrap text-sm text-gray-500 dark:text-white"
            >
                <div className="flex justify-center w-full flex-row space-x-12">
                    {open ? (
                        <>
                            <div>
                                <div className="heading-three font-bold">
                                    {handleSpotCount()}/{maxTeams()}
                                </div>
                                <div className="text-xs text-white/64 font-medium leading-6">
                                    <span>{(handleSpotCount() / maxTeams()) * 100}% Full</span>
                                </div>
                            </div>
                            <Button
                                disabled={
                                    (handleSpotCount() === maxTeams() && maxTeams() > 0) ||
                                    userOwnedPlayerAmount <= 0 ||
                                    tournament?.is_current_user_enrolled ||
                                    beforeSubmissionStart()
                                }
                                colorTheme={
                                    handleSpotCount() === maxTeams() && !tournament?.is_current_user_enrolled
                                        ? ColorTheme.White
                                        : ColorTheme.AssistGreen
                                }
                                onClick={joinTournament}
                                isLoading={loading}
                                chipPosition={ChipPosition.Right}
                            >
                                {beforeSubmissionStart() ? 'Upcoming' : tournament?.is_current_user_enrolled ? 'Joined' : 'Join'}
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
            </td>
        </tr>
    );
};

export default TournamentRow;

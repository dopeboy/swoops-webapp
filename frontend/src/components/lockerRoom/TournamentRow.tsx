import { TournamentListing } from 'src/lib/api';
import { useEffect, useState } from 'react';
import { getPrice } from 'src/lib/utils';
import moment from 'moment';

interface TournamentRowProps {
    tournament: TournamentListing;
    // reloadGames: () => void;
}

const TournamentRow: React.FC<TournamentRowProps> = ({ tournament }) => {
    const [currentTournament, setCurrentTournament] = useState<TournamentListing>();

    useEffect(() => {
        if (tournament) {
            setCurrentTournament(tournament);
        }
    }, [tournament]);

    const goToTournament = (): void => {
        window.open(`/tournament/${currentTournament?.id}`, '_blank');
    };

    return (
        <tr key={currentTournament?.id} onClick={goToTournament} className="hover:cursor-pointer hover:hover:bg-off-black/40">
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
        </tr>
    );
};

export default TournamentRow;

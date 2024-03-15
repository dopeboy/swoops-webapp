import { ReactElement } from 'react';
import { NoTournamentsFoundPlaceholder } from '../common/NoTournamentsFoundPlaceholder';
import { TableLoadingSpinner } from '../common/TableLoadingSpinner';
import moment from 'moment';
import { TournamentListing } from 'src/lib/api';
import { getPrice } from 'src/lib/utils';

interface MobileTourneyTableProps {
    tournaments: TournamentListing[];
    loadingTournaments: boolean;
    reloadTournaments?: () => void;
}

const goToTournament = (tournament): void => {
    window.open(`/tournament/${tournament?.id}`, '_blank');
};

export const MobileTourneyTable: React.FC<MobileTourneyTableProps> = ({ tournaments, loadingTournaments }): ReactElement => {
    return (
        <div className="sm:hidden flex flex-col bg-black pb-12">
            <div className="-my-2 overflow-x-auto">
                <div className="py-2 align-middle inline-block w-full">
                    <div className="shadow sm:rounded-lg divide-y-1 divide-white/64">
                        {tournaments &&
                            tournaments.length > 0 &&
                            !loadingTournaments &&
                            tournaments?.map((tournament) => (
                                <div
                                    key={tournament?.id}
                                    onClick={() => goToTournament(tournament)}
                                    className="w-full flex flex-col gap-2 pt-2 pb-4 px-2"
                                >
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

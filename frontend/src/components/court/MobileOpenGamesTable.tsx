import { ReactElement } from 'react';
import { getPrice, getUserDetail } from 'src/lib/utils';
import { TableLoadingSpinner } from '../common/TableLoadingSpinner';
import { TableNoGamesFoundPlaceholder } from '../common/TableNoGamesFoundPlaceholder';
import { toast } from 'react-toastify';
import { LoadingEnabledGame } from './RenderCourtroomTable';
import { useRouter } from 'next/router';
import { ApiService, Reservation, AccountsService } from 'src/lib/api';
import Button from '../common/button/Button';
import { ChipPosition, ColorTheme } from '../common/button/types';

interface MobileOpenGamesTable {
    games: LoadingEnabledGame[];
    userOwnedPlayerAmount: number;
    loadingGames: boolean;
    setLoading: (id: number, loading: boolean) => void;
    reloadGames: () => void;
}

const MobileOpenGamesTable: React.FC<MobileOpenGamesTable> = ({
    userOwnedPlayerAmount,
    games,
    setLoading,
    loadingGames,
    reloadGames,
}): ReactElement => {
    const router = useRouter();
    const totalReservations = 2;
    const price = '0';
    const { onboarding } = router.query;

    const acquireReservation = async (id: number): Promise<Reservation> => {
        return ApiService.apiGameReservationCreate(id.toString());
    };

    const joinGame = async (id: number): Promise<void> => {
        if (onboarding === 'true') {
            /*
            AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), {
                tutorial: { completed_step_number: 800 },
            });
            */
        }
        try {
            setLoading(id, true);
            const reservation = await acquireReservation(id);
            router.push({ pathname: `/gamelobby/${id}/roster`, query: { reservationId: reservation.id } });
            reloadGames();
        } catch (error) {
            toast.error('There was a problem joining the game. Please try again.');
            setLoading(id, false);
            console.error(error);
        }
    };

    const goToGame = (id: number): void => {
        if (onboarding === 'true') {
            /*
            AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), {
                tutorial: { completed_step_number: 800 },
            });
            */
        }
        try {
            router.push(`/headtohead/${id}/joined`);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSpotCount = (game: LoadingEnabledGame): number => {
        return game.number_enrolled_reservation;
    };

    return (
        <div className="sm:hidden flex flex-col bg-black sm:px-12 pb-12">
            <div className="-my-2 overflow-x-auto w-full">
                <div className="py-2 align-middle inline-block min-w-full ">
                    <div className="overflow-hidden sm:rounded-lg">
                        {!loadingGames &&
                            games &&
                            games
                                ?.filter((game) => game && game?.id)
                                ?.map((game) => (
                                    <div key={game?.id} className="flex flex-col justify-center w-full py-3 gap-2 border-b border-gray/64">
                                        <div className="flex flex-row gap-3.5 items-start justify-center">
                                            <div className="flex flex-col items-center gap-2 justify-start w-fit">
                                                <div className="whitespace-nowrap text-center text-white uppercase tracking-wider detail-one">ID</div>
                                                <div className="align-top whitespace-nowrap subheading-one font-bold text-white">{game?.id}</div>
                                            </div>
                                            <div className="flex flex-col items-center gap-2 justify-start w-fit">
                                                <div className="whitespace-nowrap text-center w-full text-white uppercase tracking-wider detail-one">
                                                    Buy-in
                                                </div>
                                                <div className="align-top text-end text-white w-full">
                                                    <div className="subheading-one font-bold">{getPrice(price)}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center gap-2 justify-start w-fit">
                                                <div className="whitespace-nowrap text-center w-full text-white uppercase tracking-wider detail-one">
                                                    Current Prize
                                                </div>
                                                <div className="align-top text-center whitespace-nowrap text-white w-full">
                                                    <div className="subheading-one font-bold">{getPrice(game.prize_pool || '')}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center gap-2 justify-start w-fit">
                                                <div className="whitespace-nowrap text-center w-full text-white uppercase tracking-wider detail-one">
                                                    Max Swoopsters
                                                </div>
                                                <div className="align-top text-center whitespace-nowrap text-white w-full">
                                                    <div className="subheading-one font-bold">{game.tokens_required || '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 justify-start w-full">
                                            <div className="whitespace-nowrap text-center text-white uppercase tracking-wider detail-one"></div>
                                            <div className="flex flex-row justify-between gap-6 w-full pl-5 pr-4">
                                                <div className="flex flex-col items-center gap-2 justify-start w-fit">
                                                    <div className="whitespace-nowrap text-center w-full text-white uppercase tracking-wider detail-one">
                                                        Teams Joined
                                                    </div>
                                                    <div className="align-top flex flex-row items-center justify-center gap-3 w-full">
                                                        <div className="subheading-one font-bold text-white">
                                                            {game.is_current_user_enrolled_with_lineup
                                                                ? `${game.number_enrolled_lineup}/${totalReservations}`
                                                                : `${handleSpotCount(game)}/${totalReservations}`}
                                                            {game.is_current_user_enrolled_with_lineup ? ', You Joined' : ''}
                                                        </div>
                                                        <div className="text-white/64 text-xs">
                                                            <span>
                                                                {game.is_current_user_enrolled_with_lineup
                                                                    ? game.number_enrolled_lineup / totalReservations
                                                                    : handleSpotCount(game) / totalReservations}
                                                                % Full
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!game.is_current_user_enrolled_with_lineup && (
                                                    <Button
                                                        disabled={
                                                            handleSpotCount(game) === totalReservations ||
                                                            userOwnedPlayerAmount <= 0 ||
                                                            game.is_current_user_enrolled_with_reservation
                                                        }
                                                        colorTheme={ColorTheme.AssistGreen}
                                                        onClick={() => joinGame(game.id)}
                                                        isLoading={loadingGames}
                                                        chipPosition={ChipPosition.Right}
                                                    >
                                                        {game.is_current_user_enrolled_with_reservation ? 'Joined' : 'Join'}
                                                    </Button>
                                                )}
                                                {game.is_current_user_enrolled_with_lineup && (
                                                    <Button
                                                        colorTheme={ColorTheme.White}
                                                        onClick={() => goToGame(game.id)}
                                                        chipPosition={ChipPosition.Right}
                                                    >
                                                        View
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        <TableLoadingSpinner loading={loadingGames} />
                        <TableNoGamesFoundPlaceholder shouldShow={!loadingGames && (!games || games.length === 0)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileOpenGamesTable;

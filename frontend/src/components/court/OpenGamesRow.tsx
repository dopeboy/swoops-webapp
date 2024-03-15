import { toast } from 'react-toastify';
import { Reservation, ApiService, AccountsService } from 'src/lib/api';
import { getPrice, getUserDetail } from 'src/lib/utils';
import Button from '../common/button/Button';
import { ColorTheme, ChipPosition } from '../common/button/types';
import { useRouter } from 'next/router';

interface OpenGamesRowProps {
    id: number;
    prizePool: string;
    index: number;
    loading: boolean;
    setLoading: (id: number, loading: boolean) => void;
    reservations: number;
    userOwnedPlayerAmount: number;
    maxSwoopsters: number;
    currentLineups: number;
    isCurrentUserEnrolledLineup: boolean;
    isCurrentUserEnrolledReservation: boolean;
    currentReservations: number;
    reloadGames: () => void;
}

export const OpenGamesRow: React.FC<OpenGamesRowProps> = ({
    id,
    prizePool,
    index,
    userOwnedPlayerAmount,
    loading,
    setLoading,
    maxSwoopsters,
    reservations,
    currentLineups,
    isCurrentUserEnrolledLineup,
    isCurrentUserEnrolledReservation,
    currentReservations,
    reloadGames,
}) => {
    const router = useRouter();
    const currency = 'USD';
    const totalReservations = 2;
    const type = 'Head to Head';
    const price = '0';
    const reservationCount = reservations;
    const { onboarding } = router.query;

    const joinGame = async (): Promise<void> => {
        try {
            if (onboarding === 'true') {
                /*
                AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), {
                    tutorial: { completed_step_number: 800 },
                });
                */
            }
            setLoading(id, true);
            const reservation = await acquireReservation();
            reloadGames();
            openWindow(reservation?.id.toString());
        } catch (error) {
            toast.error('There was a problem joining the game. Please try again.');
            setLoading(id, false);
            console.error(error);
        }
    };

    const openWindow = (reservationId: string) => {
        window.open(`/gamelobby/${id}/roster?reservationId=${reservationId}`, '_blank');
    };

    const acquireReservation = async (): Promise<Reservation> => {
        return ApiService.apiGameReservationCreate(id.toString());
    };

    const goToGame = (): void => {
        if (onboarding === 'true') {
            /*
            AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), {
                tutorial: { completed_step_number: 800 },
            });
            */
        }
        try {
            window.open(`/headtohead/${id}/joined`, '_blank');
        } catch (error) {
            console.error(error);
        }
    };

    const handleSpotCount = (): number => {
        return currentReservations;
    };

    return (
        <tr key={index}>
            <td className="align-top border-b border-white/16 border-solid pl-2 py-6 pr-6 whitespace-nowrap text-sm text-gray-500 dark:text-white">
                <div className="heading-three font-bold">{id}</div>
            </td>
            <td
                align="right"
                className="align-top border-b text-center border-white/16 border-solid py-6 pr-6 whitespace-nowrap text-sm text-gray-500 dark:text-white"
            >
                <div className="heading-three font-bold">{getPrice(price)}</div>
                <div className="text-xs text-white/64 font-medium leading-6">
                    <span className="capitalize">{type} </span>
                    <span>• </span>
                    <span className="uppercase">{currency}</span>
                </div>
            </td>
            <td
                align="right"
                className="align-top border-b border-white/16 border-solid py-6 pr-6 whitespace-nowrap text-sm text-gray-500 dark:text-white"
            >
                <div className="heading-three text-center font-bold">{getPrice(prizePool)}</div>
                <div className="text-xs text-center text-white/64 font-medium ">
                    <span className="uppercase leading-6">{currency}</span>
                </div>
            </td>
            <td
                align="right"
                className="text-center align-middle w-fit max-w-40 border-b border-white/16 border-solid py-6 whitespace-nowrap text-sm text-gray-500 dark:text-white"
            >
                <div className="heading-three font-bold">{maxSwoopsters || '-'}</div>
            </td>
            <td
                align="right"
                className="align-top border-b border-white/16 border-solid  py-6  whitespace-nowrap text-sm text-gray-500 dark:text-white"
            >
                <div className="flex justify-center w-full flex-row space-x-12">
                    <div>
                        <div className="heading-three font-bold">
                            {isCurrentUserEnrolledLineup ? `${currentLineups}/${totalReservations}` : `${handleSpotCount()}/${totalReservations}`}
                        </div>
                        <div className="text-xs text-white/64 font-medium leading-6">
                            <span>
                                {(isCurrentUserEnrolledLineup ? currentLineups / totalReservations : handleSpotCount() / totalReservations) * 100}%
                                Full
                                {isCurrentUserEnrolledLineup ? ', You Joined' : ''}
                            </span>
                        </div>
                    </div>
                    {!isCurrentUserEnrolledLineup && (
                        <Button
                            disabled={handleSpotCount() === totalReservations || userOwnedPlayerAmount <= 0 || isCurrentUserEnrolledReservation}
                            colorTheme={ColorTheme.AssistGreen}
                            onClick={joinGame}
                            isLoading={loading}
                            chipPosition={ChipPosition.Right}
                        >
                            {isCurrentUserEnrolledReservation ? 'Joined' : 'Join'}
                        </Button>
                    )}
                    {isCurrentUserEnrolledLineup && (
                        <Button colorTheme={ColorTheme.White} onClick={goToGame} chipPosition={ChipPosition.Right}>
                            View
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
};

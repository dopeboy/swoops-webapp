import { ReactElement } from 'react';
import classNames from 'classnames';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import Button from '../common/button/Button';
import { ChipPosition, ColorTheme } from '../common/button/types';
import { ApiService } from 'src/lib/api';

interface MobileGameLobbyHeaderProps {
    isSubmitDisabled: boolean;
    gameId: string;
    reservationId: string;
    timer: number;
    animateHeader: boolean;
    onSubmit: () => void;
    isLoading: boolean;
    fixed?: boolean;
}

const transformSeconds = (seconds: number) => {
    if (seconds > 0) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds - minutes * 60;
        return `${minutes}:${remainingSeconds > 9 ? remainingSeconds.toFixed(0) : `0${remainingSeconds.toFixed(0)}`}`;
    }
    return '0:00';
};

const MobileGameLobbyHeader: React.FC<MobileGameLobbyHeaderProps> = ({
    animateHeader,
    gameId,
    reservationId,
    isSubmitDisabled,
    timer,
    onSubmit,
    isLoading,
    fixed = true,
}): ReactElement => {
    const router = useRouter();

    const handleLobbyExit = async (): Promise<void> => {
        await ApiService.apiGameReservationDelete(gameId, reservationId);
        router.push({ pathname: '/games/open' });
    };

    return (
        <div
            className={classNames(
                'sm:hidden border-b z-60 bg-black w-full transition-all ease-in-out duration-300 gap-2 border-white/16 flex flex-col items-center sm:flex-row justify-between px-2',
                {
                    'py-2': animateHeader,
                    'pt-2 pb-3 sm:py-8': !animateHeader,
                    fixed: fixed,
                }
            )}
        >
            <div
                className={classNames('flex flex-row justify-center gap-1 w-full', {
                    'items-center': !animateHeader,
                    'items-start': animateHeader,
                })}
            >
                <button onClick={handleLobbyExit} className="flex items-center justify-center btn-primary text-white bg-white/4 w-12">
                    <XMarkIcon className="h-6 w-6 text-white" />
                </button>
                <div
                    className={classNames('flex flex-col items-center gap-3 w-full', {
                        'justify-center': !animateHeader,
                        'justify-start': animateHeader,
                    })}
                >
                    {!animateHeader && <div className="text-white pl-10 heading-two text-left w-full">JOIN GAME</div>}
                    {animateHeader && (
                        <Button
                            colorTheme={ColorTheme.White}
                            chipPosition={ChipPosition.Right}
                            disabled={isSubmitDisabled || isLoading}
                            isLoading={isLoading}
                            onClick={onSubmit}
                        >
                            Submit lineup
                        </Button>
                    )}
                    {animateHeader && (
                        <div className="flex flex-row items-center gap-1.5 pb-1 text-white/64 text-display text-xs text-center">
                            You have
                            <div className="flex flex-row items-center justify-center bg-white rounded-2xl text-black font-bold">
                                <span className="px-1.5 pb-[3px] pt-[2px]">{transformSeconds(timer)}</span>
                            </div>
                            to submit.
                        </div>
                    )}
                </div>
            </div>

            {!animateHeader && (
                <div className="flex flex-col items-center justify-center gap-3 w-full">
                    <div data-tut="submit-lineup">
                        <Button
                            colorTheme={ColorTheme.White}
                            chipPosition={ChipPosition.Right}
                            disabled={isSubmitDisabled || isLoading}
                            isLoading={isLoading}
                            onClick={onSubmit}
                        >
                            Submit lineup
                        </Button>
                    </div>
                    <div className="flex flex-row items-center gap-1.5 text-white/64 text-display text-xs text-center">
                        You have
                        <div className="flex flex-row items-center justify-center bg-white rounded-2xl text-black font-bold">
                            <span className="px-1.5 pb-[3px] pt-[2px]">{transformSeconds(timer)}</span>
                        </div>
                        to submit.
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileGameLobbyHeader;

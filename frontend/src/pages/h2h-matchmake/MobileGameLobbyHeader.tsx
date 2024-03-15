import { ReactElement } from 'react';
import classNames from 'classnames';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import Button from 'src/components/common/button/Button';
import { ChipPosition, ColorTheme } from 'src/components/common/button/types';

interface MobileMatchmakingLobbyHeaderProps {
    isSubmitDisabled: boolean;
    animateHeader: boolean;
    onSubmit: () => void;
    isLoading: boolean;
}

const MobileMatchmakingLobbyHeader: React.FC<MobileMatchmakingLobbyHeaderProps> = ({
    animateHeader,
    isSubmitDisabled,
    onSubmit,
    isLoading,
}): ReactElement => {
    const router = useRouter();

    const handleLobbyExit = async (): Promise<void> => {
        router.push({ pathname: '/games/open' });
    };

    return (
        <div
            className={classNames(
                'sm:hidden border-b z-60 bg-black fixed w-full transition-all ease-in-out duration-300 gap-2 border-white/16 flex flex-col items-center sm:flex-row justify-between px-2',
                {
                    'py-2': animateHeader,
                    'pt-2 pb-3 sm:py-8': !animateHeader,
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
                    {!animateHeader && (
                        <div className="text-white pl-10 heading-three text-left w-full">
                            Create Matchmaking Lineup <span className="bg-light-purple align-middle text-purple text-sm ml-2 px-2 rounded">Beta</span>
                        </div>
                    )}
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
                </div>
            </div>

            {!animateHeader && (
                <div className="flex flex-col items-center justify-center gap-3 w-full">
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
            )}
        </div>
    );
};

export default MobileMatchmakingLobbyHeader;

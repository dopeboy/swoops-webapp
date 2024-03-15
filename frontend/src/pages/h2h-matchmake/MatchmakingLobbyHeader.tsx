import { ReactElement } from 'react';
import classNames from 'classnames';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import Button from 'src/components/common/button/Button';
import { ChipPosition, ColorTheme } from 'src/components/common/button/types';

interface MatchmakingLobbyHeaderProps {
    isSubmitDisabled: boolean;
    animateHeader: boolean;
    onSubmit: () => void;
    isLoading: boolean;
}

const MatchmakingLobbyHeader: React.FC<MatchmakingLobbyHeaderProps> = ({ animateHeader, isSubmitDisabled, onSubmit, isLoading }): ReactElement => {
    const router = useRouter();

    const handleLobbyExit = async (): Promise<void> => {
        router.push({ pathname: '/games/open' });
    };

    return (
        <div
            className={classNames(
                'border-b z-60 bg-black fixed w-full transition-all ease-in-out duration-300 border-white/16 hidden sm:flex justify-between px-4',
                {
                    'py-2': animateHeader,
                    'py-8': !animateHeader,
                }
            )}
        >
            <button onClick={handleLobbyExit} className="flex items-center justify-center btn-primary text-white bg-white/4 w-12">
                <XMarkIcon className="h-6 w-6 text-white" />
            </button>
            <div className="flex flex-col items-center justify-center gap-1 ml-[200px]">
                {!animateHeader && (
                <>
                    <div className="text-white heading-two text-center">
                        Enter lineup and be matched
                    </div>
                    <div className="text-white">
                        {'We will pair you against another team at your skill level.'}
                    </div>
                    </>
                )}
            </div>

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
    );
};

export default MatchmakingLobbyHeader;

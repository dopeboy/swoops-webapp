import { ReactElement } from 'react';
import classNames from 'classnames';
import Button from '../../common/button/Button';
import { ChipPosition, ColorTheme } from '../../common/button/types';
import moment from 'moment';
import { TournamentDetail } from 'src/lib/api';
interface GameLobbyHeaderProps {
    isSubmitDisabled: boolean;
    animateHeader: boolean;
    onSubmit: () => void;
    isLoading: boolean;
    submissionCutoff: string;
    timer: number;
    kind: TournamentDetail.kind;
}

const transformSeconds = (seconds: number) => {
    if (seconds > 0) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds - minutes * 60;
        return `${minutes}:${remainingSeconds > 9 ? remainingSeconds.toFixed(0) : `0${remainingSeconds.toFixed(0)}`}`;
    }
    return '0:00';
};

const GameLobbyHeader: React.FC<GameLobbyHeaderProps> = ({
    animateHeader,
    isSubmitDisabled,
    onSubmit,
    isLoading,
    submissionCutoff,
    timer,
    kind,
}): ReactElement => {
    return (
        <div
            className={classNames(
                'border-b z-10 bg-[#3e3e3e] w-full transition-all sticky top-0 ease-in-out duration-300 border-white/16 hidden sm:flex justify-between px-4',
                {
                    'py-2': animateHeader,
                    'py-8': !animateHeader,
                }
            )}
        >
            <div className="flex flex-col items-center justify-center gap-1 ml-[40%]">
                {!animateHeader && <div className="text-white heading-two text-center text-center">JOIN TOURNAMENT</div>}

                {kind === TournamentDetail.kind.END_OF_SEASON && !animateHeader ? (
                    <div className="flex flex-row items-center gap-1.5 text-white/64 text-display text-xs text-center">
                        You have until {moment(new Date(submissionCutoff)).format('MMMM D')} to submit
                    </div>
                ) : !animateHeader && kind === TournamentDetail.kind.IN_SEASON ? (
                    <div className="flex flex-row items-center gap-1.5 text-white/64 text-display text-xs text-center">
                        You have
                        <div className="flex flex-row items-center justify-center bg-white rounded-2xl text-black font-bold">
                            <span className="px-1.5 pb-[3px] pt-[2px]">{transformSeconds(timer)}</span>
                        </div>
                        to submit.
                    </div>
                ) : (
                    ''
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

export default GameLobbyHeader;

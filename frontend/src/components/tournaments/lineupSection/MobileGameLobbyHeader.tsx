import { ReactElement } from 'react';
import classNames from 'classnames';
import Button from '../../common/button/Button';
import { ChipPosition, ColorTheme } from '../../common/button/types';
import moment from 'moment';
import { TournamentDetail } from 'src/lib/api';
interface MobileGameLobbyHeaderProps {
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

const MobileGameLobbyHeader: React.FC<MobileGameLobbyHeaderProps> = ({
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
                'sm:hidden bg-[#3e3e3e] border-b z-60 sticky w-full top-0 transition-all ease-in-out duration-300 gap-2 border-white/16 flex flex-col items-center sm:flex-row justify-between px-2',
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
                <div
                    className={classNames('flex flex-col items-center gap-3 w-full', {
                        'justify-center': !animateHeader,
                        'justify-start': animateHeader,
                    })}
                >
                    {!animateHeader && <div className="text-white pl-10 heading-two text-left w-full">JOIN TOURNAMENT</div>}
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
                    {kind === TournamentDetail.kind.END_OF_SEASON && animateHeader ? (
                        <div className="flex flex-row items-center gap-1.5 pb-1 text-white/64 text-display text-xs text-center">
                            You have until {moment(new Date(submissionCutoff)).format('MMMM D')} to submit
                        </div>
                    ) : animateHeader && kind === TournamentDetail.kind.IN_SEASON ? (
                        <div className="flex flex-row items-center gap-1.5 pb-1 text-white/64 text-display text-xs text-center">
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
                    <div className="flex flex-row items-center gap-1.5 text-white/64 text-display text-xs text-center">
                        You have until {moment(new Date(submissionCutoff)).format('MMMM D')} to submit
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileGameLobbyHeader;

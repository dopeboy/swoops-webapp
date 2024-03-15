import classNames from 'classnames';
import { ProgressiveQuarters } from 'src/hooks/usePlayByPlay';
import { ApiService, User } from 'src/lib/api';
import { handleTeamName } from 'src/lib/playByPlayUtils';
import { trackEvent } from 'src/lib/tracking';
import { abbreviateTeamName } from 'src/lib/utils';
import { HeadToHeadBannerScoreTable } from './HeadToHeadBannerScoreTable';

interface HeadToHeadMiddleBannerProps {
    user: User;
    animateHeader: boolean;
    revealScore: boolean;
    isFinal: boolean;
    lastQuarter: string;
    lastQuarterGameClock: string;
    showWatchButton: boolean;
    loading: boolean;
    isOwnerOfEitherTeam: boolean;
    progressiveQuarters: ProgressiveQuarters;
    game: any;
    skipAnimation: () => void;
    setRevealScore: (revealScore: boolean) => void;
    setIsPaused: (isPaused: boolean) => void;
    setShowWatchButton: (showWatch: boolean) => void;
    isPaused: boolean;
}
export const HeadToHeadMiddleBanner: React.FC<HeadToHeadMiddleBannerProps> = ({
    animateHeader,
    revealScore,
    isFinal,
    progressiveQuarters,
    game,
    showWatchButton,
    setShowWatchButton,
    isOwnerOfEitherTeam,
    isPaused,
    user,
    lastQuarter,
    lastQuarterGameClock,
    loading,
    setRevealScore,
    setIsPaused,
    skipAnimation,
}) => {
    const markGameAsRevealed = (): void => {
        // Purposefully not awaiting this call
        try {
            if (!game?.reveal) {
                ApiService.apiGamePartialUpdate([{ id: game?.id }]);
            }
        } catch {
            // Do nothing
        }
    };

    return (
        <div
            className={classNames('flex col-span-2 md:text-lg md:col-span-1 order-3 md:order-2 items-center h-full pt-0 md:pt-3', {
                'flex-row justify-center': animateHeader,
                'flex-col justify-between gap-3': !animateHeader,
            })}
        >
            {!animateHeader && isFinal && (
                <div className="flex flex-row gap-2 justify-center font-bold text-lg items-center w-full">
                    <span>{lastQuarter}</span>-<span>{lastQuarterGameClock}</span>
                </div>
            )}
            {!animateHeader && (
                <HeadToHeadBannerScoreTable
                    animateHeader={animateHeader}
                    quarters={progressiveQuarters}
                    challengedTeamName={abbreviateTeamName(handleTeamName(user, game?.lineup_1?.team))}
                    challengerTeamName={abbreviateTeamName(handleTeamName(user, game?.lineup_2?.team))}
                    loading={loading}
                />
            )}
            {!isFinal && game?.lineup_1 && !game?.lineup_2 && <div className="subheading-one text-black">Waiting for Opponent</div>}
            {isOwnerOfEitherTeam && !isFinal && game?.lineup_1 && game?.lineup_2 && <div className="subheading-one text-black">Starting soon</div>}
            <div
                className={classNames('flex items-center justify-center w-full gap-2', {
                    'flex-col xl:flex-row pt-4 xl:pt-0': !animateHeader,
                    'flex-row': animateHeader,
                })}
            >
                {animateHeader && <div className="w-full text-center font-bold text-lg -mt-3">{lastQuarter}</div>}
                {isFinal && !revealScore && (
                    <div className="flex flex-row items-center justify-center gap-2 w-full">
                        {isFinal && isPaused && !revealScore && showWatchButton && (
                            <button
                                data-tut="watch-contest"
                                onClick={() => {
                                    trackEvent('Head-to-head page - Clicked watch button');
                                    setIsPaused(false);
                                    setShowWatchButton(false);
                                }}
                                className={classNames('bg-assist-green px-3 py-2 subheading-three rounded-lg text-black', {
                                    '-mt-2.5': animateHeader,
                                })}
                            >
                                Watch
                            </button>
                        )}
                        {!revealScore && isFinal && (
                            <button
                                onClick={() => {
                                    trackEvent('Head-to-head page - Clicked reveal button');
                                    skipAnimation();
                                    setRevealScore(true);
                                    markGameAsRevealed();
                                }}
                                className={classNames('py-2 px-3 subheading-three text-white bg-off-black rounded-lg', {
                                    '-mt-2.5': animateHeader,
                                })}
                            >
                                Reveal
                            </button>
                        )}
                    </div>
                )}
                {revealScore && (
                    <span
                        className={classNames('text-black', {
                            'heading-two': !animateHeader,
                            'heading-three -mt-3 w-full text-center': animateHeader,
                        })}
                    >
                        Final
                    </span>
                )}
                {animateHeader && <div className="w-full text-center font-bold text-lg -mt-3">{lastQuarterGameClock}</div>}
            </div>
        </div>
    );
};

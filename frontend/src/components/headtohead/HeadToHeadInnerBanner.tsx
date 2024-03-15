import { TrophyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { abbreviateTeamName } from 'src/lib/utils';
import Color from 'color-thief-react';

interface HeadToHeadInnerBannerProps {
    teamId: number;
    teamName: string;
    teamLogo: string | null;
    animateHeader: boolean;
    score: string;
    revealScore: boolean;
    isFinal: boolean;
    won: boolean;
    lineupNumber: number;
    headerDefaultColor: string;
    direction: 'left' | 'right';
    headerColor?: string;
    isHeadToHead?: boolean;
    loading?: boolean;
    onColorExtracted?: (color: string) => void;
}
export const HeadToHeadInnerBanner: React.FC<HeadToHeadInnerBannerProps> = ({
    teamName,
    teamId,
    animateHeader,
    teamLogo,
    won,
    isHeadToHead = true,
    revealScore,
    isFinal,
    score,
    lineupNumber,
    headerColor,
    headerDefaultColor,
    direction,
    loading,
    onColorExtracted,
}) => {
    const getTextColor = () => {
        if (lineupNumber === 1 && !headerColor) {
            return 'text-black';
        }

        if (lineupNumber === 2 && !headerColor) {
            return 'text-white';
        }

        if (headerColor) {
            const c = headerColor.substring(1);
            const rgb = parseInt(c, 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;

            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
            if (luma > 128) {
                return 'text-black';
            } else {
                return 'text-white';
            }
        }
    };

    return (
        <a
            href={`/locker-room/${teamId}`}
            target="_blank"
            className={classNames('flex col-span-1 w-full', {
                'order-1': direction === 'left',
                'order-2 md:order-3': direction === 'right',
                'flex-col items-start space-y-6': !animateHeader && direction === 'left',
                'flex-col items-start gap-6': !animateHeader && direction === 'right',
                'flex-row items-start space-y-2': animateHeader,
                '-mt-2': animateHeader && direction === 'right',
            })}
        >
            {direction === 'right' && (
                <div
                    className={classNames('flex flex-row w-full', {
                        hidden: !animateHeader,
                        'justify-start gap-8 items-center': loading && direction === 'right',
                        'items-center justify-start gap-1.5 md:gap-3 mt-1.5': !loading && animateHeader,
                    })}
                >
                    {!loading && teamLogo && (
                        <Color src={teamLogo} crossOrigin="anonymous" format="hex" quality={1}>
                            {({ data: color, loading: loadingImage }) => {
                                onColorExtracted(color);
                                return (
                                    <>
                                        {loadingImage ? (
                                            <div className="aspect-square w-14 h-14 md:w-32 md:h-32 animate-pulse bg-gray-300 rounded-full"></div>
                                        ) : (
                                            <img
                                                src={teamLogo}
                                                className={classNames('aspect-square rounded-full ', {
                                                    'md:w-32 md:h-32 w-14 h-14': !animateHeader,
                                                    'w-10 h-10 mt-0.5': animateHeader,
                                                })}
                                            />
                                        )}
                                    </>
                                );
                            }}
                        </Color>
                    )}
                    {!loading && !teamLogo && (
                        <div
                            className={classNames('aspect-square flex flex-col items-center justify-center bg-gray-300 rounded-full', {
                                'w-10 h-10 mt-0.5': animateHeader,
                            })}
                        >
                            <TrophyIcon className="text-white w-6 h-6" />
                        </div>
                    )}
                    {loading && <div className="aspect-square w-14 h-14 md:w-32 md:h-32 animate-pulse bg-gray-300 rounded-full"></div>}
                    {direction === 'right' && (
                        <span
                            className={classNames('heading-one font-bold flex flex-row items-center justify-start gap-0.5 md:gap-2 md:justify-end', {
                                'animate-pulse text-center h-14 md:h-24 bg-gray-300 w-full rounded-xl': loading,
                                'text-black text-left h-full leading-6 w-[50px] md:w-[100px] md:mr-2/3 text-[18px] md:text-[20px]':
                                    !loading && animateHeader,
                            })}
                        >
                            {revealScore && isFinal && won && <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-assist-green"></div>}
                            {revealScore && isFinal && !won && <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-defeat-red"></div>}
                            {loading ? '' : revealScore || isHeadToHead ? score : '-' || '-'}
                        </span>
                    )}
                </div>
            )}
            <div
                className={classNames('relative flex flex-col w-full justify-center', {
                    'items-start': direction === 'left',
                    'items-end': direction === 'right',
                    '-mt-2': animateHeader && direction === 'right',
                })}
            >
                <span
                    className={classNames(
                        'z-10 detail-one text-[7px] md:w-full sm:text-sm pl-2 md:pl-3 pt-2.5 pb-2 uppercase lg:whitespace-nowrap',
                        getTextColor(),
                        {
                            'pl-2': direction === 'left',
                            'pr-2 text-right': direction === 'right',
                            'w-[154px] h-[40px] align-middle': !animateHeader,
                            'w-[75px]': animateHeader,
                        }
                    )}
                >
                    {!animateHeader && <span>{loading ? '' : teamName}</span>}
                    {animateHeader && <span className="block md:hidden">{loading ? '' : abbreviateTeamName(teamName)}</span>}
                    {animateHeader && <span className="hidden md:block">{loading ? '' : teamName}</span>}
                </span>
                <div
                    style={{ backgroundColor: loading ? '#D1D5DB' : headerColor || headerDefaultColor }}
                    className={classNames('absolute', {
                        'clip-head-to-head-header-left': direction === 'right',
                        'clip-head-to-head-header-right': direction === 'left',
                        'animate-pulse h-[39px] mt-4': loading,
                        'w-full h-[49.5px] md:h-full': !animateHeader,
                        'w-[80px] h-full md:w-[300px] 2xl:w-[400px]': animateHeader,
                    })}
                ></div>
            </div>

            <div
                className={classNames('flex flex-row w-full', {
                    hidden: direction === 'right' && animateHeader,
                    'justify-end gap-8 items-center': loading && direction === 'left',
                    'justify-start gap-8 items-center': loading && direction === 'right',
                    'justify-between items-center': !loading && !animateHeader,
                    'items-start justify-end gap-1.5 md:gap-3': !loading && animateHeader,
                })}
            >
                {direction === 'left' && (
                    <span
                        className={classNames('heading-one text-black font-bold flex flex-row items-center gap-0.5 md:gap-2', {
                            'animate-pulse text-center h-14 md:h-24 bg-gray-300 w-full rounded-xl': loading,
                            'text-black justify-center text-center w-full md:text-[48px]': !loading && !animateHeader,
                            'text-black md:justify-start justify-end text-right h-full align-top leading-6 w-[50px] md:w-[100px] md:ml-2/3 text-[18px] md:text-[20px]':
                                !loading && animateHeader,
                        })}
                    >
                        {loading ? '' : revealScore || isHeadToHead ? score : '-' || '-'}
                        {animateHeader && revealScore && isFinal && won && (
                            <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-assist-green"></div>
                        )}
                        {animateHeader && revealScore && isFinal && !won && (
                            <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-defeat-red"></div>
                        )}
                        {!animateHeader && revealScore && isFinal && won && (
                            <div className="h-1.5 w-1.5 md:h-3 md:w-3 rounded-full bg-assist-green"></div>
                        )}
                        {!animateHeader && revealScore && isFinal && !won && (
                            <div className="h-1.5 w-1.5 md:h-3 md:w-3 rounded-full bg-defeat-red"></div>
                        )}
                    </span>
                )}
                {!loading && teamLogo && (
                    <Color src={teamLogo} crossOrigin="anonymous" format="hex" quality={1}>
                        {({ data: color, loading: loadingImage }) => {
                            onColorExtracted(color);
                            return (
                                <>
                                    {loadingImage ? (
                                        <div className="aspect-square w-14 h-14 md:w-32 md:h-32 animate-pulse bg-gray-300 rounded-full"></div>
                                    ) : (
                                        <img
                                            src={teamLogo}
                                            className={classNames('aspect-square rounded-full ', {
                                                'md:w-32 md:h-32 w-14 h-14': !animateHeader,
                                                'w-10 h-10 -mt-2': animateHeader,
                                            })}
                                        />
                                    )}
                                </>
                            );
                        }}
                    </Color>
                )}
                {!loading && !teamLogo && (
                    <div
                        className={classNames('aspect-square flex flex-col items-center justify-center bg-gray-300 rounded-full', {
                            'md:w-32 md:h-32 w-14 h-14': !animateHeader,
                            'w-10 h-10 -mt-2': animateHeader,
                        })}
                    >
                        <TrophyIcon
                            className={classNames('text-white', {
                                'md:w-14 md:h-14 w-8 h-8': !animateHeader,
                                'w-6 h-6': animateHeader,
                            })}
                        />
                    </div>
                )}
                {loading && <div className="aspect-square w-14 h-14 md:w-32 md:h-32 animate-pulse bg-gray-300 rounded-full"></div>}
                {direction === 'right' && (
                    <span
                        className={classNames('flex flex-row items-center gap-0.5 md:gap-2 heading-one font-bold', {
                            'animate-pulse text-center h-14 md:h-24 bg-gray-300 w-full rounded-xl': loading,
                            hidden: animateHeader,
                            'text-black justify-center text-center w-full md:text-[48px]': !loading && !animateHeader,
                        })}
                    >
                        {revealScore && isFinal && won && <div className="h-1.5 w-1.5 md:h-3 md:w-3 rounded-full bg-assist-green"></div>}
                        {revealScore && isFinal && !won && <div className="h-1.5 w-1.5 md:h-3 md:w-3 rounded-full bg-defeat-red"></div>}
                        {loading ? '' : revealScore || isHeadToHead ? score : '-' || '-'}
                    </span>
                )}
            </div>
        </a>
    );
};

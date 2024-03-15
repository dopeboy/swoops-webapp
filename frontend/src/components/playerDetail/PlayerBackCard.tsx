import { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Image from 'next/image';
import { displayPlayerStat, getSortedPositions } from 'src/lib/utils';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { PlayerBackCardAttribute } from '../common/PlayerBackCardAttribute';

interface PlayerBackCardBorderedTitleProps {
    player: ReadonlyPlayer;
}
export const PlayerBackCardBorderedTitle: React.FC<PlayerBackCardBorderedTitleProps> = ({ player }) => {
    return (
        <div className="flex flex-row items-center border border-assist-green w-full pt-2.5 pb-2 px-4 rounded-xl justify-between">
            <div className="flex flex-col items-center justify-center" data-tut="swoopster-categories">
                <span
                    className={classNames(
                        'subheading-three sm:subheading-two pd-xl:subheading-one pd-2xl:heading-three font-bold uppercase text-assist-green'
                    )}
                >
                    Position
                </span>
                <span className={classNames('subheading-two sm:subheading-one pd-xl:heading-three font-bold text-white')}>
                    <div className="flex w-full flex-row justify-center gap-1 capitalize">
                        {getSortedPositions(player.positions).map((position: string, index: number) => (
                            <span key={position + index}>
                                {position}
                                {index !== player.positions.length - 1 ? ' /' : ''}
                            </span>
                        ))}
                    </div>
                </span>
            </div>
            <div className="flex flex-col items-center justify-center" data-tut="swoopster-age-season">
                <span
                    className={classNames(
                        'subheading-three sm:subheading-two pd-xl:subheading-one pd-2xl:heading-three font-bold uppercase text-assist-green'
                    )}
                >
                    Season
                </span>
                <span className={classNames('subheading-two sm:subheading-one pd-xl:heading-three text-center font-bold text-white')}>
                    {player?.age}
                </span>
            </div>
            <div className="flex flex-col items-center justify-center" data-tut="swoopster-attributes">
                <span
                    className={classNames(
                        'subheading-three sm:subheading-two -mt-2 sm:-mt-1.5 pd-xl:subheading-one pd-2xl:heading-three font-bold uppercase text-assist-green'
                    )}
                >
                    Prospect
                </span>
                <div className={classNames('flex flex-row items-center justify-center gap-2')}>
                    {Array(player?.star_rating)
                        .fill(null)
                        .map((_, i) => (
                            <StarIcon
                                key={i}
                                className="h-3 w-3 text-yellow-500 sm:h-4 sm:w-4 pd-xl:mt-0.5 pd-xl:h-4.5 pd-xl:w-4.5 pd-2xl:h-5 pd-2xl:w-5"
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

interface PlayerBackCardNameProps {
    player: ReadonlyPlayer;
}
export const PlayerBackCardName: React.FC<PlayerBackCardNameProps> = ({ player }) => {
    return (
        <div className="flex w-full flex-col items-center">
            <span className="heading-two whitespace-break-spaces text-center pd-1.5xl:player-card-large font-bold text-white">
                {player?.full_name ?? ''}
            </span>
        </div>
    );
};

interface PlayerBackCardProps {
    player: ReadonlyPlayer;
    playerImageURL: string;
    withGradient: boolean;
}
export const PlayerBackCard: React.FC<PlayerBackCardProps> = ({ player, playerImageURL, withGradient }) => {
    const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_IMAGE_BASEURL;

    const imageLoader = ({ src, width, quality }) => {
        return `${imageBaseUrl}${src}?w=${width}&q=${quality || 75}&auto=format`;
    };
    
    const [isLargeScreen, setIsLargeScreen] = useState(window ? window.innerWidth > 640: true);

    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth > 640);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const stats = [
        {
            title: '3PT',
            field: 'three_pt_rating',
        },
        {
            title: '2PT-INT',
            field: 'interior_2pt_rating',
        },
        {
            title: '2PT-MID',
            field: 'midrange_2pt_rating',
        },
        {
            title: 'FT',
            field: 'ft_rating',
        },
        {
            title: 'DREB',
            field: 'drb_rating',
        },
        {
            title: 'OREB',
            field: 'orb_rating',
        },
        {
            title: 'PASS',
            field: 'ast_rating',
        },
        {
            title: 'IDEF',
            field: 'interior_defense_rating',
        },
        {
            title: 'PDEF',
            field: 'perimeter_defense_rating',
        },
        {
            title: 'PHY',
            field: 'physicality_rating',
        },
        {
            title: 'LONG',
            field: 'longevity_rating',
        },
        {
            title: 'HSTL',
            field: 'hustle_rating',
        },
        {
            title: 'IQ',
            field: 'bball_iq_rating',
        },
        {
            title: 'LDRS',
            field: 'leadership_rating',
        },
        {
            title: 'COACH',
            field: 'coachability_rating',
        },
    ];

    const isTopAttribute = (key: string) => {
        return player?.top_attributes?.includes(key);
    };

    return (
        <>
            {isLargeScreen ? (
                <div className="hidden lg:flex pt-3 pd-1.5xl:pt-5 pd-2xl:pt-8 pd-1.5xl:pr-6 pd-2xl:pr-8 relative max-w-[1200px] max-h-[675px] w-full h-full bg-[url('/images/back_card_without_bordered_title.png')] pd-xl:aspect-video pd-xl:bg-cover bg-no-repeat bg-contain rounded-xl">
                    <div className="flex flex-row items-end justify-between w-full h-full">
                        <div className="relative flex flex-col items-start justify-end w-full h-full mb-1.5">
                            <Image loader={imageLoader} src={playerImageURL} alt="Athlete profile picture" />
                        </div>
                        <div className="flex flex-col items-center justify-between w-full h-full gap-1 pd-1.5xl:gap-3">
                            <PlayerBackCardName player={player} />
                            <div className="h-full w-full flex flex-col items-center justify-start gap-3 pd-1.5xl:gap-6">
                                <PlayerBackCardBorderedTitle player={player} />
                                <div
                                    className="w-full justify-center items-center h-[60%] pd-1.5xl:h-[60%] pd-2xl:h-[70%] grid grid-cols-3 gap-y-2 pd-1.5xl:gap-y-3"
                                    data-tut="swoopster-attributes-all"
                                >
                                    {stats.map((stat) => (
                                        <PlayerBackCardAttribute
                                            key={stat.title}
                                            title={stat.title}
                                            value={displayPlayerStat(stat.field, player)}
                                            isAttributeRevealed={displayPlayerStat(stat.field, player) !== '-'}
                                            isTopAttribute={isTopAttribute(stat.field)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={classNames(
                        'p-2 flex flex-col items-center justify-center lg:hidden w-full h-full border-4 border-assist-green rounded-xl gap-2',
                        withGradient ? 'player-back-card-mobile-background' : ''
                    )}
                >
                    <PlayerBackCardName player={player} />
                    <PlayerBackCardBorderedTitle player={player} />
                    <div className="flex flex-col items-center justify-end h-full w-full border border-assist-green rounded-xl">
                        <div className="w-full h-full flex flex-col items-center justify-center pr-8">
                            <Image
                                loader={imageLoader}
                                src={playerImageURL}
                                width={527.75}
                                height={627.75}
                                className="object-cover"
                                alt="Athlete profile picture"
                            />
                        </div>
                    </div>
                    <div
                        className="w-full grid grid-cols-3 gap-y-3 px-2 border border-assist-green rounded-xl py-[5%]"
                        data-tut="swoopster-attributes-all"
                    >
                        {stats.map((stat) => (
                            <PlayerBackCardAttribute
                                key={stat.title}
                                title={stat.title}
                                value={displayPlayerStat(stat.field, player)}
                                isAttributeRevealed={displayPlayerStat(stat.field, player) !== '-'}
                                isTopAttribute={isTopAttribute(stat.field)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

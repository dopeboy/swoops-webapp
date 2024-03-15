import classNames from 'classnames';
import { useState } from 'react';

interface PlayerBackCardAttributeProps {
    title: string;
    value: string | number;
    isAttributeRevealed?: boolean;
    isTopAttribute?: boolean;
    delta: string;
    field: string;
    newlyRevealedRatings: string[];
    deltaStat: string;
}

export const PlayerBackCardAttributeDelta: React.FC<PlayerBackCardAttributeProps> = ({
    title,
    value,
    isAttributeRevealed,
    isTopAttribute,
    delta,
    newlyRevealedRatings,
    field,
    deltaStat,
}) => {
    const [hovering, setHovering] = useState<boolean>(false);

    const parsedDelta = parseFloat(delta);
    const roundedDelta = Math.round(parsedDelta);
    const formattedDelta = roundedDelta.toString();

    const isNewlyRevealed = newlyRevealedRatings?.includes(field?.toLowerCase());

    const shadowEffect = isNewlyRevealed ? 'newly-revealed-stat' : '';
    const yellowHaloEffect = isNewlyRevealed ? 'ring-2 ring-yellow-400' : '';

    let deltaColor = 'text-white'; // default color
    if (parsedDelta > 0) {
        deltaColor = 'text-assist-green'; // Green for positive values
    } else if (parsedDelta < 0) {
        deltaColor = 'text-red-600'; // Red for negative values
    }

    return (
        <div className="flex flex-col items-center justify-center">
            {!isTopAttribute && (
                <span className="uppercase text-assist-green subheading-two pd-1.5xl:subheading-one pd-2xl:heading-three font-bold mb-1">
                    {title}
                </span>
            )}
            {isTopAttribute && (
                <div className="relative flex flex-row items-center gap-2">
                    <span className="uppercase text-assist-green subheading-two pd-1.5xl:subheading-one pd-2xl:heading-three mb-1 font-bold">
                        {title}
                    </span>
                    {hovering && (
                        <div className="absolute uppercase w-full whitespace-break-spaces bottom-0 right-0 min-w-[120px] bg-off-black border border-white/16 text-white text-[12px] rounded-md mb-6 shadow-lg px-3 py-2">
                            This is one of your top 3 skills
                        </div>
                    )}
                    <div
                        data-tut="swoopster-attributes-combined"
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                        className={classNames('text-white', {
                            'cursor-pointer': hovering,
                        })}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EAB308" className={classNames('h-4 w-4 mb-[4.5px]')}>
                            <path
                                fillRule="evenodd"
                                d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            )}
            <span className={`text-white font-bold heading-two sm:heading-two pd-1.5xl:player-card-large pd-2xl:player-card-extra-large`}>
                <span className={`${shadowEffect}`}>{!isAttributeRevealed || value === '-' ? '??' : isNewlyRevealed ? deltaStat : value} </span>
                <span className={`sm:heading-two text-base ${deltaColor}`}>
                    {roundedDelta > 0 ? ` (+${formattedDelta})` : roundedDelta < 0 ? ` (${formattedDelta})` : isNewlyRevealed ? ' (+0)' : ''}
                </span>
            </span>
        </div>
    );
};

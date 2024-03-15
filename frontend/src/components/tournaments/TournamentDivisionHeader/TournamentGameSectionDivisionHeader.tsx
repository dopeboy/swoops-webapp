import { useRouter } from 'next/router';
import { useState } from 'react';
import { getDivisionButtonsForRoundAmount } from 'src/lib/utils';
import { DivisionButton } from 'src/models/division-button';
import { TournamentDivisionButton } from './TournamentDivisionButton';
import { TournamentFilterButton } from './TournamentFilterButton';

interface TournamentDivisionHeaderProps {
    id: string | string[];
    round: string | string[];
    isBracket?: boolean;
    roundAmount: number;
    showDivisionButton: boolean;
    showRevealButton?: boolean;
    setRevealAll?: (e) => void;
}
export const TournamentDivisionHeader: React.FC<TournamentDivisionHeaderProps> = ({
    id,
    roundAmount,
    round,
    isBracket = false,
    showDivisionButton,
    showRevealButton = false,
    setRevealAll,
}) => {
    const router = useRouter();

    const [divisionButtons] = useState<DivisionButton[]>(getDivisionButtonsForRoundAmount(roundAmount));

    const changeRound = (round: string | string[]) => {
        // The { scroll: false } prevents the page from scrolling to the top when the route changes
        if (isBracket) {
            router.push({ pathname: `/tournament/${id}/bracket/${round}` }, undefined, { scroll: false });
        } else {
            router.push({ pathname: `/tournament/${id}/series/${round}` }, undefined, { scroll: false });
        }
    };

    const findRound = (roundName: string): void => {
        const division = divisionButtons.find((division) => division.title === roundName);
        changeRound(division.round);
    };

    return (
        <div className={`sm:pl-12 sm:pr-12 pr-0 pl-0 w-full flex justify-between flex-row sm:flex-row items-center bg-off-black pt-3 pb-4 md:py-3`}>
            <div className="px-2 md:px-0 md:hidden md:items-center w-[50%] h-full mt-1.5">
                <div className="relative w-full lg:max-w-sm h-full">
                    <select
                        onChange={(e) => findRound(e.target.value)}
                        className="w-full h-full p-2.5 bg-white/4 text-base leading-6 text-white border-r-2 rounded-lg shadow-sm outline-none appearance-none focus:border-off-black  border-solid border-off-black"
                    >
                        {divisionButtons.map((division, index) => (
                            <option className="text-white text-base" key={index}>
                                {division.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="px-2 hidden md:px-0 grid grid-cols-3 md:flex md:flex-row md:items-center w-full max-w-6xl">
                {divisionButtons.map((button, index) => (
                    <TournamentDivisionButton
                        key={button.title}
                        index={index}
                        round={button.round}
                        title={button.title}
                        isSelected={button.round.toString() === round.toString()}
                        onClick={(round: string | string[]) => changeRound(round)}
                        isFirst={button?.isFirst}
                        isLast={button?.isLast}
                    />
                ))}
            </div>
            <div className="flex flex-row items-center justify-start h-full gap-1.5 mt-1.5 mr-1.5 md:ml-3 md:mt-0 col-span-3">
                {/* {showDivisionButton && <TournamentFilterButton title="Filter by Division" onClick={() => null} />} */}
                {showRevealButton && (
                    <button
                        onClick={() => {
                            setRevealAll(true);
                        }}
                        className={'bg-assist-green px-6 py-4 subheading-three rounded-lg text-black'}
                    >
                        Reveal All Series
                    </button>
                )}
            </div>
        </div>
    );
};

import classNames from 'classnames';
import { ReactElement } from 'react';
import { MaxSwoopstersPopover } from './MaxSwoopstersPopover';

interface MaxSwoopstersButtonGroupProps {
    onClick: (selectedOption: number) => void;
    userOwnedPlayerAmount: number;
    tokensRequired: number;
}

export const MaxSwoopstersButtonGroup: React.FC<MaxSwoopstersButtonGroupProps> = ({ onClick, tokensRequired }): ReactElement => {
    return (
        <div className="flex flex-row items-end justify-center gap-2" data-tut="lobby-swoopsters">
            <MaxSwoopstersPopover />
            <div className="flex flex-col items-center justify-center gap-1 -mt-2">
                <h2 className="text-white text-base font-medium">Max Swoopsters</h2>
                <div className="flex flex-row items-center justify-center gap-1">
                    {[1, 3, 5].map((tokens) => (
                        <button
                            onClick={() => onClick(tokens)}
                            className={classNames(
                                'inline-flex w-full justify-center rounded-md font-medium px-3 sm:px-4 text-base py-1.5 hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ',
                                {
                                    'bg-white text-off-black': tokens === tokensRequired,
                                    'bg-white/4 hover:bg-white/8 text-white': tokens !== tokensRequired,
                                }
                            )}
                        >
                            {tokens}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

import { ReactElement, useEffect } from 'react';
import classNames from 'classnames';

interface CourtroomFilterProps {
    gamesType: 'All Games' | 'My Games';
    setGamesType: (gamesType: 'All Games' | 'My Games') => void;
    filterGames: (gamesType: 'All Games' | 'My Games') => void;
    currentTeamId: number;
}

const CourtroomFilter: React.FC<CourtroomFilterProps> = ({ filterGames, gamesType, setGamesType, currentTeamId }): ReactElement => {
    const gamesButton: any[] = [
        {
            title: 'All Games',
        },
        {
            title: 'My Games',
        },
    ];

    useEffect(() => {
        filterGames(gamesType);
    }, [gamesType]);

    return currentTeamId ? (
        <div className="pb-4 pl-3 sm:px-12">
            <div className="flex flex-col justify-start lg:flex-row items-start lg:space-x-4">
                <div className="pt-4 relative inline-flex align-middle">
                    {gamesButton.map((button, idx) => (
                        <button
                            key={idx}
                            type="button"
                            className={classNames(
                                'bg-white/4 hover:bg-white/8 text-base border-r-2 border-solid border-off-black relative flex-auto text-white inline-block font-medium text-center align-middle no-underline leading-6 rounded-none',
                                {
                                    'p-1': gamesType === button.title,
                                    'px-3 py-3 hover:bg-white/8': gamesType !== button.title,
                                    'rounded-l-md': idx === 0,
                                    'rounded-r-md': idx === gamesButton.length - 1,
                                }
                            )}
                            onClick={() => {
                                setGamesType(button.title);
                            }}
                        >
                            <span
                                className={classNames({
                                    'bg-white text-off-black px-2 py-3 rounded-md': gamesType === button.title,
                                })}
                            >
                                {button.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    ) : (
        <></>
    );
};

export default CourtroomFilter;

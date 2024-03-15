import { ReactElement } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { MyRosterBadge } from '../common/MyRosterBadge';
import { Player } from 'src/lib/api';
import { getSortedPositions } from 'src/lib/utils';
import { Position } from 'src/models/position.type';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CurrentLineupProps {
    addPlayerToSelection?: (player: Player, shouldRemove: boolean) => void;
    selectedPlayers: Array<ReadonlyPlayer>;
    showOnlyLineup?: boolean;
    tokensRequired: number;
    filterPosition?: (position: Position) => void;
    showRoster?: boolean;
}

export const CurrentLineup: React.FC<CurrentLineupProps> = ({
    selectedPlayers,
    showOnlyLineup,
    addPlayerToSelection,
    tokensRequired,
    filterPosition,
    showRoster = true,
}): ReactElement => {
    const positions = [
        { title: 'guard', value: 'G' },
        { title: 'guard', value: 'G' },
        { title: 'forward', value: 'F' },
        { title: 'forward', value: 'F' },
        { title: 'center', value: 'C' },
    ];
    const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_IMAGE_BASEURL;
    return (
        <div className="hidden sm:flex sm:flex-col sm:items-start sm:justify-center w-full max-w-5xl">
            {!showOnlyLineup && <div className="subheading-one text-white">your lineup</div>}
            {!showOnlyLineup && (
                <div className="flex flex-row items-center justify-start gap-1 text-display text-white">
                    <InformationCircleIcon className="h-5 w-5 text-white" />
                    {`Choose a maximum of ${tokensRequired || 5} player${
                        !tokensRequired || tokensRequired > 1 ? 's' : ''
                    } from your Roster and fill out the rest from the Free Agent market to compete in this contest.`}
                </div>
            )}
            <div className="flex flex-row justify-center mt-2 max-w-5xl">
                {positions.map((position, idx) => (
                    <div key={position.title + idx} className="pl-5 first:pl-0" data-tut="filter-position">
                        <div className={classNames(showOnlyLineup ? 'border border-white/16 rounded-lg p-2' : '')}>
                            {!selectedPlayers[idx] && (
                                <Image
                                    onClick={() => (filterPosition ? filterPosition(position.value as Position) : null)}
                                    className={classNames('player-not-chosen object-cover rounded-lg bg-off-black cursor-pointer')}
                                    width={750}
                                    height={750}
                                    src="/images/LineupPlayer.png"
                                />
                            )}
                            {Number.isFinite(selectedPlayers[idx]?.token) && (
                                <div className="relative">
                                    {selectedPlayers[idx].token && (
                                        <img
                                            className={classNames('rounded-lg bg-off-black w-[750px] object-fill')}
                                            alt="Player image card"
                                            src={`${imageBaseUrl}${selectedPlayers[idx].token}.png?auto=format&width=300`}
                                        />
                                    )}
                                    {addPlayerToSelection && (
                                        <button
                                            data-tut={!selectedPlayers[idx]?.team ? 'remove-player' : ''}
                                            className="text-black flex flex-row items-center pb-[1.5px] pt-[1px] justify-end gap-1 absolute right-1 top-1 cursor-pointer bg-white hover:bg-white/80 rounded-full w-fit text-center"
                                            onClick={() => {
                                                addPlayerToSelection(selectedPlayers[idx], true);
                                            }}
                                        >
                                            <span className="text-[9px] detail-one pl-[6.5px] pt-[2px]">Remove</span>
                                            <span className="flex flex-col items-center justify-center text-black pr-[4.5px]">
                                                <XMarkIcon className="w-[12px] h-[12px] stroke-4" />
                                            </span>
                                        </button>
                                    )}
                                </div>
                            )}
                            {!selectedPlayers[idx] ? (
                                <div className="text-white subheading-one overflow-none w-48 mt-3">{position.title}</div>
                            ) : (
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex flex-row items-center gap-1">
                                        {getSortedPositions(selectedPlayers[idx].positions).map((position: string, index: number) => (
                                            <span key={position + index} className="text-[10px] capitalize detail-one mt-2 -mb-1.5 text-gray-400">
                                                {position}
                                                {index !== selectedPlayers[idx].positions.length - 1 ? ' /' : ''}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-white subheading-one overflow-none w-48">{`${selectedPlayers[idx].full_name ?? ''}`}</div>
                                    {selectedPlayers[idx].team && showRoster && <MyRosterBadge />}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

import { ReactElement } from 'react';
import classNames from 'classnames';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { MyRosterBadge } from '../common/MyRosterBadge';
import { Player } from 'src/lib/api';
import { getSortedPositions } from 'src/lib/utils';
import { Position } from 'src/models/position.type';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MobileCurrentLineupProps {
    addPlayerToSelection?: (player: Player, shouldRemove: boolean) => void;
    selectedPlayers: Array<ReadonlyPlayer>;
    showOnlyLineup?: boolean;
    tokensRequired: number;
    filterPosition?: (position: Position) => void;
    showRoster?: boolean;
}

export const MobileCurrentLineup: React.FC<MobileCurrentLineupProps> = ({
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
        <div className="sm:hidden pt-8 px-4 w-full">
            {!showOnlyLineup && <div className="subheading-one text-white">your lineup</div>}
            {!showOnlyLineup && (
                <div className="flex flex-row items-center justify-start gap-1 text-display text-white">
                    {`Choose a maximum of ${tokensRequired || 5} player${
                        !tokensRequired || tokensRequired > 1 ? 's' : ''
                    } from your Roster and fill out the rest from the Free Agent market to compete in this contest.`}
                </div>
            )}
            <div className="flex flex-col relative divide-y divide-white/16 w-full items-center gap-3 justify-center mt-5 pt-1 pb-4 px-4 border border-white rounded-xl">
                {positions.map((position, idx) => (
                    <div
                        key={position.title + idx}
                        onClick={() => (filterPosition ? filterPosition(position.value as Position) : null)}
                        className="relative flex flex-row items-center justify-start w-full gap-5 pt-3"
                    >
                        <div>
                            <div className={classNames(showOnlyLineup ? 'relative border border-white/16 rounded-lg' : '')}>
                                {!selectedPlayers[idx] && (
                                    <div className=" bg-off-black border w-[90px] h-[72px] border-white/16 rounded-lg">
                                        <img
                                            className={classNames(
                                                'player-not-chosen w-36 absolute -top-2 -left-8 object-cover rounded-lg cursor-pointer clip-player-front-image'
                                            )}
                                            src="/images/LineupPlayer.png"
                                        />
                                    </div>
                                )}
                            </div>
                            {Number.isFinite(selectedPlayers[idx]?.token) && (
                                <div className="border border-white/16 rounded-lg">
                                    <div className="bg-off-black w-[90px] h-[72px] rounded-lg">
                                        {selectedPlayers[idx].token && (
                                            <img
                                                className={classNames('rounded-lg w-36 absolute top-5 -left-8 object-cover clip-player-front-image')}
                                                alt="Player image card"
                                                src={`${imageBaseUrl}${selectedPlayers[idx].token}_no_bg.png?auto=format&width=300`}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col w-full">
                            {!selectedPlayers[idx] ? (
                                <div className="flex flex-col items-start justify-center gap-0.5">
                                    <div className="text-white align-middle text-left subheading-three overflow-none">{position.title}</div>
                                </div>
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
                                    <div className="text-white subheading-three overflow-none w-48">{`${selectedPlayers[idx].full_name ?? ''}`}</div>
                                    {selectedPlayers[idx].team && showRoster && <MyRosterBadge />}
                                    {addPlayerToSelection && (
                                        <button
                                            data-tut="remove-player"
                                            onClick={() => {
                                                addPlayerToSelection(selectedPlayers[idx], true);
                                            }}
                                            className="absolute right-0 top-7 flex items-center justify-center btn-primary text-white bg-white/4 h-8 w-8"
                                        >
                                            <XMarkIcon className="h-5 w-5 text-white" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

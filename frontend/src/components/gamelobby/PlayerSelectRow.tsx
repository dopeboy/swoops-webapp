import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { Dispatch, SetStateAction, Fragment } from 'react';
import { getSortedPositions } from 'src/lib/utils';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { StarRating } from '../common/StarRating';
import { CollapsiblePlayer } from '../lockerRoom/MobileRosterTable';

interface PlayerSelectRow {
    player: CollapsiblePlayer;
    addPlayerToSelection: (player: CollapsiblePlayer, isAddedToRoster: boolean) => void;
    isFreeAgent: boolean;
    setSelectedPlayer: Dispatch<SetStateAction<CollapsiblePlayer>>;
    setSlideOverOpen: (isOpen: boolean) => void;
    isAddedToRoster: boolean;
}

export const PlayerSelectRow: React.FC<PlayerSelectRow> = ({
    setSelectedPlayer,
    setSlideOverOpen,
    player,
    addPlayerToSelection,
    isAddedToRoster,
}) => {
    return (
        <tr
            onClick={() => {
                setSelectedPlayer(player);
                setSlideOverOpen(true);
            }}
            data-tut="player-attributes"
            className="hover:cursor-pointer hover:bg-off-black/20"
            key={player.id + player.full_name}
        >
            <td
                className="pl-4 -mr-4"
                onClick={(e) => {
                    e.stopPropagation();
                }}
                data-tut="enter-players"
            >
                <button
                    data-tut="add-lineup-list"
                    className={classNames(
                        !isAddedToRoster ? 'bg-white  border-black ' : 'bg-black border-white',
                        'inline-block w-fit p-1 mr-2 border-2 rounded-lg'
                    )}
                    onClick={() => {
                        addPlayerToSelection(player, isAddedToRoster);
                    }}
                >
                    {isAddedToRoster ? <MinusIcon className="h-6 w-6 stroke-4 text-white" /> : <PlusIcon className="h-6 w-6 stroke-4" />}
                </button>
            </td>
            <td className="-ml-2 pr-2 pt-4 whitespace-nowrap w-64" data-tut="available-players">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                        <PlayerAvatar playerToken={player?.token} width={80} height={80} className={'w-20 rounded-t-100'} />
                    </div>
                    <div className="ml-2 pb-4">
                        <a>
                            <div className="text-[16px] text-display uppercase text-white font-semibold">{player?.full_name ?? ''}</div>
                        </a>
                    </div>
                </div>
            </td>
            <td className="w-full py-4 whitespace-nowrap text-base text-display text-white text-center ">
                <div className="w-full flex flex-row gap-1 justify-center capitalize">
                    {getSortedPositions(player.positions).map((position: string, index: number) => (
                        <div key={position + index}>
                            {position && (
                                <span>
                                    <span className="font-semibold">{position[0]}</span>
                                    {index !== player.positions.length - 1 ? ' /' : ''}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{Number(player?.age ?? 0).toFixed(0)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">
                <StarRating rating={player?.star_rating} />
            </td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{Number(player?.ppg).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{(Number(player?.fg_pct ?? 0) * 100).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">
                {(Number(player?.three_p_pct ?? 0) * 100).toFixed(1)}
            </td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{(Number(player?.ft_pct ?? 0) * 100).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{Number(player?.orpg).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{Number(player?.drpg).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{Number(player?.rpg).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{Number(player?.apg).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{Number(player?.spg).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{Number(player?.bpg).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{Number(player?.tpg).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">{Number(player?.fpg).toFixed(1)}</td>
            <td className="w-full py-4 whitespace-nowrap subheading-two text-center text-white">
                {!player ? '-' : `${Number(player?.wins ?? 0).toFixed(0)}-${Number(player?.losses ?? 0).toFixed(0)}`}
            </td>
        </tr>
    );
};

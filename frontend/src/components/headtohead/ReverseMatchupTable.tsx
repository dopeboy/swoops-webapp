import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { useTableSort } from 'src/hooks/useTableSort';
import { User } from 'src/lib/api';
import { EmptyRosterPlayer, getSortedPositions, getUserDetail } from 'src/lib/utils';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { PlayerSlideOver } from '../common/PlayerSlideOver';
import { WaitingOnOpponentPlaceholder } from '../common/WaitingOnOpponentPlaceholder';
import { PlayerSelectTableHeader } from '../gamelobby/PlayerSelectTableHeader';
import { CollapsiblePlayer } from '../lockerRoom/MobileRosterTable';

interface ReverseMatchupTableProps {
    teamName: string;
    availablePlayers: Array<ReadonlyPlayer>;
}

const ReverseMatchupTable: React.FC<ReverseMatchupTableProps> = ({ availablePlayers, teamName }): ReactElement => {
    const router = useRouter();
    const headers: Array<SortableHeader> = [
        { title: 'APG', value: 'apg', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'RPG', value: 'rpg', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'PPG', value: 'ppg', sortDirection: SortDirection.NONE, sortable: true },
        { title: 'Player', value: 'name', sortDirection: SortDirection.NONE, sortable: true },
    ];
    const [user, setUser] = useState<User>();
    const [slideOverOpen, setSlideOverOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<ReadonlyPlayer>(EmptyRosterPlayer);
    const { tableHeaders, players, updateSortDirection } = useTableSort((availablePlayers as CollapsiblePlayer[]) || [], headers);

    const openSlideOver = (player: ReadonlyPlayer): void => {
        setSelectedPlayer(player);
        setSlideOverOpen(true);
    };

    const goToPlayerDetail = (playerId: number): void => {
        router.push({ pathname: `/player-detail/${playerId}/current` });
    };

    useEffect(() => {
        setUser(getUserDetail());
    }, []);

    return (
        <div className="hidden sm:block w-1/2 rounded-r-lg border divide-y divide-white/16 border-white/16">
            <div className="w-full overflow-x-visible pt-3 pb-2 px-4 subheading-two text-white text-right">
                {teamName ? `${teamName} Lineup` : 'Waiting for opponent'}
            </div>
            {teamName?.length > 0 && players && players?.length > 0 && (
                <table className="w-full divide-y divide-white/16">
                    <PlayerSelectTableHeader headers={tableHeaders} reverse={true} updateSortDirection={updateSortDirection} />
                    <tbody className="w-full divide-y-1 divide-white/16">
                        {players.map((player) => (
                            <tr
                                key={player.id + player.full_name}
                                className="relative h-32 hover:cursor-pointer hover:bg-off-black/40"
                                onClick={() => openSlideOver(player)}
                            >
                                <td className="pl-8 pr-6 py-4 subheading-one text-center text-white">
                                    {player?.apg ? Number(player?.apg).toFixed(1) : '-'}
                                </td>
                                <td className="px-6 py-4 subheading-one text-center text-white">
                                    {player?.rpg ? Number(player?.rpg).toFixed(1) : '-'}
                                </td>
                                <td className="px-6 py-4 subheading-one text-center text-white">
                                    {player?.ppg ? Number(player?.ppg).toFixed(1) : '-'}
                                </td>
                                <td className="px-2 pt-4">
                                    <a className="hover:cursor-pointer flex flex-row items-end justify-end pt-4">
                                        <div className="absolute top-1/3 right-28 flex flex-col items-center">
                                            <div className="flex flex-row items-center justify-end gap-2 mr-4 pb-8">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex flex-row items-center justify-end gap-2">
                                                        {player?.team === user?.team?.id && <img className="h-5 w-5" src="/images/WhiteShield.svg" />}
                                                        <div className="text-[12px] flex-wrap uppercase text-left detail-one text-display text-white font-semibold">
                                                            {player.full_name ?? ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-row gap-1 items-center justify-center text-[14px] text-display text-gray-400">
                                                        {getSortedPositions(player.positions).map((position: string, index: number) => (
                                                            <div key={position + index}>
                                                                {position && (
                                                                    <span>
                                                                        <span className="font-semibold capitalize">{position}</span>
                                                                        {index !== player.positions.length - 1 ? ' /' : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <PlayerAvatar
                                            playerToken={player?.token}
                                            width={256}
                                            height={256}
                                            className={'absolute -right-12 top-[11px] w-64 h-64 clip-player-front-image'}
                                        />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <WaitingOnOpponentPlaceholder shouldShow={!players || players?.length === 0} />
            <PlayerSlideOver
                onClick={(player) => goToPlayerDetail(player?.token)}
                actionText="View Detail"
                setOpen={setSlideOverOpen}
                open={slideOverOpen}
                selectedPlayer={selectedPlayer}
            />
        </div>
    );
};

export default ReverseMatchupTable;

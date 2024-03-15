import classNames from 'classnames';
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
import { MatchupTableHeader } from '../gamelobby/MatchupTableHeader';
import { CollapsiblePlayer } from '../lockerRoom/MobileRosterTable';

interface MatchupTableProps {
    teamName: string;
    lineupNumber: number;
    availablePlayers: Array<ReadonlyPlayer>;
}

const MatchupTable: React.FC<MatchupTableProps> = ({ availablePlayers, lineupNumber, teamName }): ReactElement => {
    const router = useRouter();
    const headers: Array<SortableHeader> = [
        { title: 'Player', value: 'name', sortDirection: SortDirection.NONE },
        { title: 'PPG', value: 'ppg', sortDirection: SortDirection.NONE },
        { title: 'RPG', value: 'rpg', sortDirection: SortDirection.NONE },
        { title: 'APG', value: 'apg', sortDirection: SortDirection.NONE },
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
        <div
            className={classNames('hidden sm:block w-full border divide-y divide-white/16 border-white/16', {
                'rounded-t-lg': lineupNumber === 1,
                'rounded-b-lg': lineupNumber === 2,
            })}
        >
            <div className="w-full overflow-x-visible pt-3 pb-2 px-4 subheading-two text-white">{teamName} Lineup</div>
            {players?.length > 0 && (
                <table className="w-full divide-y divide-white/16">
                    <MatchupTableHeader headers={tableHeaders} updateSortDirection={updateSortDirection} />
                    <tbody className="w-full divide-y-1 divide-white/16">
                        {players.map((player) => (
                            <tr
                                key={player.id + player.full_name}
                                className="relative w-full h-10 hover:cursor-pointer hover:bg-off-black/40"
                                onClick={() => openSlideOver(player)}
                            >
                                <td className="px-2 pt-2 w-64">
                                    <a className="flex items-center w-64">
                                        <div className="flex flex-row items-center justify-start gap-2 ml-4 top-1/3 pb-2">
                                            <div className="flex flex-col items-start">
                                                <PlayerAvatar
                                                    playerToken={player?.token}
                                                    width={256}
                                                    height={256}
                                                    className={'absolute -left-8 top-[5px] w-28 h-28 clip-player-front-image transform -scale-x-100'}
                                                />
                                                <div className="ml-10 text-[12px] flex-wrap detail-one text-left uppercase whitespace-nowrap text-display text-white font-semibold">
                                                    {player?.full_name ?? ''}
                                                </div>
                                                <div className="ml-10 flex flex-row items-center gap-2">
                                                    {player?.team && user?.team?.id
                                                        ? player.team === user.team.id && <img className="h-5 w-5" src="/images/WhiteShield.svg" />
                                                        : ''}
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
                                    </a>
                                </td>
                                <td className="py-4 subheading-one text-center text-white">{player?.current_season_stats?.ppg ? Number(player?.current_season_stats?.ppg)?.toFixed(1) : '-'}</td>
                                <td className="py-4 subheading-one text-center text-white">{player?.current_season_stats?.rpg ? Number(player?.current_season_stats?.rpg)?.toFixed(1) : '-'}</td>
                                <td className="py-4 subheading-one text-center text-white">{player?.current_season_stats?.apg ? Number(player?.current_season_stats?.apg)?.toFixed(1) : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {(!players || players.length === 0) && (
                <div className="w-full h-20 flex items-center justify-center subheading-one text-white">Waiting for opponent</div>
            )}
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

export default MatchupTable;

import { ArrowDownIcon, ArrowUpIcon, ArrowsUpDownIcon, ChevronDownIcon, ChevronRightIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { useTableSort } from 'src/hooks/useTableSort';
import { User } from 'src/lib/api';
import { playerTableHeaders, rosterTableStatGrid } from 'src/lib/constants';
import { displayPlayerStat, EmptyRosterPlayer, getSortedPositions, getUserDetail } from 'src/lib/utils';
import { SortDirection } from 'src/models/sort-direction.enum';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { PlayerSlideOver } from '../common/PlayerSlideOver';
import { PlayerStat } from '../common/PlayerStat';
import { StarRating } from '../common/StarRating';
import { CollapsiblePlayer } from '../lockerRoom/MobileRosterTable';

interface MobileMatchupTableProps {
    teamName: string;
    availablePlayers: Array<CollapsiblePlayer>;
}
const primarySortingStats = ['name', 'positions', 'ppg', 'wl'];

const MobileMatchupTable: React.FC<MobileMatchupTableProps> = ({ availablePlayers, teamName }): ReactElement => {
    const router = useRouter();
    const [user, setUser] = useState<User>();
    const [slideOverOpen, setSlideOverOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<CollapsiblePlayer>(EmptyRosterPlayer);
    const { tableHeaders, players, setPlayers, updateSortDirection } = useTableSort(availablePlayers || [], playerTableHeaders);
    const [showAdditionalFilters, setShowAdditionalFilters] = useState<boolean>(false);

    const collapsePlayer = (player: CollapsiblePlayer) => (): void => {
        setPlayers((prevPlayers: CollapsiblePlayer[]) => {
            return prevPlayers.map((prevPlayer) => {
                if (prevPlayer.id === player.id) {
                    return { ...prevPlayer, shouldDisplayStats: !prevPlayer.shouldDisplayStats } as CollapsiblePlayer;
                }
                return prevPlayer;
            });
        });
    };

    const openSlideOver = (player: CollapsiblePlayer): void => {
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
        <div className="sm:hidden w-full border divide-y divide-white/16 border-white/16">
            <div className="w-full overflow-x-visible pt-3 pb-2 px-4 subheading-two text-white">{teamName} Lineup</div>
            <div className="sm:hidden flex flex-col w-full bg-black pb-4">
                {tableHeaders && players && players.length > 0 && (
                    <div className="flex flex-row items-center justify-start gap-2 pt-3 pl-2">
                        {tableHeaders
                            ?.filter((header) => primarySortingStats.includes(header.value))
                            .map((header) => (
                                <div
                                    key={header.value}
                                    onClick={() => updateSortDirection && updateSortDirection(header)}
                                    className={classNames(
                                        'flex flex-row items-center justify-between w-fit px-4 py-2 cursor-pointer rounded-xl border border-off-black',
                                        {
                                            'bg-off-black': header.sortDirection !== SortDirection.NONE,
                                        }
                                    )}
                                >
                                    <div className="text-white text-base">{header.title}</div>
                                    <div className="flex flex-row items-center">
                                        <div className="ml-2">
                                            {header.sortDirection === SortDirection.DESC && header.value !== 'rank' && (
                                                <ArrowDownIcon className="h-3 w-3 text-white border-white" strokeWidth={3} />
                                            )}
                                            {header.sortDirection === SortDirection.ASC && header.value !== 'rank' && (
                                                <ArrowUpIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                            )}
                                            {header.sortDirection === SortDirection.NONE && header.value !== 'rank' && (
                                                <ArrowsUpDownIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
                {players && players.length > 0 && (
                    <button
                        onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
                        className="flex flex-row items-center gap-2 py-2 mt-2 justify-center w-full"
                    >
                        <span className="subheading-three text-white">More filters</span>
                        {showAdditionalFilters ? (
                            <ChevronDownIcon className="h-4 w-4 text-white -mt-1" />
                        ) : (
                            <ChevronRightIcon className="h-4 w-4 text-white -mt-1" />
                        )}
                    </button>
                )}
                {tableHeaders && players && players.length > 0 && showAdditionalFilters && (
                    <div className="grid grid-cols-4 items-center gap-2 pt-2 px-2">
                        {tableHeaders
                            ?.filter((header) => !primarySortingStats.includes(header.value))
                            .map((header) => (
                                <div
                                    key={header.value}
                                    onClick={() => updateSortDirection && updateSortDirection(header)}
                                    className={classNames(
                                        'flex flex-row items-center justify-between w-full px-4 py-2 cursor-pointer rounded-xl border border-off-black',
                                        {
                                            'bg-off-black': header.sortDirection !== SortDirection.NONE,
                                        }
                                    )}
                                >
                                    <div className="text-white text-base">{header.title}</div>
                                    <div className="flex flex-row items-center">
                                        <div className="ml-2">
                                            {header.sortDirection === SortDirection.DESC && header.value !== 'rank' && (
                                                <ArrowDownIcon className="h-3 w-3 text-white border-white" strokeWidth={3} />
                                            )}
                                            {header.sortDirection === SortDirection.ASC && header.value !== 'rank' && (
                                                <ArrowUpIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                            )}
                                            {header.sortDirection === SortDirection.NONE && header.value !== 'rank' && (
                                                <ArrowsUpDownIcon className="h-3 w-3 text-white" strokeWidth={3} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
                {players && players.length > 0 && (
                    <div className="mt-2">
                        {players.map((player) => (
                            <div key={player.id} className="relative flex flex-col px-2 my-1 items-center justify-center w-full">
                                <div
                                    onClick={collapsePlayer(player)}
                                    className="relative flex flex-row h-20 items-center w-full bg-black border-off-black border rounded-md py-3"
                                >
                                    <div className="whitespace-nowrap w-32">
                                        <div className="flex items-center">
                                            <PlayerAvatar
                                                playerToken={player?.token}
                                                height={160}
                                                width={160}
                                                className={'absolute top-[6px] -left-[48px] h-40 w-40 clip-player-front-image'}
                                            />
                                            <div className="relative">
                                                <div className="left-[75px] -top-5 absolute text-base text-display text-gray-900 uppercase dark:text-white font-semibold">
                                                    <div className="flex flex-col items-start gap-1">
                                                        {player?.full_name ?? ''}
                                                        <div className="flex flex-row items-center justify-start -mt-1.5 gap-2">
                                                            {player?.team && user?.team?.id
                                                                ? player.team === user.team.id && (
                                                                      <img className="h-4 w-4" src="/images/WhiteShield.svg" />
                                                                  )
                                                                : ''}
                                                            <div className="whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                                                                <div className="whitespace-nowrap text-[12px] detail-one text-center text-gray-500 dark:text-white">
                                                                    <StarRating rating={player?.star_rating} size="h-3 w-3" />
                                                                </div>
                                                            </div>
                                                            <span className="subheading-two">-</span>
                                                            <div className="whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                                                                <div className="flex flex-col items-start">
                                                                    <div className="w-full flex flex-row gap-1 items-center justify-center">
                                                                        {getSortedPositions(player.positions).map(
                                                                            (position: string, index: number) => (
                                                                                <span key={position + index}>
                                                                                    {position}
                                                                                    {index !== player.positions.length - 1 ? ' /' : ''}
                                                                                </span>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-[190px] pr-4 mt-1.5 w-full flex flex-row items-center justify-between gap-2">
                                        <div className="whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                                            <div className="flex flex-col items-center">
                                                <span className="subheading-one uppercase">PTS</span>
                                                <span className="subheading-two uppercase">{displayPlayerStat('ppg', player)}</span>
                                            </div>
                                        </div>
                                        <div className="whitespace-nowrap capitalize font-semibold text-base text-gray-500 text-center dark:text-white">
                                            <div className="flex flex-col items-center">
                                                <span className="subheading-one uppercase">W/L</span>
                                                <span className="subheading-two uppercase">{displayPlayerStat('wl', player)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {!player?.shouldDisplayStats && <ChevronDownIcon className="mt-0.5 text-off-black h-4 w-4" />}
                                {player?.shouldDisplayStats && <ChevronUpIcon className="mt-0.5 text-off-black h-4 w-4" />}
                                {player?.shouldDisplayStats && (
                                    <div className="grid grid-cols-3 w-full gap-1 mt-2 mb-3">
                                        {rosterTableStatGrid.map((stat) => (
                                            <PlayerStat key={stat.title} statName={stat.title} statValue={displayPlayerStat(stat.value, player)} />
                                        ))}
                                        <div className="col-span-2">
                                            <button onClick={() => openSlideOver(player)} className="btn-rounded-white heading-three w-full">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {!players ||
                    (players.length === 0 && (
                        <div className="flex flex-col items-center justify-center w-full h-20 text-white subheading-one">Waiting for Opponent...</div>
                    ))}
            </div>
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

export default MobileMatchupTable;

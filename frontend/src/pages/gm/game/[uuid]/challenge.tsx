import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from 'src/components/gm/common/MainLayout';
import { ApiService, Game, User } from 'src/lib/gm/api';
import { Player } from 'src/lib/gm/api/models/Player';
import { GameUpdate } from 'src/lib/gm/api/models/GameUpdate';
import { getUser } from 'src/lib/gm/utils';
import withAuth from 'src/components/gm/common/withAuth';

type PlayerSelection = {
    ownerUuid: string;
    playerUuid: string;
};

const RESULT_PAGE_PATH = (uuid: string): string => `/game/${uuid}/result`;

const Challenge = (): ReactElement => {
    const router = useRouter();
    const [game, setGame] = useState<Game>({} as Game);
    const [selectedPlayers, setSelectedPlayers] = useState<PlayerSelection[]>([]);

    const getGame = async (uuid: string): Promise<void> => {
        try {
            const game = await ApiService.apiGameRead(uuid);
            if (game.status !== Game.status.OPEN) router.replace(RESULT_PAGE_PATH(uuid));

            setGame(game);
        } catch (err) {
            console.error('Error getting game: ' + err);
        }
    };

    useEffect(() => {
        if (!router.isReady) return;

        const { uuid } = router.query;
        getGame(uuid as string);
    }, [router.isReady]);

    const playerSelectionEvent = (ownerUuid: string, playerUuid: string, selected: boolean): void => {
        let updatedSelections = selectedPlayers;
        if (!selected) {
            updatedSelections = updatedSelections.filter((selection) => selection.playerUuid !== playerUuid);
        } else {
            updatedSelections.push({
                ownerUuid: ownerUuid,
                playerUuid: playerUuid,
            });
        }
        setSelectedPlayers(updatedSelections);
    };

    const updateGame = async (uuid: string, gameUpdate: GameUpdate): Promise<void> => {
        try {
            const updatedGame = await ApiService.apiGamePartialUpdate(uuid, gameUpdate);
            if (updatedGame.status !== Game.status.OPEN) router.replace(RESULT_PAGE_PATH(uuid));
        } catch (err) {
            console.error('Error updating the game: ' + err);
        }
    };

    const submitLineups = (): void => {
        const gameUpdate = {
            status: GameUpdate.status.IN_PROGRESS,
        } as GameUpdate;

        let challenger_index = 1;
        let challenged_index = 1;
        selectedPlayers.forEach((selection) => {
            let fieldString: string;
            let index: number;
            if (selection.ownerUuid === game.challenged.uuid) {
                fieldString = 'challenged';
                index = challenged_index;
                challenged_index += 1;
            } else {
                fieldString = 'challenger';
                index = challenger_index;
                challenger_index += 1;
            }

            gameUpdate[fieldString + '_player_' + index] = selection.playerUuid;
        });

        updateGame(game.uuid, gameUpdate);
    };

    const userIdBelongsToCurrentUser = (user: User): boolean => {
        return user.email === getUser();
    };

    const buildPlayerName = (user: User): string => {
        if (!user) return 'TBD';

        let alias = user.first_name + ' ' + user.last_name;
        if (userIdBelongsToCurrentUser(user)) {
            alias = 'You';
        }
        return alias;
    };

    const buildPrice = (price: string): string => {
        if (!price) return '$0.00';
        return '$' + parseFloat(price).toFixed(2);
    };

    const renderPlayer = (player: Player): ReactElement => {
        return (
            <td key={player.uuid}>
                <div className="ml-3 text-sm">
                    <label htmlFor="players" className="font-medium text-gray-700">
                        <img src={player.image_url} width={206} height={309} alt="Player" />
                    </label>
                </div>
                <div className="flex items-center h-5 px-3 py-3">
                    <input
                        id="players"
                        aria-describedby="players-description"
                        name="players"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        onChange={(e) => playerSelectionEvent(player.owner, player.uuid, e.target.checked)}
                    />{' '}
                    &nbsp; {player.first_name} {player.last_name}
                </div>
            </td>
        );
    };

    const renderPlayers = (user: User): ReactElement => {
        if (!user || !user.player_set) return <div></div>;

        return (
            <table className="table-auto">
                <tbody>
                    <tr>{user.player_set.map((player) => renderPlayer(player))}</tr>
                </tbody>
            </table>
        );
    };

    return (
        <MainLayout>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {game && buildPlayerName(game.challenger) + ' VS ' + buildPlayerName(game.challenged)}
                    </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Challenger</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{game && buildPlayerName(game.challenger)}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Stadium</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">E Oakland</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Entry fee</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{game && buildPrice(game.entry_fee)}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Prize pool</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{game && buildPrice(game.prize_pool)}</dd>
                        </div>
                    </dl>
                </div>
            </div>
            <h1 className="ml-3 mt-3 mb-0 font-medium">CHALLENGER - {game && buildPlayerName(game.challenger)}</h1>
            <fieldset className="space-y-5">
                <legend className="sr-only">{game && buildPlayerName(game.challenger)}</legend>
                {game && renderPlayers(game.challenger)}
            </fieldset>
            <h1 className="ml-3 mt-3 mb-0 font-medium">CHALLENGED - {game && buildPlayerName(game.challenged)}</h1>
            <fieldset className="space-y-5">
                <legend className="sr-only">{game && buildPlayerName(game.challenged)}</legend>
                {game && renderPlayers(game.challenged)}
            </fieldset>
            <div className="py-5 text-center">
                <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={submitLineups}
                >
                    Submit Lineup
                </button>
            </div>
        </MainLayout>
    );
};

export default withAuth(Challenge);

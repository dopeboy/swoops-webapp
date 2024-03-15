import { ReactElement, useEffect, useState } from 'react';
import MainLayout from 'src/components/gm/common/MainLayout';
import { ApiService, Game } from 'src/lib/gm/api';
import { useRouter } from 'next/router';
import withAuth from 'src/components/gm/common/withAuth';

type Score = {
    points: number;
    team_name: string;
    team_uuid: string;
    abbreviated_team_name: string;
};

type PlayerResult = {
    name: string;
    points: number;
    assists: number;
    rebounds: number;
    team_name: string;
    team_uuid: string;
    player_uuid: string;
};

type GameResults = {
    scores: Score[];
    players_results: PlayerResult[];
};

type PlayerSummary = {
    uuid: string;
    name: string;
    imageUrl: string;
    teamName: string;

    teamExternalUuid: string;
    playerExternalUuid: string;

    points: number;
    assists: number;
    rebounds: number;
};

type TeamSummary = {
    externalUuid: string;
    name: string;
    abbreviation: string;
    isWinner: boolean;
    players: PlayerSummary[];

    points: number;
};

type GameSummary = {
    challenger: TeamSummary;
    challenged: TeamSummary;
    status: Game.status;
};

const CHALLENGE_PAGE_PATH = (uuid: string): string => `/game/${uuid}/challenge`;

const Result = (): ReactElement => {
    const router = useRouter();
    const [summary, setSummary] = useState<GameSummary>(null);

    const getWinner = (): TeamSummary => {
        return summary.challenged.isWinner ? summary.challenged : summary.challenger;
    };

    const getLoser = (): TeamSummary => {
        return summary.challenged.isWinner ? summary.challenger : summary.challenged;
    };

    const parseTeamSummary = async (playerTitle: string, game: Game): Promise<TeamSummary> => {
        const teamSummary: TeamSummary = {} as TeamSummary;
        teamSummary.externalUuid = game[playerTitle + '_team_external_uuid'];
        teamSummary.players = [];

        for (let i = 1; i < 6; ++i) {
            const playerUuid: string = game[playerTitle + '_player_' + i];
            if (playerUuid) {
                const player = await ApiService.apiPlayerRead(playerUuid);
                const playerSummary = {
                    uuid: player.uuid,
                    name: player.first_name + ' ' + player.last_name,
                    imageUrl: player.image_url,

                    teamExternalUuid: game[playerTitle + '_team_external_uuid'],
                    playerExternalUuid: game[playerTitle + '_player_' + i + '_external_uuid'],
                } as PlayerSummary;

                const gameResults: GameResults = game.results;
                // when the game is in progress the results wont yet be ready, but we should partially populate the page
                if (gameResults) {
                    const externalPlayer = gameResults.players_results.find(
                        (playerResult) => playerResult.player_uuid === playerSummary.playerExternalUuid
                    );
                    // TODO names and labels should come from the core app (golden source) not from the simulator- we dont store these yet
                    playerSummary.teamName = externalPlayer.team_name;
                    playerSummary.points = externalPlayer.points;
                    playerSummary.assists = externalPlayer.assists;
                    playerSummary.rebounds = externalPlayer.rebounds;

                    const teamScore = gameResults.scores.find((score) => score.team_uuid === playerSummary.teamExternalUuid);
                    teamSummary.name = teamScore.team_name;
                    teamSummary.points = teamScore.points;
                }
                teamSummary.players.push(playerSummary);
            }
        }
        return teamSummary;
    };

    const getSummary = async (uuid: string): Promise<void> => {
        let game: Game = null;

        try {
            game = await ApiService.apiGameRead(uuid);
            if (game.status === Game.status.OPEN) router.replace(CHALLENGE_PAGE_PATH(uuid));

            const gameSummary: GameSummary = {} as GameSummary;
            gameSummary.challenger = await parseTeamSummary('challenger', game);
            gameSummary.challenged = await parseTeamSummary('challenged', game);
            gameSummary.status = game.status;

            if (gameSummary.status === Game.status.COMPLETE) {
                gameSummary.challenger.isWinner = gameSummary.challenger.points > gameSummary.challenged.points;
                gameSummary.challenged.isWinner = gameSummary.challenger.points < gameSummary.challenged.points;
            }

            setSummary(gameSummary);
        } catch (err) {
            console.error('Error getting resources: ' + err);
        }
    };

    const renderWinner = (): ReactElement => {
        let style = 'flex items-baseline text-2xl font-semibold ';

        let text = 'TBD';
        let outcomeStyle = 'grey';
        if (summary.status === Game.status.COMPLETE) {
            text = 'WINNER: ' + getWinner().name;
            outcomeStyle = 'green';
        }
        style += `text-${outcomeStyle}-600`;
        return <div className={style}>{text}</div>;
    };
    const renderLoser = (): ReactElement => {
        let style = 'flex items-baseline text-2xl font-semibold ';

        let text = 'TBD';
        let outcomeStyle = 'grey';
        if (summary.status === Game.status.COMPLETE) {
            text = 'LOSER: ' + getLoser().name;
            outcomeStyle = 'red';
        }
        style += `text-${outcomeStyle}-600`;
        return <div className={style}>{text}</div>;
    };

    useEffect(() => {
        if (!router.isReady) return;

        const { uuid } = router.query;
        getSummary(uuid as string);
    }, [router.isReady]);

    return (
        <MainLayout>
            <div className="flex flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="overflow-hidden">
                            <table className="min-w-full">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {summary && summary.challenger.name ? summary.challenger.name : 'THE CHALLENGER'}
                                        </td>
                                        {summary &&
                                            summary.challenger.players.map((player) => (
                                                <td key={player.name} className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <img className="mx-auto h-20 w-20 rounded-full" src={player.imageUrl} alt="" />
                                                </td>
                                            ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {summary && summary.challenged.name ? summary.challenged.name : 'THE DEFENDER'}
                                        </td>
                                        {summary &&
                                            summary.challenged.players.map((player) => (
                                                <td key={player.name} className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <img className="mx-auto h-20 w-20 rounded-full" src={player.imageUrl} alt="" />
                                                </td>
                                            ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <dl className="mt-5 grid grid-cols-1 rounded-lg bg-white overflow-hidden shadow divide-y divide-gray-200 md:divide-y-0 md:divide-x">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-base font-normal text-gray-900">
                            {summary && summary.status === Game.status.COMPLETE && getWinner().points + ' pts'}
                        </dt>
                        <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">{summary && renderWinner()}</dd>
                        <div className="flex flex-col">
                            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 p-8">
                                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        Name
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        Team
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        Points
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        Rebounds
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        Assists
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary &&
                                                    getWinner().players.map((player, playerIdx) => (
                                                        <tr key={player.name} className={playerIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {player.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {summary.challenger.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.points}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.rebounds}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.assists}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </dl>
                <dl className="mt-5 grid grid-cols-1 rounded-lg bg-white overflow-hidden shadow divide-y divide-gray-200 md:divide-y-0 md:divide-x">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-base font-normal text-gray-900">
                            {summary && summary.status === Game.status.COMPLETE && getLoser().points + ' pts'}
                        </dt>
                        <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">{summary && renderLoser()}</dd>
                        <div className="flex flex-col">
                            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 p-8">
                                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        Name
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        Team
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        Points
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        Rebounds
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        Assists
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary &&
                                                    getLoser().players.map((player, playerIdx) => (
                                                        <tr key={player.name} className={playerIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {player.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getLoser().name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.points}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.rebounds}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.assists}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </dl>
            </div>
        </MainLayout>
    );
};

export default withAuth(Result);

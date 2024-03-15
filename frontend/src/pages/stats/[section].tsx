import { ReactElement, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LayoutDecider } from 'src/components/common/LayoutDecider';
import 'rc-tabs/assets/index.css';
import PageHeader from '../../components/common/PageHeader';
import { TableNavBar } from 'src/components/common/TableNavBar';
import { ApiService, PlayerLeaderboardListing, TeamLeaderboardListing } from 'src/lib/api';
import { TeamLeaderboard } from 'src/components/stats/TeamLeaderboard';
import { TableLoadingSpinner } from 'src/components/common/TableLoadingSpinner';
import PlayersTable from 'src/components/stats/PlayersTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Helmet } from 'react-helmet';

export interface TeamLeaderboardListingWithRank extends TeamLeaderboardListing {
    rank: number;
}

export interface PlayersLeaderboardWithRank extends PlayerLeaderboardListing {
    rank: number;
}

const routesToUse = [
    { title: 'Teams', path: 'teams', section: 'teams' },
    { title: 'Players', path: 'players', section: 'players' },
];

const Stats = (): ReactElement => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [unplayedPlayers, setUnplayedPlayers] = useState<boolean>(false);
    const [players, setPlayers] = useState<PlayersLeaderboardWithRank[]>([]);
    const [filteredPlayers, setFilteredPlayers] = useState<PlayersLeaderboardWithRank[]>([]);
    const [pagePlayers, setPagePlayers] = useState<number>(1);
    const [pageTeams, setPageTeams] = useState<number>(1);

    const { section } = router.query;
    const [teams, setTeams] = useState<TeamLeaderboardListingWithRank[]>([]);

    const getLeaderboardTeams = async () => {
        const teamsResults = await ApiService.apiGameTeamLeaderboardList();
        // setPageTeams(pageTeams + 1);
        const newTeams = teamsResults.map((team, index) => ({
            ...team,
            l10_wins: team?.l10_wins || 0,
            l10_losses: team?.l10_losses || 0,
            rank: index + 1,
        }));
        // const currentTeams = [...teams, ...newTeams];
        setTeams(newTeams);
    };

    const getPlayers = async (): Promise<void> => {
        try {
            const playersResults = await ApiService.apiGamePlayerLeaderboardList();
            // setPagePlayers(pagePlayers + 1);
            const newPlayers = playersResults.map((player, index) => ({ ...player, rank: index + 1 }));
            // const currentPlayers = [...players, ...newPlayers];
            setPlayers(newPlayers);
            hideUnplayedPlayers(newPlayers);
        } catch (err) {
            console.error('Error getting players: ' + err);
        }
    };

    const getInitialInfo = async (): Promise<void> => {
        await Promise.all([getPlayers(), getLeaderboardTeams()]);
        setLoading(false);
    };

    useEffect(() => {
        // setPagePlayers(1);
        // setPageTeams(1);
        // setFilteredPlayers([]);
        // setTeams([]);
        if (router.isReady) {
            getInitialInfo();
        }
    }, [router.isReady, section]);

    const hideUnplayedPlayers = (players: PlayersLeaderboardWithRank[]) => {
        if (!unplayedPlayers) {
            setFilteredPlayers([...players.filter((player) => player.wins + player.losses >= 1)]);
        } else {
            setFilteredPlayers(players);
        }
        setUnplayedPlayers(!unplayedPlayers);
    };

    return (
        <LayoutDecider>
            <Helmet>
                <title> Leaderboard | Swoops</title>
            </Helmet>
            <PageHeader title="Leaderboard" />
            <div className="h-12" />
            <div className="pl-12 pr-10">
                {section && (
                    <div className="flex justify-start">
                        <TableNavBar routesToUse={routesToUse} />
                        {section === 'players' && !loading && (
                            <div className="font-medium text-base flex items-center ml-12 mb-3">
                                <input
                                    onClick={() => hideUnplayedPlayers(players)}
                                    id="link-checkbox"
                                    type="checkbox"
                                    checked={unplayedPlayers}
                                    value=""
                                    className="w-4 h-4 text-green-600 rounded border-gray-100 border-2 focus:border-gray-100 focus:ring-0 bg-transparent"
                                />
                                <label htmlFor="link-checkbox" className="ml-2 text-white">
                                    Hide Unplayed
                                </label>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="dark">
                {section === 'players' && !loading && (
                    // <InfiniteScroll dataLength={filteredPlayers.length} next={getPlayers} hasMore={true} loader={<h4></h4>}>
                    <PlayersTable availablePlayers={filteredPlayers} />
                    // </InfiniteScroll>
                )}
                {section === 'teams' && !loading && (
                    // <InfiniteScroll dataLength={teams.length} next={getLeaderboardTeams} hasMore={true} loader={<h4></h4>}>
                    <TeamLeaderboard teams={teams} />
                    // </InfiniteScroll>
                )}
                <TableLoadingSpinner loading={loading} />
            </div>
        </LayoutDecider>
    );
};

export default Stats;

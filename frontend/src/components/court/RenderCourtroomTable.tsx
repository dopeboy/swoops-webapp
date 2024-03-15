import { ReactElement } from 'react';
import OpenGamesTable from './OpenGamesTable';
import Live from './Live';
import { GameListing } from 'src/lib/api';
import { MatchMakePopover } from './MatchMakePopover';

import { fakeTournamentResultsDataLarge, fakeTournamentResultsDataSmall } from '../../lib/testData/Games';
import { GamesTable } from '../lockerRoom/GamesTable';
import MobileOpenGamesTable from './MobileOpenGamesTable';
import MobileGamesTable from '../lockerRoom/MobileGamesTable';
import { useRouter } from 'next/router';
export interface LoadingEnabledGame extends GameListing {
    loading: boolean;
}
interface RenderCourtroomTableProps {
    games: LoadingEnabledGame[];
    setLoading: (id: number, loading: boolean) => void;
    section: string;
    loadingGames: boolean;
    userOwnedPlayerAmount: number;
    matchmake?: any;
    currentTeamId: number;
    reloadGames: () => void;
}
export const RenderCourtroomTable: React.FC<RenderCourtroomTableProps> = ({
    games,
    setLoading,
    section,
    loadingGames,
    currentTeamId,
    userOwnedPlayerAmount,
    reloadGames,
    matchmake,
}): ReactElement => {
    const router = useRouter();
    if (section === 'open') {
        return (
            <>
                {matchmake && (
                    <div className="sm:px-12 flex flex-col items-center justify-center bg-black pt-3 px-3 border-b border-gray/64 sm:border-none">
                        <div className="sm:px-12 pb-4 w-full flex flex-col items-center justify-center sm:border-white/16 sm:border-b">
                            <div className="flex flex-row">
                                <div>
                                    <button
                                        data-tut="matchmaking"
                                        className="py-4 px-3 rounded-lg bg-assist-green w-60 sm:w-full sm:max-w-xs subheading-one"
                                        onClick={() => router.push('/h2h-matchmake/roster')}
                                    >
                                        Matchmake me
                                    </button>
                                </div>
                                <div className="py-3 px-2">
                                    <MatchMakePopover />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <MobileOpenGamesTable
                    userOwnedPlayerAmount={userOwnedPlayerAmount}
                    setLoading={(id, loading) => setLoading(id, loading)}
                    loadingGames={loadingGames}
                    reloadGames={reloadGames}
                    games={games.filter((game: GameListing) => game.status === GameListing.status.OPEN)}
                />
                <OpenGamesTable
                    userOwnedPlayerAmount={userOwnedPlayerAmount}
                    setLoading={(id, loading) => setLoading(id, loading)}
                    loadingGames={loadingGames}
                    reloadGames={reloadGames}
                    games={games.filter((game: GameListing) => game.status === GameListing.status.OPEN)}
                />
            </>
        );
    } else if (section === 'live') {
        return <Live tournamentsSmall={fakeTournamentResultsDataSmall} tournamentsLarge={fakeTournamentResultsDataLarge} />;
    } else if (section === 'completed') {
        return (
            <>
                <GamesTable
                    loadingGames={loadingGames}
                    currentTeamId={currentTeamId}
                    reloadGames={reloadGames}
                    games={games.filter((game: GameListing) => game.status === GameListing.status.COMPLETE)}
                />
                <MobileGamesTable
                    loadingGames={loadingGames}
                    reloadGames={reloadGames}
                    currentTeamId={currentTeamId}
                    games={games.filter((game: GameListing) => game.status === GameListing.status.COMPLETE)}
                />
            </>
        );
    } else if (section === 'pending') {
        return (
            <GamesTable
                loadingGames={loadingGames}
                currentTeamId={currentTeamId}
                games={games.filter((game: GameListing) => game.status === GameListing.status.IN_PROGRESS)}
            />
        );
    }
    return <div />;
};

export default RenderCourtroomTable;

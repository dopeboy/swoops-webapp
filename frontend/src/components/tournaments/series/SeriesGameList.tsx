import { Result, TournamentSeriesDetail } from 'src/lib/api';

interface SeriesGameListProps {
    serie?: TournamentSeriesDetail;
    setSerie: (serie: TournamentSeriesDetail) => void;
    className?: string;
}
export const SeriesGameList: React.FC<SeriesGameListProps> = ({ serie, setSerie }) => {
    const revealGame = (selectedGame, index: number) => {
        let newGames: Result[];
        if (!selectedGame) {
            newGames = [...serie.games].map((game, i) => (i === index ? { ...game, revealed: true } : game));
        } else {
            newGames = [...serie.games].map((game: any) => (game?.id === selectedGame?.id ? { ...game, revealed: true } : game));
        }

        setSerie({ ...serie, games: [...newGames] });
    };

    const allGamesRevealed = () => {
        return (
            serie?.games.filter((game) => game && game?.lineup_1_box_score && game?.lineup_2_box_score)?.length ===
            serie?.games?.filter((game: any) => game && game?.lineup_1_box_score && game?.lineup_2_box_score && game?.revealed)?.length
        );
    };

    return (
        <>
            {serie?.games && serie?.games?.filter((game) => game && game?.lineup_1_box_score && game?.lineup_2_box_score)?.length > 0 ? (
                <div className="flex flex-col items-center justify-center w-full max-w-2xl divide-y divide-white/16 px-4 pt-2 pb-4 rounded-lg border border-white/16">
                    {serie?.games?.map((game: any, index) => {
                        return (
                            <div key={index} className="items-center gap-3 justify-between w-full">
                                {game?.revealed || allGamesRevealed() || (game?.lineup_1_score === null && game?.lineup_2_score === null) ? (
                                    <div className="grid grid-cols-3 items-center justify-items-center gap-3 w-full py-2">
                                        {/* Team One Score */}
                                        <div
                                            className={`${
                                                game?.lineup_1_score > game?.lineup_2_score ? 'text-assist-green' : 'text-white'
                                            } heading-three sm:heading-two pl-8`}
                                        >
                                            {game?.lineup_1_score || '-'}
                                        </div>
                                        {/* Game number */}
                                        <div
                                            className="text-white heading-three sm:heading-two"
                                            onClick={() => {
                                                window.open(`/headtohead/${game?.id}/joined/matchup`, '_blank');
                                            }}
                                        >
                                            Game {index + 1}
                                        </div>
                                        {/* Team Two Score */}
                                        <div
                                            className={`${
                                                game?.lineup_2_score > game?.lineup_1_score ? 'text-assist-green' : 'text-white'
                                            } heading-three sm:heading-two pr-8`}
                                        >
                                            {game?.lineup_2_score || '-'}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 items-center justify-items-center gap-3 w-full py-2">
                                        <div className="text-white heading-three sm:heading-two pl-8">
                                            <button
                                                onClick={() => {
                                                    window.open(`/headtohead/${game?.id}/joined/matchup`, '_blank');
                                                }}
                                                className={'bg-assist-green px-3 py-2 subheading-three rounded-lg text-black'}
                                            >
                                                Watch
                                            </button>
                                        </div>
                                        <div
                                            className="text-white heading-three sm:heading-two"
                                            onClick={() => {
                                                window.open(`/headtohead/${game?.id}/joined/matchup`, '_blank');
                                            }}
                                        >
                                            Game {index + 1}
                                        </div>
                                        <div className="text-white heading-three sm:heading-two pr-8">
                                            <button
                                                onClick={() => revealGame(game, index)}
                                                className={'py-2 px-3 subheading-three text-white bg-off-black rounded-lg'}
                                            >
                                                Reveal
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {/* Dummy for getting the last item to have a border */}
                    <div className="w-full h-1"></div>
                </div>
            ) : (
                <div className="max-w-xl p-6 md:p-8 w-full pl-12 rounded-lg flex flex-row items-center justify-between border border-white/16">
                    <img className="hidden sm:inline-block w-40" src="/images/StackedCard.png" />
                    <h1 className="subheading-one sm:heading-two text-white text-center sm:w-96 w-84">SERIES NOT STARTED YET</h1>
                </div>
            )}
        </>
    );
};

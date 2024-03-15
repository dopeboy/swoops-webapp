import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { getTeamLogoFinalResolutionPath } from 'src/lib/utils';
import { TournamentEntryTeam, TournamentSeries, TournamentSeriesGameSummary } from 'src/lib/api';
import { TournamentBracketSectionCardTeam } from './TournamentBracketSectionCardTeam';
import { useRouter } from 'next/router';
import { trackEvent } from 'src/lib/tracking';
const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL || '/';

interface TournamentBracketSectionCardProps {
    teams: TournamentEntryTeam[];
    roundId: number;
    seriesId: number;
    className?: string;
    id: string | string[];
    games: TournamentSeriesGameSummary[];
    status: TournamentSeries.status;
    revealSerie?: (id: number) => void;
    revealed?: boolean;
    isFirstRound?: boolean;
    isParentRevealed?: boolean;
}
export const TournamentBracketSectionCard: React.FC<TournamentBracketSectionCardProps> = ({
    id,
    roundId,
    seriesId,
    teams,
    className,
    games,
    status,
    revealSerie,
    revealed = false,
    isFirstRound,
    isParentRevealed = false,
}) => {
    const router = useRouter();
    const [winner, setWinner] = useState<number>();

    useEffect(() => {
        if (games?.length > 0) {
            setWinner(getOverallWinner(games));
        }
    }, [games]);

    const getOverallWinner = (games) => {
        let team_1_wins = 0;
        let team_2_wins = 0;

        for (const game of games) {
            if (game.team_1_score > game.team_2_score) {
                team_1_wins++;
            } else if (game.team_1_score < game.team_2_score) {
                team_2_wins++;
            }
        }

        if (team_1_wins > team_2_wins) {
            return 0;
        } else if (team_1_wins < team_2_wins) {
            return 1;
        } else {
            return 2;
        }
    };

    return (
        <div
            onClick={() => {
                if (isFirstRound || (revealed && teams.length !== 0 && teams[0]?.name && teams[1]?.name)) {
                    window.open(`/tournament/${id}/round/${roundId}/series/${seriesId}/player-stats`);
                }
            }}
            className={classNames('cursor-pointer flex flex-col w-full rounded-lg divide-y divide-off-black/16', className || 'h-fit')}
        >
            {(revealed && teams.length !== 0) || isFirstRound || (!teams[0]?.name && !teams[1]?.name) ? (
                <div className="bg-white rounded-lg">
                    {teams?.map((team: TournamentEntryTeam, index) => (
                        <TournamentBracketSectionCardTeam
                            key={team?.id}
                            isWinner={index === winner}
                            isFirstRound={isFirstRound}
                            isParentRevealed={isParentRevealed}
                            className="pl-5 pt-2 pr-4 pb-2"
                            position={team?.seed}
                            logo={team?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(team.path)}` : null}
                            name={team?.name}
                            wins={team?.wins}
                            losses={team?.losses}
                            status={status}
                        />
                    ))}
                </div>
            ) : teams.length !== 0 && !revealed && !isFirstRound ? (
                <div className="bg-[#EBECED] px-8 py-8 text-center flex flex-row items-center justify-center gap-2 rounded-lg">
                    <button
                        onClick={() => {
                            trackEvent('Tournament page - Clicked watch button');
                            window.open(`/tournament/${id}/round/${roundId}/series/${seriesId}/player-stats`, '_blank');
                        }}
                        className="bg-assist-green px-3 py-2 subheading-three rounded-lg text-black"
                    >
                        Watch
                    </button>
                    <button
                        onClick={() => {
                            trackEvent('Tournament page - Clicked reveal button');
                            revealSerie(seriesId);
                        }}
                        className="py-2 px-3 subheading-three text-white bg-off-black rounded-lg"
                    >
                        Reveal
                    </button>
                </div>
            ) : (
                <div className="px-4 py-4 flex gap-2 flex-col bg-[#EBECED] rounded-lg">
                    <div className={classNames('flex flex-row items-center justify-start w-full gap-2 md:gap-3 h-full')}>
                        <div className="flex flex-row items-center justify-start w-full gap-2">
                            <div className="flex flex-col items-start justify-center h-full w-full">
                                <h3 className="font-bold text-lg capitalize text-off-black ">TBD</h3>
                            </div>
                        </div>
                    </div>
                    <div
                        className={classNames(
                            'flex flex-row items-center justify-start w-full border-t-1 border-black-off gap-2 md:gap-3 h-full pt-2'
                        )}
                    >
                        <div className="flex flex-row items-center justify-start w-full gap-2">
                            <div className="flex flex-col items-start justify-center h-full w-full">
                                <h3 className="font-bold text-lg capitalize text-off-black ">TBD</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

import classNames from 'classnames';
import { getBestOf, getTeamLogoFinalResolutionPath } from 'src/lib/utils';
import { TournamentDetail, TournamentEntryTeam } from 'src/lib/api';
import { TournamentGameSectionCardTeam } from './TournamentGameSectionCardTeam';
import { useEffect, useState } from 'react';
const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL || '/';

interface TournamentGameSectionCardProps {
    teams: TournamentEntryTeam[];
    tournament: TournamentDetail;
    className?: string;
    roundId: number;
    division?: string;
    seriesId: number;
    id: string | string[];
}
export const TournamentGameSectionCard: React.FC<TournamentGameSectionCardProps> = ({
    division,
    tournament,
    id,
    roundId,
    seriesId,
    teams,
    className,
}) => {
    const [bestOf, setBestOf] = useState<string>('');

    useEffect(() => {
        setBestOf(getBestOf(tournament, roundId));
    }, [tournament]);

    return (
        <div
            onClick={() => {
                if (teams?.[0]?.name && teams?.[1]?.name) {
                    window.open(`/tournament/${id}/round/${roundId}/series/${seriesId}/player-stats`);
                }
            }}
            className={classNames(
                'h-[220px] cursor-pointer flex flex-col w-full bg-white rounded-lg divide-y divide-off-black/16',
                className || 'h-fit'
            )}
        >
            {/* Card header */}
            <div className="flex flex-col items-start justify-start w-full px-3 py-2">
                {/* Title */}
                <h1 className="heading-three text-black">{bestOf}</h1>
                {/* Division */}
                <h2 className="subheading-one text-off-black/50">{division}</h2>
            </div>
            <div className="flex flex-row items-center justify-between h-full">
                <TournamentGameSectionCardTeam
                    className="px-4 py-3"
                    position={teams?.[0]?.seed}
                    logo={teams?.[0]?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(teams?.[0]?.path)}` : null}
                    name={teams?.[0]?.name}
                    placing="left"
                />
                <div className="flex flex-col items-center justify-center h-full mt-6 gap-5">
                    <span className="subheading-one text-off-black">VS</span>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-base text-off-black whitespace-nowrap">{bestOf}</span>
                    </div>
                </div>
                <TournamentGameSectionCardTeam
                    className="px-4 py-3"
                    position={teams?.[1]?.seed}
                    logo={teams?.[1]?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(teams?.[1]?.path)}` : null}
                    name={teams?.[1]?.name}
                    placing="right"
                />
            </div>
        </div>
    );
};

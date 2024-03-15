import { ReactElement, useState, useEffect } from 'react';
import 'rc-tabs/assets/index.css';
import classNames from 'classnames';
import { CurrentLineup } from '../../gamelobby/CurrentLineup';
import { MobileCurrentLineup } from 'src/components/gamelobby/MobileCurrentLineup';
import { EmptyRosterPlayer, getUserTeam, getTeamLogoFinalResolutionPath } from 'src/lib/utils';
import { Lineup, TournamentEntry, TournamentLineup, Team } from 'src/lib/api';
import { TrophyIcon } from '@heroicons/react/24/solid';

interface LineupAllSelectedProps {
    shouldDisplay: boolean;
    currentLineup: Lineup;
    tournamentEntries: TournamentEntry[];
}

const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL || '/';

export const LineupAllSelected: React.FC<LineupAllSelectedProps> = ({ shouldDisplay, currentLineup, tournamentEntries }): ReactElement => {
    const [cleanedLineup, setCleanedLineup] = useState({});
    const [userTeam, setUserTeam] = useState<Team>();

    useEffect(() => {
        if (currentLineup && Object.keys(currentLineup).length !== 0) {
            const { id, team, ...lineupPlayers } = currentLineup;
            setCleanedLineup(lineupPlayers);
            setTeam();
        }
    }, [currentLineup]);

    const cleanLineup = (lineup: TournamentLineup) => {
        const { id, ...lineupPlayers } = lineup;
        return lineupPlayers;
    };

    const setTeam = async () => {
        const currentUserTeam = await getUserTeam();
        setUserTeam(currentUserTeam);
    };

    return (
        <div
            className={classNames('bg-[#4e4e4e]', {
                hidden: !shouldDisplay,
            })}
        >
            <div className="flex flex-row items-center justify-start heading-two text-white w-full pt-6 pl-24">All Lineups</div>

            {Object.keys(cleanedLineup).length !== 0 && (
                <>
                    <div className="flex flex-col w-full sm:px-24 items-center pt-6">
                        <div className="w-full flex flex-row items-center justify-between px-2 pt-2.5 pb-2.5 rounded-t-lg text-black bg-white subheading-three md:subheading-two">
                            <div className="flex flex-row items-center justify-start gap-2 max-w-[50%]">
                                {(userTeam?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(userTeam.path)}` : null) ? (
                                    <img
                                        src={`${imageBaseUrl}${getTeamLogoFinalResolutionPath(userTeam?.path)}`}
                                        className="aspect-square h-8 w-8 rounded-full"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center aspect-square h-8 w-8 rounded-full">
                                        <TrophyIcon className={classNames('w-5 h-5', '#4E4E4E')} />
                                    </div>
                                )}
                                <span>{userTeam?.name}</span>
                            </div>
                        </div>
                        <CurrentLineup
                            tokensRequired={5}
                            showOnlyLineup={true}
                            selectedPlayers={Object.keys(cleanedLineup).map((key) => {
                                if (!cleanedLineup[key]?.id) return EmptyRosterPlayer;
                                return { ...cleanedLineup[key] };
                            })}
                        />
                        <MobileCurrentLineup
                            tokensRequired={5}
                            showOnlyLineup={true}
                            selectedPlayers={Object.keys(cleanedLineup).map((key) => {
                                if (!cleanedLineup[key]?.id) return EmptyRosterPlayer;
                                return { ...cleanedLineup[key] };
                            })}
                        />
                    </div>
                </>
            )}
            {tournamentEntries?.map((entry) => {
                if (entry?.team?.id !== userTeam?.id) {
                    return (
                        <>
                            <div className="flex flex-col w-full sm:px-24 items-center pt-6">
                                <div className="w-full flex flex-row items-center justify-between px-2 pt-2.5 pb-2.5 rounded-t-lg text-black bg-white subheading-three md:subheading-two">
                                    <div className="flex flex-row items-center justify-start gap-2 max-w-[50%]">
                                        {(entry?.team?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(entry?.team?.path)}` : null) ? (
                                            <img
                                                src={`${imageBaseUrl}${getTeamLogoFinalResolutionPath(entry?.team?.path)}`}
                                                className="aspect-square h-8 w-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center aspect-square h-8 w-8 rounded-full">
                                                <TrophyIcon className={classNames('w-5 h-5', '#4E4E4E')} />
                                            </div>
                                        )}
                                        <span>{entry?.team?.name}</span>
                                    </div>
                                </div>
                                <CurrentLineup
                                    tokensRequired={5}
                                    showRoster={false}
                                    showOnlyLineup={true}
                                    selectedPlayers={Object.keys(cleanLineup(entry?.lineup)).map((key) => {
                                        if (!cleanLineup(entry?.lineup)[key]?.id) return EmptyRosterPlayer;
                                        return { ...cleanLineup(entry?.lineup)[key] };
                                    })}
                                />
                                <MobileCurrentLineup
                                    tokensRequired={5}
                                    showRoster={false}
                                    showOnlyLineup={true}
                                    selectedPlayers={Object.keys(cleanLineup(entry?.lineup)).map((key) => {
                                        if (!cleanLineup(entry?.lineup)[key]?.id) return EmptyRosterPlayer;
                                        return { ...cleanLineup(entry?.lineup)[key] };
                                    })}
                                />
                            </div>
                        </>
                    );
                } else {
                    return null;
                }
            })}
        </div>
    );
};

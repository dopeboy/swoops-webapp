import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { TournamentEntryTeam } from 'src/lib/api';
import { getTeamLogoFinalResolutionPath } from 'src/lib/utils';
import { TournamentGameSectionCardTeam } from './TournamentGameSectionCardTeam';
const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL;

interface TournamentGameSectionCurrentSeriesCardProps {
    teams: TournamentEntryTeam[];
    title?: string;
    className?: string;
}
export const TournamentGameSectionCurrentSeriesCard: React.FC<TournamentGameSectionCurrentSeriesCardProps> = ({ teams, className }) => {
    const teamsExist = (): boolean => {
        return teams?.length > 0 && !!teams?.[0] && !!teams?.[1];
    };

    return (
        <div
            className={classNames('bg-gray-50 rounded-lg flex flex-col items-center w-full pt-4 pb-8 px-2 lg:px-4 gap-2 min-h-[343px]', className, {
                'justify-center': teamsExist(),
                'justify-start': !teamsExist(),
            })}
        >
            <h1 className="text-black heading-two text-center">Current Series</h1>
            <h2 className="text-off-black/80 heading-three leading-3 text-center">{teamsExist() ? 'Started 12:00PM EST' : 'None Yet'}</h2>
            {/* Current Section Card */}
            {teamsExist() && (
                <div className="bg-white mt-4 rounded-lg flex flex-col items-center justify-start w-fit divide-y divide-off-black/16 shadow-surround shadow-assist-green/100">
                    {/* Title Section */}
                    <div className="flex flex-col items-start justify-start w-full px-4 py-3">
                        {/* Title */}
                        <h1 className="heading-three text-black">Best 2 of 3</h1>
                        {/* Division */}
                        <h2 className="subheading-one text-off-black/50">Northwest</h2>
                    </div>
                    {/* Game Section */}
                    {teams?.length > 0 && (
                        <div className="flex flex-row items-center justify-between w-full h-full">
                            <TournamentGameSectionCardTeam
                                className="px-1 lg:px-4 py-3"
                                position={teams[0]?.seed}
                                logoClass="w-14 h-14 lg:w-24 lg:h-24"
                                logo={teams[0]?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(teams[0].path)}` : null}
                                name={teams[0]?.name}
                                placing="left"
                            />
                            <div className="flex flex-col items-center justify-center h-full mt-6 gap-5">
                                <span className="rounded-full px-2 py-1 bg-assist-green subheading-two text-black">Live</span>
                                <div className="flex flex-col items-center justify-center">
                                    <ArrowTopRightOnSquareIcon className="h-4 w-4 text-black" />
                                    <span className="text-base text-off-black whitespace-nowrap font-bold">Box Score</span>
                                </div>
                            </div>
                            <TournamentGameSectionCardTeam
                                className="px-2 lg:px-4 py-3"
                                logoClass="w-14 h-14 lg:w-24 lg:h-24"
                                position={teams[1]?.seed}
                                logo={teams[1]?.path ? `${imageBaseUrl}${getTeamLogoFinalResolutionPath(teams[1].path)}` : null}
                                name={teams[1]?.name}
                                placing="right"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

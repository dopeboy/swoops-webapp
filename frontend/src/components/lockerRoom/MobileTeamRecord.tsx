import { ReactElement, useState, useEffect } from 'react';
import { RenameTeamModal } from './RenameTeamModal';
import { AddLogoModal } from './AddLogoModal';
import { ApiService, TeamLogoChangeRequest, TeamNameChangeRequest } from 'src/lib/api';
import { getUserDetail, isUserLoggedIn, isTeamNamed } from 'src/lib/utils';

const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL;

const MobileTeamRecord = ({ team }): ReactElement => {
    const [renameTeamModalOpen, setRenameTeamModalOpen] = useState<boolean>(false);
    const [addLogoModalOpen, setAddLogoModalOpen] = useState<boolean>(false);

    const [nameModerationStatus, setNameModerationStatus] = useState<TeamNameChangeRequest.status>();
    const [logoModerationStatus, setLogoModerationStatus] = useState<TeamLogoChangeRequest.status>();
    const [nameModerationName, setNameModerationName] = useState<string>('');
    const [, setLogoModerationPath] = useState<string>('');

    useEffect(() => {
        if (!team.name) {
            getTeamNameModerationStatus();
        }
        if (!team.path) {
            getTeamLogoModerationStatus();
        }
    }, []);

    const getTeamNameModerationStatus = async (requestCancelled = false): Promise<void> => {
        try {
            const nameModeration = await ApiService.apiModerationTeamNameRead(team.id);
            if (!requestCancelled) {
                setNameModerationName(nameModeration.name);
            } else {
                setNameModerationName('');
            }
            setNameModerationStatus(nameModeration.status);
        } catch (error) {
            console.error(error);
        }
    };

    const getTeamLogoModerationStatus = async (requestCancelled = false): Promise<void> => {
        try {
            const logoModeration = await ApiService.apiModerationTeamLogoRead(team.id);
            if (!requestCancelled) {
                setLogoModerationPath(`${imageBaseUrl}${getFinalResolutionPath(logoModeration.path)}`);
            } else {
                setLogoModerationPath('');
            }
            setLogoModerationStatus(logoModeration.status);
        } catch (error) {
            console.error(error);
        }
    };

    const getNameModerationCopy = (): string => {
        if (nameModerationStatus) {
            if (nameModerationStatus !== 'CANCELED' && nameModerationStatus !== 'REJECTED') {
                return 'See Request';
            } else {
                return 'Add Name';
            }
        } else {
            return 'Add Name';
        }
    };

    const getLogoModerationCopy = (): string => {
        if (logoModerationStatus) {
            if (logoModerationStatus !== 'CANCELED' && logoModerationStatus !== 'REJECTED') {
                return 'See Request';
            } else {
                return 'Add Logo';
            }
        } else {
            return 'Add Logo';
        }
    };

    const getFinalResolutionPath = (path: string): string => {
        const separatedPath = path?.split('.');
        return `${separatedPath[0]}_200x200.${separatedPath[1]}`;
    };

    const userIsOwner = (): boolean => {
        return isUserLoggedIn() && getUserDetail()?.team?.id && getUserDetail().team.id === team.id;
    };

    return (
        <>
            <div className="md:hidden flex flex-col gap-3 h-full min-h-[128px] align-items pt-4 pb-6">
                <div data-tut="submit-team-details" className="flex flex-col gap-3">
                    <div className="roster-card p-4 gap-3 w-full flex flex-col items-start">
                        <h4 className="dark:text-white/64 subheading-one">Team Name</h4>
                        <div className="flex flex-row relative">
                            {!isTeamNamed(team.name) && userIsOwner() && (
                                <button
                                    className="btn-rounded-white py-2"
                                    onClick={() => {
                                        setRenameTeamModalOpen(true);
                                    }}
                                >
                                    {getNameModerationCopy()}
                                </button>
                            )}
                            {!isTeamNamed(team.name) && !userIsOwner() && (
                                <span className="text-white whitespace-nowrap heading-three">{team.name}</span>
                            )}
                            {isTeamNamed(team.name) && <span className="text-white heading-three whitespace-nowrap -mt-2">{team.name}</span>}
                        </div>
                    </div>
                    <div className="roster-card p-4 gap-3 w-full flex flex-col items-start">
                        <h4 className="dark:text-white/64 subheading-one">Team Logo</h4>
                        <div className="flex flex-row relative">
                            {!team.path && userIsOwner() && (
                                <button
                                    className="btn-rounded-white py-2"
                                    onClick={() => {
                                        setAddLogoModalOpen(true);
                                    }}
                                >
                                    {getLogoModerationCopy()}
                                </button>
                            )}
                            {team.path && <img className="z-1 w-20" src={`${imageBaseUrl}${getFinalResolutionPath(team.path)}`} />}
                            {!team.path && !userIsOwner() && <span className="text-white heading-two -mt-2">Unset</span>}
                        </div>
                    </div>
                </div>
                <div className="roster-card p-4 gap-3 w-full flex flex-col items-start" data-tut="current-season-record">
                    <h1 className="dark:text-white/64 subheading-one">Record</h1>
                    {team?.id && (
                        <span className="text-white heading-two sm:heading-one -mt-2">
                            {team?.wins} - {team?.losses}
                        </span>
                    )}
                </div>
                {/* we'll add back post-MVP */}
                {/* <div className="roster-card w-1/2 h-32 ml-8">
                    <h4 className="dark:text-white/64 pt-6 pl-6 heading-four">Trophies</h4>
                    <div className="flex flex-row relative pt-2">
                        <img className="pl-[20px] z-10 absolute" src="/images/Trophy.svg" />
                        <img className="pl-[44px] z-20 absolute" src="/images/Trophy.svg" />
                        <img className=" pl-[70px] z-30 absolute" src="/images/Trophy.svg" />
                        <img className=" pl-[96px] z-40 absolute" src="/images/MoreTrophies.svg" />
                    </div>
                </div> */}
            </div>
            <RenameTeamModal
                open={renameTeamModalOpen}
                setOpen={(open, refresh, requestCancelled) => {
                    setRenameTeamModalOpen(open);
                    if (refresh) {
                        getTeamNameModerationStatus(requestCancelled);
                    }
                }}
                team={team}
                namingStatus={nameModerationStatus}
                newTeamName={nameModerationName}
            />
            <AddLogoModal
                open={addLogoModalOpen}
                setOpen={(open, refresh, requestCancelled) => {
                    setAddLogoModalOpen(open);
                    if (refresh) {
                        getTeamLogoModerationStatus(requestCancelled);
                    }
                }}
                logoStatus={logoModerationStatus}
                team={team}
            />
        </>
    );
};

export default MobileTeamRecord;

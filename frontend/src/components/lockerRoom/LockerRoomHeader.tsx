import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { ApiService, PlayerNameChangeRequest } from 'src/lib/api';
import { trackEvent } from 'src/lib/tracking';
import { getUserDetail, isUserLoggedIn, setUserDetail } from 'src/lib/utils';
import { EmbeddedNavbarRoute } from '../common/EmbeddedNavBar';
import { ShareImage } from '../common/ShareImage';
import { TableNavBar } from '../common/TableNavBar';
import { RenamePlayerModal } from './RenamePlayerModal';
import { RenderRenameButton } from './RenderRenameButton';
import { AccountsService } from '../../lib/api/services/AccountsService';
import classNames from 'classnames';

const mainRoutes: (teamId?: number) => EmbeddedNavbarRoute[] = (teamId?: number) => [
    {
        path: `/locker-room/${teamId}/roster`,
        title: 'Roster',
        section: 'roster',
    },
    {
        path: `/locker-room/${teamId}/games`,
        title: 'Head-to-head',
        section: 'games',
    },
    {
        path: `/locker-room/${teamId}/tourney`,
        title: 'Tourney',
        section: 'tourney',
    },
];

const getPlayerPageRoutes = (uuid) => {
    return [
        {
            path: `/player-detail/${uuid}/current`,
            title: 'Current',
            section: 'current',
        },
        {
            path: `/player-detail/${uuid}/all-time`,
            title: 'All Time',
            section: 'all-time',
        },
    ];
};

interface LockerRoomHeaderProps {
    playerId?: string;
    playerRename?: string;
    isUserTeam?: boolean;
    teamId?: number;
    title?: string;
    subtitle?: string;
    children?: JSX.Element;
    userLoggedIn?: boolean;
    loadingRequest?: boolean;
    areGamesToReveal?: boolean;
    reloadGames?: () => void;
}

const LockerRoomHeader: React.FC<LockerRoomHeaderProps> = ({
    title,
    children,
    playerId,
    teamId,
    playerRename,
    loadingRequest,
    areGamesToReveal,
    reloadGames,
}): ReactElement => {
    const isPlayerProfileRoute = !!playerId;
    const isFreeAgent = !teamId;
    const router = useRouter();
    const { section } = router.query;
    const routesToUse = isPlayerProfileRoute ? getPlayerPageRoutes(playerId) : mainRoutes(teamId);
    const hostname = typeof window !== 'undefined' ? window.origin : 'https://app.playswoops.com';
    const [renamePlayerModalOpen, setRenamePlayerModalOpen] = useState(false);
    const [namingStatus, setNamingStatus] = useState<PlayerNameChangeRequest.status>();
    const [userRequestedNewName, setUserRequestedNewName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [autoReveal, setAutoreveal] = useState<boolean>(true);

    const getPlayerRenameStatus = async (): Promise<void> => {
        try {
            if (playerId !== undefined && playerId.length > 0) {
                if (playerRename?.length > 0) {
                    setNamingStatus(PlayerNameChangeRequest.status.ACCEPTED);
                    // Setting the title here since we're passing in the full name to the title prop
                    setUserRequestedNewName(title);
                } else {
                    const statusResult = await ApiService.apiGamePlayerTokenNameList(playerId);
                    setNamingStatus(statusResult.status);
                    setUserRequestedNewName(statusResult.name);
                }
            }
            setLoading(false);
        } catch (e) {
            if (e.status === 400 && e.body?.name?.length && e.body.name[0].includes('Player name change request has not been submitted.')) {
                setNamingStatus(PlayerNameChangeRequest.status.CANCELED);
                setUserRequestedNewName('');
            }
            setLoading(false);
            console.error(e);
        }
    };

    const userIsOwner = (): boolean => {
        return isUserLoggedIn() && getUserDetail()?.team?.id && getUserDetail()?.team?.id === teamId;
    };

    const shouldShowRenameButton = (): boolean => userIsOwner() && playerId && playerId?.length > 0 && !!teamId;

    useEffect(() => {
        if (router.isReady && !renamePlayerModalOpen && userIsOwner()) {
            getPlayerRenameStatus();
        } else if (router.isReady && !userIsOwner()) {
            setLoading(false);
        }
    }, [renamePlayerModalOpen, router.isReady]);

    useEffect(() => {
        if (getUserDetail()?.id) {
            setAutoreveal(getUserDetail()?.reveal_games_by_default);
        }
    }, [getUserDetail()?.id]);

    const setDefaultReveal = async (e) => {
        setAutoreveal(e.target.checked);
        const user = getUserDetail();
        user.reveal_games_by_default = e.target.checked;
        setUserDetail(user);
        await AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), { reveal_games_by_default: e.target.checked });
        reloadGames();
    };

    const revealAllGames = async () => {
        if (areGamesToReveal) {
            reloadGames();
            await AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), { reveal_games_by_default: true });
            await AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), { reveal_games_by_default: false });
        }
    };

    return (
        <div className="dark">
            <div className="dark:bg-off-black px-3 md:px-12 md:pt-8">
                <div className="flex flex-col sm:flex-row justify-between">
                    <div className="flex flex-row items-center justify-start gap-6">
                        <div className="flex flex-col">
                            <span className="dark:text-white heading-three sm:heading-two md:heading-one">{title}</span>
                        </div>
                    </div>
                    <div className="flex flex-row justify-start mt-3 sm:mt-0 sm:justify-center items-center gap-2">
                        {!isPlayerProfileRoute && userIsOwner() && (
                            <a
                                href="https://opensea.io/collection/swoops"
                                target="_blank"
                                className="hidden md:block btn-rounded-white btn-text-one"
                                onClick={() => trackEvent('Add players button clicked')}
                            >
                                Add players
                            </a>
                        )}
                        {isPlayerProfileRoute && !loading && (
                            <div className="flex flex-row items-center justify-end">
                                {shouldShowRenameButton() && (
                                    <RenderRenameButton namingStatus={namingStatus} onClick={() => setRenamePlayerModalOpen(true)} />
                                )}
                                <ShareImage url={`${hostname}/player-detail/${playerId}`} />
                                {!isFreeAgent && (
                                    <a
                                        href={`https://opensea.io/assets/ethereum/0xc211506d58861857c3158af449e832cc5e1e7e7b/${playerId}`}
                                        target="_blank"
                                        className="btn-rounded-white px-12 py-6 subheading-two"
                                    >
                                        Opensea
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {!loadingRequest ? children : <></>}
                <div className="flex justify-between mt-2">
                    <TableNavBar routesToUse={routesToUse} />
                    {section === 'games' && isUserLoggedIn() && userIsOwner() && !loadingRequest && (
                        <div className="flex flex-row items-center justify-end gap-1 sm:gap-4 pb-2">
                            <div className="flex flex-col w-[65px] sm:w-fit sm:flex-row items-center justify-end gap-1 sm:gap-2.5">
                                <label
                                    htmlFor="check"
                                    className={classNames(
                                        'relative border transition-all duration-200 border-white cursor-pointer h-4 w-8 rounded-full',
                                        {
                                            'bg-assist-green': autoReveal,
                                            'bg-black': !autoReveal,
                                        }
                                    )}
                                >
                                    <input type="checkbox" onClick={setDefaultReveal} checked={autoReveal} id="check" className="sr-only peer" />
                                    <span className="absolute w-[11.8px] h-[11.8px] bg-white rounded-full left-[1px] top-[1px] peer-checked:w-[16.8px] peer-checked:h-[16.8px] peer-checked:top-[-1.5px] peer-checked:shadow-lg peer-checked:left-[16.5px] transition-all duration-200"></span>
                                </label>
                                <label
                                    htmlFor="check"
                                    className="inline-block hover:cursor-pointer text-center text-white detail-one sm:subheading-three leading-3"
                                >
                                    Auto-reveal
                                </label>
                            </div>
                            {isUserLoggedIn() && userIsOwner() && !loadingRequest && (
                                <button
                                    onClick={revealAllGames}
                                    className={classNames('bg-white rounded-lg detail-one sm:subheading-three h-[40px] leading-3 py-0 px-3 sm:px-4', {
                                        'cursor-not-allowed opacity-10': !true,
                                    })}
                                >
                                    Reveal All
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {shouldShowRenameButton() && (
                    <RenamePlayerModal
                        open={renamePlayerModalOpen}
                        setOpen={setRenamePlayerModalOpen}
                        namingStatus={namingStatus}
                        userRequestedNewName={userRequestedNewName}
                        playerId={playerId}
                    />
                )}
            </div>
        </div>
    );
};

export default LockerRoomHeader;

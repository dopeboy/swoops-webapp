import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { createPortal } from 'react-dom';
import { useDisconnect, useAccount, useBalance } from 'wagmi';
import { AccountsService as accountsService } from '../../lib/api/services/AccountsService';
import { getUserDetail, logoutUserFromClient } from 'src/lib/utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { loginRoute } from 'src/lib/routes';
import { SPRankIcon } from './SPRankIcon';
import { SPIcon } from './SPIcon';
import { SPBadge } from './SPBadge';
import { SPBar } from './SPBar';
import { MetamaskIcon } from './MetamaskIcon';
import { AtSymbolIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { ApiService } from 'src/lib/api';
import { useTorus } from 'src/contexts/Torus.context';
import { LoadingSpinner } from './LoadingSpinner';

const SP_PER_LEVEL = 1000;
const MAX_SP = 22000;

interface NavbarProfileMenuProps {
    setContactUsModalOpen: (open: boolean) => void;
    isGM?: boolean;
    isHidden?: boolean;
}
export const NavbarProfileMenu: React.FC<NavbarProfileMenuProps> = ({ setContactUsModalOpen, isHidden = false }) => {
    const { torus } = useTorus();
    const router = useRouter();
    const account = useAccount();
    const { disconnect } = useDisconnect();
    const { data: balance } = useBalance({ address: account?.address });
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const [currentSP, setCurrentSP] = useState<number>(0);
    const [loadingSP, setLoadingSP] = useState<boolean>(false);
    const [loadingOpenWallet, setLoadingOpenWallet] = useState<boolean>(false);
    const level = Math.floor(currentSP / SP_PER_LEVEL);
    const nextLevelSP = level >= 22 ? 22000 : (level + 1) * SP_PER_LEVEL;
    const currentLevelSP = currentSP % SP_PER_LEVEL;
    const remainingSP = nextLevelSP - currentSP;
    let progress;
    if (currentSP >= MAX_SP) {
        progress = '100';
    } else {
        progress = ((currentLevelSP / SP_PER_LEVEL) * 100).toFixed(0);
    }
    const nextLevel = level >= 22 ? 22 : level + 1;

    const maskAddress = (address: string): string => {
        return `${address?.slice(0, 4)}********${address?.slice(-4)}`;
    };

    const getCurrentSP = async (): Promise<void> => {
        try {
            if (isHidden) return;
            const teamId = getUserDetail()?.team?.id || getUserDetail()?.team;
            setLoadingSP(true);
            setTimeout(async () => {
                try {
                    const team = await ApiService.apiGameTeamRead(Number(teamId));
                    setCurrentSP(team.total_sp || 0);
                    setLoadingSP(false);
                } catch (error) {
                    console.error(error);
                    setLoadingSP(false);
                }
            }, 1000);
        } catch (error) {
            console.error(error);
            setLoadingSP(false);
        }
    };

    const getTierNameFromLevel = (level: number): string => {
        if (level < 4) {
            return 'Rookie';
        } else if (level < 12) {
            return 'Veteran';
        } else if (level < 19) {
            return 'All Star';
        } else if (level >= 19) {
            return 'GOAT';
        }
    };

    const logout = async (e: any): Promise<void> => {
        if (e) e?.preventDefault();

        try {
            // clears cookie on client side + invalidates on server side
            await accountsService.accountsLogoutCreate();
            if (torus && torus.isLoggedIn) {
                await torus.logout();
            }
        } catch (error) {
            console.error(error, 'error logging out');
        }
        // clears flag client side
        logoutUserFromClient();
        disconnect();

        // redirect
        router.push(loginRoute);
    };
    const showWallet = (e) => {
        e.preventDefault();
        setLoadingOpenWallet(true);
        try {
            torus.showWallet('home', { '': '' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingOpenWallet(false);
        }
    };
    useEffect(() => {
        getCurrentSP();
    }, []);

    return (
        <Menu
            as="div"
            className={classNames('ml-3 relative', {
                hidden: isHidden,
            })}
        >
            <div className="flex flex-row items-center justify-end gap-5">
                {/* Debugging range slider for SP */}
                {/* <div className="z-10 w-full max-w-md flex flex-col text-base">
                    <span className="!detail-one w-full text-xs text-[6px]">Debug only</span>
                    <input
                        id="steps-range"
                        type="range"
                        min={0}
                        max={22000}
                        value={currentSP}
                        onChange={(e) => {
                            setCurrentSP(Number(e.target.value));
                        }}
                        step={1}
                        className="w-full h-3.5 rounded-lg range-lg accent-blue appearance-none cursor-pointer bg-gray-200 border-gray-400"
                    />
                </div> */}
                {/* Dropdown trigger */}
                <Menu.Button
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPosition({ top: rect.top + rect.height + window.pageYOffset, right: rect.width > 250 ? 80 : 15 });
                    }}
                    disabled={loadingSP}
                    className="font-medium"
                >
                    <div className="w-full rounded-lg bg-white px-3 py-2 border border-solid border-black/8 hover:bg-black/4">
                        <div className="w-full flex items-center">
                            <div className="flex flex-row items-center justify-center mr-3 xl:mr-5">
                                <SPRankIcon level={level} />
                                <div className="flex flex-col gap-[15px] items-center mt-[18px] justify-end">
                                    {/* Experience bar */}
                                    <SPBar
                                        level={level}
                                        loadingSP={loadingSP}
                                        isMaxLevel={level === nextLevel}
                                        currentSP={currentSP}
                                        nextLevelSP={nextLevelSP}
                                        progress={progress}
                                    />
                                    <SPIcon size="xs" color="black" />
                                </div>
                                <div className="absolute right-9 xl:right-11 inset-y-[9.5px]">
                                    <SPBadge isMaxLevel={level === nextLevel} level={nextLevel} />
                                </div>
                            </div>
                            <ChevronDownIcon className="ml-4 h-5 w-5 text-black" aria-hidden="true" />
                        </div>
                    </div>
                </Menu.Button>
            </div>
            {/* Dropdown */}
            <Transition
                as="div"
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                {createPortal(
                    <Menu.Items
                        style={{ top: menuPosition.top, right: menuPosition.right }}
                        onClick={(e) => e.preventDefault()}
                        className="z-60 origin-top-right max-w-[308px] w-full absolute right-0 mt-2 divide-y-[1px] divide-black/8 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                        <Menu.Item>
                            <div className="flex flex-col items-center justify-center gap-4 p-6">
                                <div className="w-full flex flex-row items-center justify-between gap-4">
                                    <div className="flex flex-row items-start justify-start gap-1.5">
                                        <SPRankIcon
                                            className={classNames('absolute z-10 inset-y-[13px] subheading-one text-off-black', {
                                                'text-[10px] inset-x-4': level === 1,
                                                'text-[10px] inset-x-3.5': (level !== 1 && level < 10) || level === 11,
                                                'text-[10px] inset-x-[11px]': level === 10,
                                                'text-[10px] inset-x-3': level !== 11 && level > 10 && level < 20,
                                                'text-[9px] inset-x-2.5': level !== 21 && level > 19,
                                                'text-[9px] inset-x-3': level === 21,
                                            })}
                                            level={level}
                                        />
                                        <div className="flex flex-col items-start justify-between">
                                            <span className="subheading-one text-black">{getTierNameFromLevel(level)}</span>
                                            <span className="flex flex-row items-center justify-start gap-1.5">
                                                <span className="subheading-two text-black">{currentSP}</span>
                                                <SPIcon size="xs" color="black" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-between">
                                        <span className="subheading-two text-off-black">
                                            {nextLevel < 22 ? `Level ${nextLevel} in` : 'Max level'}
                                        </span>
                                        <span className="flex flex-row items-center justify-end gap-1.5">
                                            <span className="subheading-two text-off-black text-end">{nextLevel < 23 ? remainingSP : 0}</span>
                                            <SPIcon size="xs" color="off-black" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Menu.Item>
                        <Menu.Item>
                            <div className="flex flex-col items-center justify-center gap-4 p-6">
                                <div className="flex flex-col w-full items-start justify-center gap-3">
                                    {getUserDetail()?.email && (
                                        <div className="w-full flex flex-row items-start justify-start gap-3">
                                            <AtSymbolIcon className="h-6 w-6 text-black" />
                                            <div className="flex flex-col items-start justify-start">
                                                <div className="text-base text-off-black font-bold font-display text-left">Email</div>
                                                <div className="text-base text-off-black font-semi-bold text-left font-display mt-0.5">
                                                    {getUserDetail()?.email}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="w-full flex flex-row items-start justify-start gap-3">
                                        {getUserDetail()?.is_web3_auth_user ? (
                                            <img src={'https://tor.us/images/Wallet.svg'} className="h-6 w-6" />
                                        ) : (
                                            <MetamaskIcon />
                                        )}
                                        <div className="flex flex-col items-start justify-start w-full">
                                            <div className="text-base text-off-black font-bold font-display text-left">
                                                {getUserDetail()?.is_web3_auth_user ? 'Torus Wallet' : 'Metamask Wallet'}
                                            </div>
                                            <>
                                                {getUserDetail()?.is_web3_auth_user ? (
                                                    <div className="w-full flex flex-row items-center justify-between text-base text-off-black font-semibold text-left font-display mt-0.5">
                                                        {maskAddress(getUserDetail()?.address)}
                                                        <button
                                                            onClick={showWallet}
                                                            className="rounded-lg hover:bg-black/4 min-w-[70px] border-2 px-3 py-1 border-black bg-white subheading-two text-black text-center align-middle"
                                                        >
                                                            {loadingOpenWallet ? (
                                                                <LoadingSpinner bgColor="transparent" fill="#333333" className="h-4 w-4" />
                                                            ) : (
                                                                'View'
                                                            )}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    account?.address && (
                                                        <>
                                                            <div className="text-base text-off-black font-semibold text-left font-display mt-1">
                                                                {maskAddress(account?.address)}
                                                            </div>
                                                            <div className="text-xs text-off-black font-semi-bold text-left font-display mt-0.5">
                                                                {balance?.formatted} {balance?.symbol}
                                                            </div>
                                                        </>
                                                    )
                                                )}
                                            </>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="rounded-lg hover:bg-black/4 border-2 w-full py-3 border-black bg-white subheading-two text-black text-center align-middle"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </Menu.Item>
                        <Menu.Item>
                            <div className="flex flex-col items-center justify-center gap-4 px-6 py-3">
                                <button
                                    onClick={() => setContactUsModalOpen(true)}
                                    className="w-10/12 flex flex-row py-3 rounded-lg hover:bg-black/4 items-center justify-center gap-3 text-black subheading-two"
                                >
                                    <ExclamationTriangleIcon style={{ strokeWidth: '2px' }} className="h-4 w-4" />
                                    Report an issue
                                </button>
                            </div>
                        </Menu.Item>
                    </Menu.Items>,
                    document?.body
                )}
            </Transition>
        </Menu>
    );
};

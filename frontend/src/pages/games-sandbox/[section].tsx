import { ReactElement, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { LayoutDecider } from 'src/components/common/LayoutDecider';
import { ApiService, GameListing } from 'src/lib/api';
import 'rc-tabs/assets/index.css';
import GameService from 'src/services/GameService';
import PageHeader from '../../components/common/PageHeader';
import CourtroomFilter from '../../components/court/CourtroomFilter';
import RenderCourtroomTable, { LoadingEnabledGame } from '../../components/court/RenderCourtroomTable';
import { EmbeddedNavbarRoute } from 'src/components/common/EmbeddedNavBar';
import { TableNavBar } from 'src/components/common/TableNavBar';
import { getUserDetail, isUserLoggedIn, setUserDetail } from 'src/lib/utils';
import { trackPageLanding } from '../../lib/tracking';
import { AccountsService } from '../../lib/api/services/AccountsService';
import classNames from 'classnames';
import { LoadingSpinner } from 'src/components/common/LoadingSpinner';
import PlayerService, { ReadonlyPlayer } from 'src/services/PlayerService';
import { toast } from 'react-toastify';
import { MaxSwoopstersButtonGroup } from 'src/components/court/MaxSwoopstersButtonGroup';
import InfiniteScroll from 'react-infinite-scroll-component';

const OPEN_TAB_SLUG = 'open';
const COMPLETED_TAB_SLUG = 'completed';

const Games = (): ReactElement => {
    const router = useRouter();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const { section } = router.query;
    const sectionRef = useRef<string | string[]>();
    const [games, setGames] = useState<LoadingEnabledGame[]>([]);
    const [currentTeamId, setCurrentTeamId] = useState<number>();
    const [gamesType, setGamesType] = useState<'All Games' | 'My Games'>(section === 'completed' ? 'My Games' : 'All Games');
    const [autoReveal, setAutoreveal] = useState<boolean>(true);
    const [areGamesToReveal, setAreGameToReveal] = useState<boolean>(false);
    const [userOwnedPlayerAmount, setUserOwnedPlayerAmount] = useState<number>(0);
    const [enabledOpenGames, setEnableOpenGames] = useState<boolean>(false);
    const [tokensRequired, setTokensRequired] = useState<number>(5);
    const tokensRequiredRef = useRef<number>(1);
    const gamesTypeRef = useRef<'All Games' | 'My Games'>(section === 'completed' ? 'My Games' : 'All Games');
    const [tokenGatedGames, setTokenGatedGames] = useState<LoadingEnabledGame[]>([]);
    const [page, setPage] = useState<number>(1);

    const getGames = async (status: GameListing.status, teamId: number, avoidLoading = false): Promise<void> => {
        try {
            if (!avoidLoading) setLoadingRequest(true);
            const gamesResult = await GameService.getGames(teamId || null, status, page);

            // const { enabled } = await ApiService.apiGameStatusList();
            setEnableOpenGames(true);
            const tokenGatedGames = gamesResult.filter((game) => !game?.tokens_required || game?.tokens_required === tokensRequiredRef.current);
            setTokenGatedGames(tokenGatedGames as LoadingEnabledGame[]);

            // const currentGames = [...games, ...gamesResult];
            setGames(gamesResult as LoadingEnabledGame[]);
            // setPage(page + 1);

            setAreGameToReveal(gamesResult.some((game) => game.revealed === false));
            if (!avoidLoading) setLoadingRequest(false);
        } catch (err) {
            console.error('Problem getting list of games: ' + err);
        }
    };

    useEffect(() => {
        if (!router.isReady) return;
        trackPageLanding(`Courtroom`);
        // setPage(1);
        setSectionGames();
        // setGames([]);
    }, [router.isReady, section, gamesType]);

    const setSectionGames = (avoidLoading = false) => {
        const { section } = router.query;
        let statusToLoad;
        switch (section as string) {
            case 'open':
                statusToLoad = GameListing.status.OPEN;
                break;
            case 'completed':
                statusToLoad = GameListing.status.COMPLETE;
                break;
            default:
                statusToLoad = GameListing.status.OPEN;
                break;
        }
        const user = getUserDetail();
        setCurrentTeamId(user?.team?.id);
        gamesType === 'All Games' ? getGames(statusToLoad, null, avoidLoading) : getGames(statusToLoad, user?.team?.id, avoidLoading);
    };

    const generateTabs = (): EmbeddedNavbarRoute[] => {
        return [
            { title: 'Open', path: `${OPEN_TAB_SLUG}`, section: 'open' },
            { title: 'Completed', path: `${COMPLETED_TAB_SLUG}`, section: 'completed' },
        ];
    };

    const filterGames = (gamesType: 'All Games' | 'My Games') => {
        setGamesType(gamesType);
    };

    const setLoadingGame = (id: number, loading: boolean) => {
        const newGames = tokenGatedGames.map((game) => {
            if (game.id === id) {
                return { ...game, loading };
            }
            return game;
        });
        setTokenGatedGames(newGames);
    };

    useEffect(() => {
        if (getUserDetail()?.id) {
            setAutoreveal(getUserDetail()?.reveal_games_by_default);
        }
    }, [getUserDetail()?.id]);

    const userIsOwner = (): boolean => {
        return isUserLoggedIn() && getUserDetail()?.team?.id && getUserDetail()?.team?.id === currentTeamId;
    };

    const getOwnedPlayers = async (): Promise<ReadonlyPlayer[]> => {
        const teamId = getUserDetail()?.team?.id;
        if (!teamId) {
            toast.error('You must have a team to join a game. If you are a team owner, please signin.');
            return [];
        }
        return PlayerService.getPlayerRoster(teamId);
    };

    const verifyUserOwnsAtLeastOnePlayer = async (): Promise<void> => {
        try {
            const ownedPlayers = await getOwnedPlayers();
            setUserOwnedPlayerAmount(ownedPlayers.length);
        } catch (error) {
            toast.warning('You must have players to join a game. If you are a team owner, please signin.');
            console.error(error);
        }
    };

    const setDefaultReveal = async (e) => {
        setAutoreveal(e.target.checked);
        const user = getUserDetail();
        user.reveal_games_by_default = e.target.checked;
        setUserDetail(user);
        const newGames = [...games];
        setGames(
            newGames.map((game) => {
                const newGame = { ...game };
                newGame.revealed = true;
                return newGame;
            })
        );
        await AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), { reveal_games_by_default: e.target.checked });
    };

    const revealAllGames = async () => {
        if (areGamesToReveal) {
            const newGames = [...tokenGatedGames];
            setTokenGatedGames(
                newGames.map((game) => {
                    const newGame = { ...game };
                    newGame.revealed = true;
                    return newGame;
                })
            );
            await AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), { reveal_games_by_default: true });
            await AccountsService.accountsPartialUpdate(getUserDetail()?.id.toString(), { reveal_games_by_default: false });
        }
    };

    useEffect(() => {
        const filteredGames = games.filter((game) => !game?.tokens_required || game.tokens_required === tokensRequired);
        tokensRequiredRef.current = tokensRequired;
        setTokenGatedGames(filteredGames);
    }, [tokensRequired]);

    useEffect(() => {
        gamesTypeRef.current = gamesType;
    }, [gamesType]);

    useEffect(() => {
        const filteredGames = games.filter((game) => !game?.tokens_required || game.tokens_required === tokensRequired);
        setTokenGatedGames(filteredGames);
    }, [games]);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (sectionRef.current === 'open') {
                setIsFetching(true);
                // setPage(1);
                await getGames(GameListing.status.OPEN, gamesTypeRef.current === 'All Games' ? null : currentTeamId, true);
                setIsFetching(false);
            }
        }, 7500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (section) {
            sectionRef.current = section;
        }
    }, [section]);

    useEffect(() => {
        verifyUserOwnsAtLeastOnePlayer();
    }, []);

    return (
        <LayoutDecider>
            <PageHeader title="Court" />
            <div className="h-12" />
            <div className="pl-3 sm:pl-12 w-full relative">
                {section && <TableNavBar routesToUse={generateTabs()} />}
                {isFetching && (
                    <div className="absolute w-32 sm:w-fit right-2 bottom-1 md:bottom-2">
                        <div className="flex flex-row items-center justify-end gap-1.5 sm:gap-2">
                            <LoadingSpinner className="w-5 h-5 sm:w-4 sm:h-4 -mt-0.5" />
                            <span className="text-white text-center detail-one">Fetching new games</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="relative flex justify-between w-full">
                <div className="flex flex-row items-center justify-between w-full border-t border-solid border-white/16 border-b pr-3 sm:pr-12">
                    <CourtroomFilter
                        gamesType={gamesType}
                        setGamesType={setGamesType}
                        currentTeamId={currentTeamId}
                        filterGames={(gamesType) => filterGames(gamesType)}
                    />
                    <div className="flex flex-row items-end justify-end gap-4">
                        {section === 'completed' && gamesType === 'My Games' && isUserLoggedIn() && userIsOwner() && !loadingRequest && (
                            <div className="flex flex-row items-center justify-end gap-1 sm:gap-4">
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
                                        className={classNames(
                                            'bg-white rounded-lg detail-one sm:subheading-three h-[40px] leading-3 py-0 px-3 sm:px-4',
                                            {
                                                'cursor-not-allowed opacity-10': !true,
                                            }
                                        )}
                                    >
                                        Reveal All
                                    </button>
                                )}
                            </div>
                        )}
                        {section === 'open' && !loadingRequest && (
                            <MaxSwoopstersButtonGroup
                                userOwnedPlayerAmount={userOwnedPlayerAmount}
                                tokensRequired={tokensRequired}
                                onClick={(selectedOption: number) => {
                                    setTokensRequired(selectedOption);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
            {section === 'open' && !loadingRequest && !enabledOpenGames ? (
                <>
                    <div className="p-6 md:p-12 bg-black w-full pl-12 rounded-lg flex items-center justify-center">
                        <div>
                            <img className="hidden sm:inline-block" src="/images/StackedCard.png" width={300} />
                        </div>

                        <div className="flex flex-col">
                            <h1 className="subheading-one text-white text-left sm:w-96 w-84">SSN2 Launching Soon...</h1>
                            {/* <span className="text-base text-gray-400 text-left">
                                <ul>
                                    <li>
                                        - Tune into the
                                        <a className="underline" href="/tournament/5">
                                            {' Swooper Bowl '}
                                        </a>
                                        from 5/12 to 5/14.
                                    </li>
                                    <li>
                                        - Don't forget to participate in the
                                        <a className="underline" href="https://twitter.com/PlaySwoops/status/1644381862800785413" target={'_blank'}>
                                            {' SSN1 Mint '}
                                        </a>
                                        from 5/17 to 5/19!
                                    </li>
                                </ul>
                            </span> */}
                        </div>
                    </div>
                </>
            ) : section === 'completed' ? (
                // <InfiniteScroll dataLength={games.length} next={() => setSectionGames(true)} hasMore={true} loader={<h4></h4>}>
                <RenderCourtroomTable
                    userOwnedPlayerAmount={userOwnedPlayerAmount}
                    reloadGames={() => getGames(GameListing.status.COMPLETE, currentTeamId)}
                    currentTeamId={currentTeamId}
                    setLoading={(id, loading) => setLoadingGame(id, loading)}
                    games={games}
                    loadingGames={loadingRequest}
                    section={section as string}
                />
            ) : (
                // </InfiniteScroll>
                <RenderCourtroomTable
                    userOwnedPlayerAmount={userOwnedPlayerAmount}
                    reloadGames={() => getGames(GameListing.status.OPEN, currentTeamId)}
                    currentTeamId={currentTeamId}
                    setLoading={(id, loading) => setLoadingGame(id, loading)}
                    games={tokenGatedGames}
                    loadingGames={loadingRequest}
                    section={section as string}
                />
            )}
        </LayoutDecider>
    );
};

export default Games;

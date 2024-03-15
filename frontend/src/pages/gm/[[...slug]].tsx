import React, { ReactElement, useState, useEffect } from 'react';
import Head from 'next/head';
import Team from 'src/components/gm/swoopsGm/Team';
import LineupTable from 'src/components/gm/swoopsGm/LineupTable';
import DailyChallenge from 'src/components/gm/swoopsGm/DailyChallenge';
import MainLayout from 'src/components/gm/common/MainLayout';
import { ApiService, NBAPlayerStats } from 'src/lib/gm/api';
import { placeholders, position, positionAbbr, maximumPlayers } from 'src/lib/gm/const';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import classnames from 'classnames';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import { trackEvent, trackPageLanding } from 'src/lib/tracking';

const GM10000 = (): ReactElement => {
    const router = useRouter();

    const [salaryCap, setSalaryCap] = useState<number>(0);
    const [budget, setBudget] = useState<number>(0);
    const [errorBudget, setErrorBudget] = useState<boolean>(false);
    const [today, setToday] = useState({ id: undefined, date: '', description: '', pool: '', closesAt: '' });
    const [enemyLineup, setEnemyLineup] = useState<NBAPlayerStats[]>([]);
    const [yourLineup, setYourLineup] = useState<NBAPlayerStats[] | any[]>([...placeholders]);
    const [players, setPlayers] = useState<NBAPlayerStats[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [partnerSlug, setPartnerSlug] = useState<string>('');

    const yourLineupLength = yourLineup.filter((player) => player.type !== 'placeholder').length;

    const [filters, setFilters] = useState({
        search: '',
        position: 'All',
        sort: '',
        ordering: '',
    });

    const disabled = isLoading || yourLineupLength !== 5 || errorBudget;

    const handleAddLineup = (value) => {
        let count = 0;
        trackEvent('GM - Player added to lineup.');
        const { position } = value.player;

        yourLineup.forEach((player) => {
            if (player.position === position) {
                count++;
            }
        });

        if (count === maximumPlayers[position] && yourLineupLength !== 5) {
            toast.error(`${positionAbbr[position]} maximum is ${maximumPlayers[position]} ${maximumPlayers[position] > 1 ? 'players' : 'player'}`);
            return;
        }

        if (yourLineupLength < 5 && !errorBudget) {
            const statePlayers = players.filter((player) => {
                return value.id !== player.id;
            });

            const statePlaceholderIdx = placeholders.findIndex((placeholder, idx) => {
                return yourLineup[idx].type === 'placeholder' && placeholder.position_filter === value.player.position;
            });

            yourLineup[statePlaceholderIdx] = {
                rpg: value.rpg,
                apg: value.apg,
                ppg: value.ppg,
                price: value.price,
                rating: value.rating,
                ...value.player,
                id: value.id,
            };

            setPlayers(statePlayers);
            setYourLineup(yourLineup);
            toast.success(`${value.player.full_name} added`);
            setBudget((prevBudget) => {
                return prevBudget + value.price;
            });
            setErrorBudget(budget + value.price > salaryCap);
            return;
        } else if (errorBudget) {
            toast.error('Reduce your team’s salary to stay within the cap');
            return;
        }
        toast.error('Your lineup maximum is 5 players');
    };

    const handleRemoveLineup = (id, idx) => {
        const statePlayer = yourLineup.find((lineup) => {
            return id === lineup.id;
        });

        const statePlaceholder = placeholders.find((_, placeholderIdx) => {
            return placeholderIdx === idx;
        });

        yourLineup[idx] = {
            ...statePlaceholder,
        };

        setYourLineup(yourLineup);

        if (positionAbbr[statePlayer.position] === filters.position || filters.position === 'All') {
            setPlayers([
                {
                    id: statePlayer.id,
                    season: statePlayer.season,
                    apg: statePlayer.apg,
                    rpg: statePlayer.rpg,
                    ppg: statePlayer.ppg,
                    price: statePlayer.price,
                    rating: statePlayer.rating,
                    player: {
                        full_name: statePlayer.full_name,
                        first_name: statePlayer.first_name,
                        last_name: statePlayer.last_name,
                        position: statePlayer.position,
                        image_url: statePlayer.image_url,
                        is_active: statePlayer.is_active,
                    },
                },
                ...players,
            ]);
        }

        setBudget((prevBudget) => {
            return prevBudget - statePlayer.price;
        });
        setErrorBudget(budget - statePlayer.price > salaryCap);
    };

    const handleFilter = (value) => {
        setFilters(value);
    };

    const handleSubmitLineup = async () => {
        if (isLoading) {
            return;
        }
        trackEvent('GM - Lineup submit clicked.');
        // If it's past closing time, do a hard reload with a URL param
        // that will trigger a toast explaining to user that this challenge
        // has expired and to play a new one.
        if (moment(today.closesAt).isBefore(new Date().toUTCString())) {
            router.replace('/gm?reload=true').then(() => router.reload());
            return;
        }
        const lineupPayload = {
            challenge: today.id,
            // TODO - Fix hack here where we're converting strings to numbers. Should have consistent types.
            player_1: +yourLineup[0].id,
            player_2: +yourLineup[1].id,
            player_3: +yourLineup[2].id,
            player_4: +yourLineup[3].id,
            player_5: +yourLineup[4].id,
            partner_slug: partnerSlug,
        };
        try {
            // TODO - Deduplicate this code between here and SubmitLineupModal
            setIsLoading(true);

            const apiCreateGameRes: any = await ApiService.apiCreateGame(lineupPayload);

            trackEvent('GM - Lineup successfully submitted.');
            router.push(`/gm/pending/${apiCreateGameRes.uuid}`);
        } catch (err) {
            console.error('Error submitting lineup: ' + err);

            // If we get the following error, we know the user hasn't validated a phone number previously and we'll need them to do so before submitting
            if (err?.body?.detail === 'Authentication credentials were not provided.') {
                trackEvent('GM - Lineup submission attempt, user not logged in.');
                localStorage.setItem('lineupPayload', JSON.stringify(lineupPayload));
                router.push({ pathname: '/login', query: { redirectUrl: '/gm/pending', referrer_code: 'gm' } });
                // setOpenModal(true);
            } else if (err?.body?.non_field_errors) {
                toast.error(err.body.non_field_errors[0]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchEnemyLineup = async (): Promise<void> => {
            try {
                const data: any = await ApiService.apiDailyLineupPrimaryToday();

                setEnemyLineup([
                    { ...data.lineup.player_1.player, price: data.lineup.player_1.price },
                    { ...data.lineup.player_2.player, price: data.lineup.player_2.price },
                    { ...data.lineup.player_3.player, price: data.lineup.player_3.price },
                    { ...data.lineup.player_4.player, price: data.lineup.player_4.price },
                    { ...data.lineup.player_5.player, price: data.lineup.player_5.price },
                ]);
                setToday({ id: data.id, date: data.date, description: data.description, pool: data.pool, closesAt: data.closes_at });
                setSalaryCap(
                    data.lineup.player_1.price +
                        data.lineup.player_2.price +
                        data.lineup.player_3.price +
                        data.lineup.player_4.price +
                        data.lineup.player_5.price
                );
            } catch (err) {
                console.error('Error getting players: ' + err);
            }
        };
        fetchEnemyLineup();

        /*
        if (router.isReady) {
            const { slug } = router.query;
            async function callValidatePartner(slug: string) {
                try {
                    const data = await validatePartner(slug.toLowerCase());
                    setPartnerSlug(data.slug);
                } catch (e) {
                    // Invalid partner slug. Redirect to closed page
                    router.push(`/gm/closed/`);
                }
            }

            // If there's a slug in our path, check it
            if (slug) callValidatePartner(slug[0]);
            
        }
        */
        if (router.isReady) {
            const { reload } = router.query;

            // If there's a slug in our path, check it
            if (reload) toast.info("The challenge you were playing has ended. We've loaded a brand new challenge for you!");
        }
    }, [router.isReady]);

    useEffect(() => {
        const fetchPlayers = async (): Promise<void> => {
            try {
                const data: any = await ApiService.apiNBAPlayerRead({
                    position: position[filters.position],
                    ordering: filters.ordering,
                    search: filters.search,
                });

                const yourLineupIds = yourLineup.map((player) => {
                    return player.id;
                });

                const statePlayers = data.results.filter((player) => {
                    return !yourLineupIds.includes(player.id);
                });

                setPlayers(statePlayers);
            } catch (err) {
                console.error('Error getting players: ' + err);
            }
        };
        fetchPlayers();
    }, [filters]);

    useEffect(() => {
        trackPageLanding(`GM - Lineup page`);
    }, []);

    return (
        <MainLayout>
            <Head>
                <title>SwoopsGM</title>
                <meta name="description" content="Stop debating start simulating" />
                <meta property="og:url" content="https://gm.playswoops.com/" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="SwoopsGM" />
                <meta property="og:description" content="Stop debating start simulating" />
                <meta property="og:image" content="https://gm.playswoops.com/images/SWOOPS_GM_SM_preview_image.png?43" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta property="twitter:domain" content="gm.playswoops.com" />
                <meta property="twitter:url" content="https://gm.playswoops.com/" />
                <meta name="twitter:title" content="SwoopsGM" />
                <meta name="twitter:description" content="Stop debating start simulating" />
                <meta name="twitter:image" content="https://gm.playswoops.com/images/SWOOPS_GM_SM_preview_image.png?43" />
            </Head>
            <div className="flex flex-col bg-black py-5 md:py-12">
                <div className="container-md">
                    <DailyChallenge
                        date={today?.date}
                        title={today?.description}
                        description="Choose 5 players from the NBA within today’s salary cap to compete in this challenge."
                    />
                    <div className="mb-6 md:mb-12">
                        <div className="flex flex-row justify-between mb-4 md:mb-0 relative">
                            <Team title="Challenge team" players={enemyLineup} errorBudget={errorBudget} salaryCap={salaryCap} />
                            <Team
                                title="Your Lineup"
                                budget={budget}
                                errorBudget={errorBudget}
                                players={yourLineup}
                                yourLineup
                                handleRemoveLineup={handleRemoveLineup}
                                handleSubmitLineup={handleSubmitLineup}
                                salaryCap={salaryCap}
                                buttonDisabled={disabled}
                            />
                        </div>
                        <div className="flex flex-row justify-end">
                            <button
                                onClick={handleSubmitLineup}
                                disabled={disabled}
                                className={classnames('block md:hidden w-full', {
                                    'btn-rounded-grey': disabled,
                                    'btn-rounded-green ': !disabled,
                                })}
                            >
                                Submit Lineup
                            </button>
                        </div>
                    </div>
                    <LineupTable players={players} filter={filters} handleFilter={handleFilter} handleAddLineup={handleAddLineup} />
                </div>
            </div>
        </MainLayout>
    );
};

export default GM10000;

import { useEffect, useState, ReactElement } from 'react';
import { TournamentDetail } from 'src/lib/api';
import { getPrice, extractPayouts } from 'src/lib/utils';
import { PayoutModal } from './PayoutModal';

interface TournamentPageHeaderProps {
    tournament: TournamentDetail;
    roundAmount: number;
}

enum Status {
    OPEN = 'OPEN',
    FULL = 'FULL',
    LIVE = 'LIVE',
    ENDED = 'ENDED',
}

export const TournamentPageHeader: React.FC<TournamentPageHeaderProps> = ({ roundAmount, tournament }): ReactElement => {
    const [tournamentStatus, setTournamentStatus] = useState<Status>(Status.OPEN);
    const [remainingDayTime, setremainingDayTime] = useState<number>();
    const [openPayoutModal, setOpenPayoutModal] = useState<boolean>(false);
    const [payoutList, setPayoutList] = useState([]);

    const [countdownTime, setCountdownTime] = useState({
        countdownDays: 0,
        countdownHours: 0,
        countdownMinutes: 0,
        countdownSeconds: 0,
    });

    const countdownTimer = (expTime) => {
        const timeInterval = setInterval(() => {
            const countdownDateTime = new Date(expTime).getTime();
            const currentTime = new Date().getTime();
            const remainingDayTime = countdownDateTime - currentTime;
            const totalDays = Math.floor(remainingDayTime / (1000 * 60 * 60 * 24));
            const totalHours = Math.floor((remainingDayTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const totalMinutes = Math.floor((remainingDayTime % (1000 * 60 * 60)) / (1000 * 60));
            const totalSeconds = Math.floor((remainingDayTime % (1000 * 60)) / 1000);

            const runningCountdownTime = {
                countdownDays: totalDays,
                countdownHours: totalHours,
                countdownMinutes: totalMinutes,
                countdownSeconds: totalSeconds,
            };

            setCountdownTime(runningCountdownTime);
            setremainingDayTime(remainingDayTime);

            if (remainingDayTime < 0) {
                clearInterval(timeInterval);
            }
        }, 1000);
    };

    useEffect(() => {
        if (tournament?.id) {
            calculatePayout(tournament.rounds.length, Number(tournament.payout), tournament.kind);
        }

        if (tournament?.end_date && tournament?.end_date < new Date().toISOString()) {
            setTournamentStatus(Status.ENDED);
            return;
        }
        if (tournament?.start_date) {
            countdownTimer(tournament?.start_date);
            const countdownDateTime = new Date(tournament?.start_date).getTime();
            const currentTime = new Date().getTime();
            const lineupSubmissionDateTime = new Date(tournament?.lineup_submission_cutoff).getTime();

            const remainingDayTimeForStart = countdownDateTime - currentTime;
            const remainingDayTimeForLineupSubmission = lineupSubmissionDateTime - currentTime;

            if (remainingDayTimeForStart < 0) {
                setTournamentStatus(Status.LIVE);
            } else if (remainingDayTimeForLineupSubmission < 0) {
                setTournamentStatus(Status.FULL);
            } else {
                setTournamentStatus(Status.OPEN);
            }
        }
    }, [tournament]);

    const displayTitle = () => {
        switch (tournamentStatus) {
            case Status.FULL:
                return 'Registration Closed';
            case Status.LIVE:
                return 'Tournament Live';
            case Status.OPEN:
                return 'Join Tournament';
            case Status.ENDED:
                return 'Tournament Ended';
            default:
                return 'Join Tournament';
        }
    };

    const calculatePayout = (rounds, payout, tournamentKind) => {
        let payoutAmounts;
        if (tournamentKind === TournamentDetail.kind.END_OF_SEASON) {
            payoutAmounts = [
                { position: 'Winner', amount: 6000 },
                { position: '2nd', amount: 3000 },
                { position: '3rd-4th', amount: 1400 },
                { position: '5th-8th', amount: 550 },
                { position: '9th-16th', amount: 240 },
                { position: '17th-32nd', amount: 80 },
                { position: '33rd-64th', amount: 25 },
            ];
            setPayoutList(payoutAmounts);
        } else {
            const teamCount = 2 ** rounds;
            let payoutPercentages;

            // if (teamCount >= 32) {
            //     payoutPercentages = [50, 25, 7.5, 7.5, 2.5, 2.5, 2.5, 2.5];
            // } else if (teamCount === 16) {
            //     payoutPercentages = [50, 25, 12.5, 12.5];
            // } else {
            //     payoutPercentages = [70, 30];
            // }
            const payoutsBreakdown = extractPayouts(tournament?.meta);

            payoutAmounts = payoutsBreakdown.map((payout, index) => {
                const amount = payout;
                // const amount = (payout * percentage) / 100;
                const position = index + 1;
                let label;

                if (position === 1) {
                    label = 'Winner';
                } else if (position === 2) {
                    label = '2nd';
                } else if (position === 3) {
                    label = '3rd';
                } else {
                    label = `${position}th`;
                }

                return {
                    position: label,
                    amount: amount,
                };
            });
        }

        setPayoutList(payoutAmounts);
    };

    return (
        <div className="w-full pt-4 px-3 sm:px-12 z-50 relative bg-inherit">
            {tournament?.kind === TournamentDetail.kind.END_OF_SEASON || TournamentDetail.kind.PARTNER ? (
                <div className="items-center flex flex-col">
                    <h1 className="subheading-two sm:subheading-one text-white">Welcome to the</h1>
                    <img
                        className="w-[620px]"
                        src={
                            tournament.banner_img_url
                                ? tournament.banner_img_url
                                : tournament.id === 86
                                ? '/images/tournament_86.png'
                                : tournament.id === 85
                                ? '/images/tournament_85.png'
                                : '/images/tournament-logo.png'
                        }
                    ></img>
                </div>
            ) : (
                <></>
            )}
            <div className="w-full mt-2 flex flex-col items-center justify-start">
                <div className="w-full flex flex-col max-w-6xl">
                    <div className="bg-[#4e4e4e] subheading-one sm:heading-two text-center flex flex-row text-white justify-left w-full items-center justify-center py-2 px-2">
                        {tournament?.kind !== TournamentDetail.kind.END_OF_SEASON ? `${tournament?.name} - ${displayTitle()}` : displayTitle()}
                        {tournamentStatus === Status.LIVE && <span className="h-2 w-2 ml-4 rounded-full bg-assist-green animate-ping"></span>}
                    </div>
                    <div className="bg-[#3e3e3e] border-2 border-[#4e4e4e] flex sm:flex-col gap-4 sm:gap-8 flex-col text-black justify-left w-full items-center justify-center py-6 px-5">
                        {(tournamentStatus === Status.FULL || tournamentStatus === Status.OPEN) && remainingDayTime > 0 && (
                            <div className="countdown flex flex-col text-white">
                                <div className="mb-3">
                                    <span className="subheading-one text-assist-green"> Tournament begins in </span>
                                </div>
                                <div className="flex flex-row">
                                    <div className="container-day">
                                        <h3 className="day heading-two sm:heading-one mb-2">{countdownTime?.countdownDays || 0}</h3>
                                        <h3 className="subheading-two">Days</h3>
                                    </div>
                                    <div className="container-hour ml-5">
                                        <h3 className="hour heading-two sm:heading-one mb-2">{countdownTime?.countdownHours || 0}</h3>
                                        <h3 className="subheading-two">Hours</h3>
                                    </div>
                                    <div className="container-minute ml-5">
                                        <h3 className="minute heading-two sm:heading-one mb-2">{countdownTime?.countdownMinutes || 0}</h3>
                                        <h3 className="subheading-two">Minutes</h3>
                                    </div>
                                    <div className="container-second ml-5">
                                        <h3 className="second heading-two sm:heading-one mb-2">{countdownTime?.countdownSeconds || 0}</h3>
                                        <h3 className="subheading-two">Seconds</h3>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-row text-center gap-2 justify-around w-full">
                            <div className="text-center text-white">
                                <span className="subheading-one text-assist-green"> Payout </span>
                                <h1 className="subheading-one sm:heading-two text-white">{getPrice(tournament?.payout)}</h1>
                            </div>
                            <div className="text-center text-white">
                                <span className="subheading-one text-assist-green"> Pool Size </span>
                                <h1 className="subheading-one sm:heading-two text-white">
                                    {!isNaN(Math.pow(2, roundAmount)) ? Math.pow(2, roundAmount) : 'No'} Teams
                                </h1>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="text-center text-white">
                                <div className="subheading-one text-assist-green mb-4"> Payout Breakdown </div>
                                <div className="flex flex-col">
                                    {payoutList.slice(0, 3).map((payout) => (
                                        <h1 className="subheading-one text-white">
                                            {payout.position} <span className="text-assist-green"> {getPrice(payout.amount)} </span>
                                        </h1>
                                    ))}
                                    {payoutList.length > 2 && (
                                        <span
                                            className="text-white font-medium text-xs underline cursor-pointer"
                                            onClick={() => setOpenPayoutModal(true)}
                                        >
                                            View all
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PayoutModal open={openPayoutModal} setOpen={(e) => setOpenPayoutModal(e)} payoutList={payoutList} />
        </div>
    );
};

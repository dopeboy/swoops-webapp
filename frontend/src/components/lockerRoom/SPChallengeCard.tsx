import classNames from 'classnames';
import { addDays, addWeeks, differenceInMilliseconds, startOfDay, startOfWeek } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { useEffect, useState } from 'react';
import { SPBarLockerRoom } from '../common/SPBarLockerRoom';
import { SPPrize } from '../common/SPPrize';

interface SPChallengeCardProps {
    challenge: any;
    className?: any;
    dropdownOpen: boolean;
}
export const SPChallengeCard: React.FC<SPChallengeCardProps> = ({ challenge, className, dropdownOpen }) => {
    const [dailyExpiration, setDailyExpiration] = useState<string>('');
    const [weeklyExpiration, setWeeklyExpiration] = useState<string>('');

    const getDailyExpirationDate = () => {
        const timeZone = 'America/New_York';
        const now = utcToZonedTime(new Date(), timeZone);
        const final = addDays(startOfDay(now), 1);

        const diff = differenceInMilliseconds(final, now);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const hoursString = String(hours).padStart(2, '0');
        const minutesString = String(minutes).padStart(2, '0');
        const secondsString = String(seconds).padStart(2, '0');

        setDailyExpiration(`${hoursString}:${minutesString}:${secondsString}`);
    };

    const getWeeklyExpirationDate = () => {
        const timeZone = 'America/New_York';

        const now = utcToZonedTime(new Date(), timeZone);
        const final = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);

        const diff = differenceInMilliseconds(final, now);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const hoursString = String(hours).padStart(2, '0');
        const minutesString = String(minutes).padStart(2, '0');
        const secondsString = String(seconds).padStart(2, '0');
        if (days > 0) {
            setWeeklyExpiration(`${days} day${days > 1 ? 's' : ''} left`);
        } else {
            setWeeklyExpiration(`${hoursString}:${minutesString}:${secondsString}`);
        }
    };

    const getLevelFromChallengeType = (challengeType) => {
        switch (challengeType) {
            case 'DAILY':
                return 3;
            case 'WEEKLY':
                return 11;
            case 'BI-SEASONAL':
            case 'TRAINING':
                return 18;
            case 'SEASONAL':
            case 'ROTATING':
                return 21;
        }
    };

    const getColor = (level: number): string => {
        if (level >= 0 && level <= 3) {
            return '#EAEBF8';
        } else if (level >= 4 && level <= 11) {
            return '#EFD4F1';
        } else if (level >= 12 && level <= 18) {
            return '#FCDFDD';
        } else if (level >= 19 && level <= 22) {
            return '#F1EFD4';
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            getDailyExpirationDate();
            getWeeklyExpirationDate();
        }, 500);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const getExpiration = () => {
        return challenge.challenge_type === 'DAILY' ? dailyExpiration : challenge.challenge_type === 'TRAINING' ? 'NO LIMIT' : weeklyExpiration;
    };
    return (
        <div
            className={classNames('max-w-[375px] cursor-default flex flex-col w-full bg-white/16 rounded-lg', className || 'h-fit', {
                hidden: !dropdownOpen,
                block: dropdownOpen,
            })}
        >
            {/* Card header */}
            <div className="flex flex-col items-start justify-start w-full px-3 py-2">
                {/* Title */}
                <h1 className="heading-three text-white">{challenge.title}</h1>
                {/* Division */}
                <div className="flex flex-row items-center justify-between w-full mt-3">
                    <div
                        style={{ backgroundColor: `${getColor(getLevelFromChallengeType(challenge.challenge_type))}` }}
                        className="px-3 py-1 rounded-md"
                    >
                        <h2 className="subheading-three text-black !opacity-100">{challenge.challenge_type}</h2>
                    </div>
                    <div
                        className={classNames('rounded-full px-2.5 pb-1 pt-1.5', {
                            'bg-assist-green': challenge.challenge_type !== 'ROTATING',
                            'bg-[#F0CA00]': challenge.challenge_type === 'ROTATING',
                        })}
                    >
                        <h2 className="detail-one text-black">{getExpiration()}</h2>
                    </div>
                </div>
            </div>
            <div className="flex flex-row items-center justify-between h-full">
                <div className="flex flex-row items-center justify-center mr-3 sm:mr-5 w-full max-w-[265px] sm:w-fit sm:max-w-[375px]">
                    <div className="h-[70px] relative flex flex-row items-center justify-end max-w-[265px] sm:max-w-[375px] w-full">
                        {/* Experience bar */}
                        <SPBarLockerRoom
                            level={getLevelFromChallengeType(challenge.challenge_type)}
                            isMaxLevel={challenge.current >= challenge.goal}
                            currentSP={challenge.current}
                            nextLevelSP={challenge.goal}
                            progress={((challenge.current / challenge.goal) * 100).toFixed(0)}
                        />
                        <div className="absolute -right-11 z-30">
                            <SPPrize challengeType={challenge.challenge_type} spReward={challenge.sp_reward} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

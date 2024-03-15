import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { SPChallengeCard } from './SPChallengeCard';

interface ChallengeListProps {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    openChallengeDropdown: boolean;
    userOwnsAnOffchainPlayer: boolean;
    challenges: any;
}
export const ChallengeList: React.FC<ChallengeListProps> = ({ userOwnsAnOffchainPlayer, setOpen, openChallengeDropdown, challenges }) => {
    const getCompletedChallengesAmount = () => {
        return challenges.filter((challenge) => challenge.current >= challenge.goal).length;
    };

    const getTotalChallenges = () => {
        let total = challenges.length;
        if (!userOwnsAnOffchainPlayer && !challenges.some((challenge) => challenge.challenge_type === 'TRAINING')) {
            total++;
        }
        return total;
    };

    return (
        <div
            className="flex flex-col mb-6 items-start justify-center border border-white/16 rounded-lg py-2 px-2 md:px-4 md:py-3 max-w-7xl w-full h-full"
            data-tut="challenge-progress"
        >
            <div
                className={classNames('flex flex-col w-full', {
                    'gap-2 md:gap-4': openChallengeDropdown,
                    'gap-0': !openChallengeDropdown,
                })}
            >
                <div
                    onClick={() => setOpen(!openChallengeDropdown)}
                    className="px-2 py-2 w-full hover:bg-white/16 cursor-pointer rounded-lg collapse-title flex-nowrap flex flex-row items-center gap-3 md:gap-4"
                >
                    <h1 className="w-fit whitespace-nowrap uppercase subheading-one md:heading-two text-white">Challenges</h1>
                    <div className="flex flex-row items-center justify-start gap-4">
                        <span className={classNames('subheading-two md:heading-three text-white/64')}>
                            {getCompletedChallengesAmount()} / {getTotalChallenges()}
                        </span>
                        {openChallengeDropdown ? (
                            <ChevronDownIcon className="h-3 w-3 text-white" />
                        ) : (
                            <ChevronUpIcon className="h-3 w-3 text-white" />
                        )}
                    </div>
                </div>
                <div
                    className={classNames('collapse-content lg:max-h-[350px] flex flex-col sm:grid lg:grid-cols-3', {
                        'h-full block gap-y-3 sm:gap-y-2 gap-x-0 sm:gap-x-2 md:gap-4': openChallengeDropdown,
                        'h-0 hidden gap-0': !openChallengeDropdown,
                    })}
                >
                    {challenges
                        ?.filter((challenge) => !(challenge.challenge_type === 'TRAINING' && !userOwnsAnOffchainPlayer))
                        ?.map((challenge, index) => {
                            return <SPChallengeCard key={index} challenge={challenge} dropdownOpen={openChallengeDropdown} />;
                        })}
                </div>
            </div>
        </div>
    );
};

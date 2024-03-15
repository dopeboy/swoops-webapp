import React, { ReactElement } from 'react';
import PlayerCard from 'src/components/gm/swoopsGm/PlayerCard';
import PlaceholderPlayerCard from 'src/components/gm/swoopsGm/PlaceholderPlayerCard';
import DollarIcon from 'src/components/gm/swoopsGm/DollarIcon';
// import { ExclamationCircleIcon } from '@heroicons/react/outline';
import { NBAPlayerStats } from 'src/lib/gm/api';
import classnames from 'classnames';
import config from 'tailwind.config';
import useMediaQuery from 'src/hooks/gm/useMediaQuery';

interface IProps {
    title: string;
    budget?: number;
    errorBudget?: boolean;
    salaryCap: number;
    players: NBAPlayerStats[];
    yourLineup?: boolean;
    handleRemoveLineup?: (id, idx) => void;
    handleSubmitLineup?: () => void;
    buttonDisabled?: boolean;
}

const Team = (props: IProps): ReactElement => {
    const isDesktop = useMediaQuery('md');

    const { title, budget, errorBudget, salaryCap, players, yourLineup, handleRemoveLineup, handleSubmitLineup, buttonDisabled } = props;

    const playersLength = players.filter((player) => player.type !== 'placeholder').length

    const renderLineup = (players) => {
        return players.slice(0, 5).map((player, idx) => {
            if (player.type === 'placeholder') {
                return <PlaceholderPlayerCard key={idx} position={player.position} imageUrl={player.image_url} />;
            }
            return (
                <PlayerCard
                    key={player.id}
                    name={player.full_name}
                    position={player.position}
                    firstName={player.first_name}
                    lastName={player.last_name}
                    imageUrl={player.image_url}
                    price={player.price}
                    yourLineup={yourLineup}
                    handleRemove={() => {
                        handleRemoveLineup(player.id, idx);
                    }}
                    errorBudget={errorBudget}
                />
            );
        });
    };

    return (
        <div
            className={classnames('border-2 border-off-black rounded-lg w-[calc(50%-14px)] md:w-[calc(50%-42px)] py-4 px-2 md:py-8 md:px-8', {
                'border-off-black': !errorBudget && playersLength !== 5,
                'border-assist-green': !errorBudget && playersLength === 5 && yourLineup,
                'border-defeat': errorBudget && playersLength !== 5 && yourLineup,
            })}
        >
            <div className="text-white space-y-4 md:space-y-8">
                <div
                    className={classnames('flex flex-col', {
                        'items-end': yourLineup,
                    })}
                >
                    <div
                        className={classnames(
                            'text-[12px] leading-6 font-medium font-header uppercase md:heading-three truncate md:mb-4 w-full truncate',
                            {
                                'text-right': yourLineup,
                                'text-left': !yourLineup,
                            }
                        )}
                    >
                        {title}
                    </div>
                    <div className="flex items-center">
                        <div
                            className={classnames(
                                'normal-case md:uppercase text-[12px] md:text-base leading-6 font-medium font-display md:font-header md:uppercase mr-1.5 md:mr-2.5',
                                {
                                    'text-defeat': errorBudget && yourLineup,
                                    'text-white': !errorBudget,
                                }
                            )}
                        >
                            Salary cap:
                        </div>
                        {yourLineup ? (
                            <span
                                className={classnames('rounded p-1 flex items-center w-fit gap-x-1 md:py-1.5 md:px-3', {
                                    'bg-assist-green/32': !errorBudget,
                                    'bg-defeat-red': errorBudget,
                                })}
                            >
                                <DollarIcon color={config.theme.extend.colors.white} height={isDesktop ? 24 : 12} width={isDesktop ? 24 : 12} />
                                <span className="text-sm font-medium font-display md:heading-three leading-none">{`${budget} / ${salaryCap}`}</span>
                            </span>
                        ) : (
                            <span className={classnames('rounded p-1 flex items-center w-fit gap-x-1 md:py-1.5 md:px-3 bg-off-black')}>
                                <DollarIcon color={config.theme.extend.colors.white} height={isDesktop ? 24 : 12} width={isDesktop ? 24 : 12} />
                                <span className="text-sm font-medium font-display md:heading-three leading-none">{salaryCap}</span>
                            </span>
                        )}
                    </div>
                    {errorBudget && (
                        <div
                            className={classnames('flex items-center mt-1 md:mt-1.5', {
                                invisible: !yourLineup,
                            })}
                        >
                            {/* <ExclamationCircleIcon className="w-4 h-4 md:w-6 md:h-6 text-defeat" /> */}
                            <p className="ml-1 md:ml-2 text-defeat text-sm md:text-base leading-6 font-bold font-display">
                                Reduce your lineup’s salary.
                            </p>
                        </div>
                    )}
                </div>
                <div className="space-y-2 md:space-y-4">{renderLineup(players)}</div>
                {yourLineup && (
                    <button
                        onClick={handleSubmitLineup}
                        disabled={buttonDisabled}
                        className={classnames('text-black hidden md:block w-full', {
                            'btn-rounded-grey': buttonDisabled,
                            'btn-rounded-green ': !buttonDisabled,
                        })}
                    >
                        Submit Lineup
                    </button>
                )}
            </div>
        </div>
    );
};

export default Team;

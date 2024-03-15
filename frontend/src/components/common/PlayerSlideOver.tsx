import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReadonlyPlayer } from 'src/services/PlayerService';
import Button from './button/Button';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerAttribute } from './PlayerAttribute';
import { BlackAndWhiteButton } from '../BlackAndWhiteButton';
import { StarRating } from './StarRating';
import { PlayerStat } from './PlayerStat';
import { displayPlayerStat, getSortedPositions } from 'src/lib/utils';
import { playerStatGrid } from 'src/lib/constants';

const attributes = [
    { key: 'three_pt_rating', name: '3PT' },
    { key: 'interior_2pt_rating', name: '2PT-INT' },
    { key: 'midrange_2pt_rating', name: '2PT-MID' },
    { key: 'ft_rating', name: 'FT' },
    { key: 'drb_rating', name: 'DREB' },
    { key: 'orb_rating', name: 'OREB' },
    { key: 'ast_rating', name: 'PASS' },
    { key: 'interior_defense_rating', name: 'IDEF' },
    { key: 'perimeter_defense_rating', name: 'PDEF' },
    { key: 'physicality_rating', name: 'PHY' },
    { key: 'longevity_rating', name: 'LONG' },
    { key: 'hustle_rating', name: 'HSTL' },
    { key: 'bball_iq_rating', name: 'IQ' },
    { key: 'leadership_rating', name: 'LDRS' },
    { key: 'coachability_rating', name: 'COACH' },
];

interface PlayerSlideOverProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    selectedPlayer: ReadonlyPlayer;
    onClick?: any;
    actionText?: string;
    isAddedToRoster?: boolean;
}
export const PlayerSlideOver: React.FC<PlayerSlideOverProps> = ({ actionText, onClick, isAddedToRoster, open, setOpen, selectedPlayer }) => {
    const isTopAttribute = (key: string): boolean => {
        return !!selectedPlayer?.top_attributes?.some((attribute) => attribute.includes(key));
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog open={open} onClose={setOpen} as="div" className="fixed inset-0 overflow-hidden z-70">
                <div className="absolute inset-0 overflow-hidden">
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="hidden sm:flex fixed inset-0 bg-black bg-opacity-80 transition-opacity" />
                    </Transition.Child>
                    <div className="fixed inset-y-0 right-0 sm:pl-10 sm:max-w-full flex">
                        <Dialog.Panel className="w-screen sm:max-w-md sm:border-l sm:border-off-black">
                            <div className="h-full flex flex-col bg-black shadow-xl overflow-hidden">
                                <div className="flex-1 py-6 overflow-y-auto px-6">
                                    <div className="flex items-start justify-between">
                                        <Dialog.Title className="heading-three text-white">
                                            {selectedPlayer?.full_name ?? 'Player Details'}
                                        </Dialog.Title>
                                        <div className="ml-3 h-7 flex items-center">
                                            <button
                                                type="button"
                                                className="bg-black rounded-md text-gray-400 hover:text-off-black focus:outline-none focus:ring-2 focus:ring-off-black"
                                                onClick={() => setOpen(false)}
                                            >
                                                <span className="sr-only">Close panel</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-1 flex flex-row w-full items-center justify-start gap-3 divide-x divide divide-white">
                                        <StarRating rating={selectedPlayer?.star_rating} />
                                        <span className="flex flex-row items-start whitespace-nowrap pl-3 subheading-two text-white gap-1">
                                            {getSortedPositions(selectedPlayer?.positions || []).map((position: string, index: number) => (
                                                <span key={position + index}>
                                                    {position}
                                                    {selectedPlayer?.positions.length > 0 && index !== selectedPlayer?.positions.length - 1
                                                        ? ' /'
                                                        : ''}
                                                </span>
                                            ))}
                                        </span>
                                        {selectedPlayer?.age !== null && selectedPlayer?.age !== undefined && (
                                            <span className="subheading-two text-white flex flex-row pl-3 gap-2 items-center">
                                                <span>SEASON</span>
                                                <span>{selectedPlayer.age}</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex-shrink-0 w-full">
                                            <PlayerAvatar
                                                playerToken={selectedPlayer?.token}
                                                background={true}
                                                width={320}
                                                height={320}
                                                className={'w-full rounded-t-100'}
                                            />
                                        </div>
                                        <div className="mt-4 flex flex-col items-start gap-2 w-full">
                                            <span className="heading-three text-white">Attributes</span>
                                            <div className="p-4 rounded-2xl border border-assist-green flex flex-col items-center w-full">
                                                <div className="grid grid-cols-3 gap-3 w-full">
                                                    {attributes.map((attribute, index) => (
                                                        <PlayerAttribute
                                                            key={index + '_' + attribute.key}
                                                            attributeName={attribute.name}
                                                            attributeValue={selectedPlayer?.[attribute.key]}
                                                            isTopAttribute={isTopAttribute(attribute.key)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex flex-col items-start gap-2 w-full">
                                            <span className="heading-three text-white">Stats</span>
                                            <div className="grid grid-cols-3 gap-3 w-full">
                                                {playerStatGrid.map((stat) => (
                                                    <PlayerStat
                                                        key={stat.title}
                                                        statName={stat.title}
                                                        statValue={displayPlayerStat(stat.value, selectedPlayer?.current_season_stats)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="flex-shrink-0 flex flex-row items-center w-full gap-3 justify-center px-6 py-4"
                                    data-tut="add-lineup-detail"
                                >
                                    {!isAddedToRoster ? (
                                        <div data-tut="add-lineup-detail-previo">
                                            <Button
                                                onClick={() => {
                                                    onClick(selectedPlayer, isAddedToRoster);
                                                    setOpen(false);
                                                }}
                                                className="subheading-one whitespace-nowrap"
                                            >
                                                {actionText}
                                            </Button>
                                        </div>
                                    ) : (
                                        <BlackAndWhiteButton
                                            text={actionText}
                                            className="w-full"
                                            onClick={() => {
                                                onClick(selectedPlayer, isAddedToRoster);
                                                setOpen(false);
                                            }}
                                        />
                                    )}
                                    {!isAddedToRoster ? (
                                        <BlackAndWhiteButton
                                            text="Close"
                                            onClick={() => {
                                                setOpen(false);
                                            }}
                                        />
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                setOpen(false);
                                            }}
                                            className="subheading-one"
                                        >
                                            Close
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

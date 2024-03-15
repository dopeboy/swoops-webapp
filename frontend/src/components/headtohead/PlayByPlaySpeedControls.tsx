import { PauseIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { trackEvent } from 'src/lib/tracking';

interface PlayByPlaySpeedControlsProps {
    isPaused: boolean;
    setIsPaused: (isPaused: boolean) => void;
    speed: number;
    disabled: boolean;
    setSpeed: (speed: number) => void;
}
export const PlayByPlaySpeedControls: React.FC<PlayByPlaySpeedControlsProps> = ({ disabled, isPaused, setIsPaused, speed, setSpeed }) => {
    const [controls, setControls] = useState([]);

    useEffect(() => {
        setControls([
            {
                label: '',
                icon: isPaused ? PlayIcon : PauseIcon,
                onClick: () => {
                    trackEvent('Head-to-head page - Pause play by play');
                    setIsPaused(!isPaused);
                },
            },
            {
                label: '1x',
                selected: speed === 2000,
                onClick: () => {
                    trackEvent('Head-to-head page - Selected 1x speed');
                    setSpeed(2000);
                },
            },
            {
                label: '2x',
                selected: speed === 1000,
                onClick: () => {
                    trackEvent('Head-to-head page - Selected 2x speed');
                    setSpeed(1000);
                },
            },
            {
                label: '3x',
                selected: speed === 500,
                onClick: () => {
                    trackEvent('Head-to-head page - Selected 3x speed');
                    setSpeed(500);
                },
            },
        ]);
    }, [isPaused, speed]);

    return (
        <div className="w-full" data-tut="speed-control">
            <dl className="my-2 w-full grid grid-cols-4 rounded-lg overflow-hidden shadow md:grid-cols-4 md:divide-y-0 md:divide-x">
                {controls.map((item, index) => (
                    <button
                        key={index + '_' + item.label}
                        onClick={(e) => {
                            if (disabled) {
                                e.stopPropagation();
                                e.preventDefault();
                                return;
                            }
                            item.onClick();
                        }}
                        className="flex flex-col items-center subheading-two font-normal text-black bg-white hover:bg-white/90 justify-center p-0.5 md:p-1.5"
                    >
                        <div
                            className={classNames(
                                'flex flex-col items-center justify-center w-full h-full border-2 border-transparent py-2 rounded-lg bg-transparent',
                                {
                                    'border-black': item.selected,
                                }
                            )}
                        >
                            {item.label ? item.label : <item.icon className="text-black h-5 w-5" />}
                        </div>
                    </button>
                ))}
            </dl>
        </div>
    );
};

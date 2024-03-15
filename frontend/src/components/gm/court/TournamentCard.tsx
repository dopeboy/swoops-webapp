import React from 'react';
import classnames from 'classnames';
import BasketballIcon from 'src/components/gm/court/BasketballIcon';
import UnionIcon from 'src/components/gm/court/UnionIcon';
import config from 'tailwind.config';

interface IProps {
    type: 'small' | 'large';
    prize: string;
    time: string;
    description: string;
    image_url: string;
    players: any[];
}

const TournamentCard = (props: IProps) => {
    const { type, prize, description, time, image_url, players } = props;

    const renderBody = (type) => {
        if (type === 'small') {
            return players.map((player, idx) => (
                <div
                    key={idx}
                    className={classnames('flex h-24  pl-3 pr-4', {
                        'border-b border-solid border-black/8': idx !== players.length - 1,
                    })}
                >
                    <div className="shrink-0 flex flex-col justify-end">
                        <img className="h-auto" src={`/images/${player.image_url}`} alt="Player" />
                    </div>
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <div className="text-base font-bold font-display text-black">{player.name}</div>
                            <div className="text-xs font-medium leading-6 text-off-black">{player.score}</div>
                        </div>
                        <div className="flex items-center">
                            {player.live && <div className="h-3 w-3 bg-assist-green rounded-full mr-4" />}
                            <div className="heading-two text-black">{player.title}</div>
                        </div>
                    </div>
                </div>
            ));
        } else if (type === 'large') {
            return (
                <div className="flex flex-col md:max-h-[18rem] flex-wrap">
                    {players.slice(0, 6).map((player, idx) => (
                        <div
                            key={idx}
                            className={classnames('flex h-24  pl-3 pr-4 w-full md:w-1/2 ', {
                                'border-r border-solid border-black/8': idx < 3,
                                'border-b-none md:border-b md:border-solid md:border-black/8':
                                    idx !== players.length - 1 && idx !== players.length / 2 - 1,
                                'border-b border-solid border-black/8 md:border-b-none': idx !== players.length - 1,
                            })}
                        >
                            <div className="shrink-0 flex flex-col justify-end">
                                <img className="h-auto" src={`/images/${player.image_url}`} alt="Player" />
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <div>
                                    <div className="text-base font-bold font-display text-black">{player.name}</div>
                                    <div className="text-xs font-medium leading-6 text-off-black">{player.score}</div>
                                </div>
                                <div className="text-right">
                                    <div className="heading-two text-black">{player.title}</div>
                                    <div className="text-xs font-medium leading-6 text-off-black ">{player.description}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    };

    return (
        <div className="relative flex flex-col min-w-0 break-words bg-white bg-clip-border rounded-lg">
            <div className="rounded-tl-lg rounded-tr-lg bg-white border-b border-solid border-black/8 py-4 px-4">
                <div className="flex flex-row items-start justify-between">
                    <div className="flex items-center">
                        <div className="shrink-0">
                            {image_url === 'Basketball' ? (
                                <BasketballIcon color={config.theme.extend.colors.black} />
                            ) : image_url === 'Bracket' ? (
                                <UnionIcon color={config.theme.extend.colors.black} />
                            ) : null}
                        </div>
                        <div className="pl-5">
                            <h2 className="heading-three text-black">{prize}</h2>
                            <p className="text-xs font-medium leading-6 text-off-black">{description}</p>
                        </div>
                    </div>
                    <div>
                        <span
                            className={classnames('badge ', {
                                'bg-assist-green text-black': time === '00:45',
                                'bg-black text-white': time === 'Final' || time === 'Finished',
                            })}
                        >
                            {time}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex-auto">{renderBody(type)}</div>
        </div>
    );
};

export default TournamentCard;

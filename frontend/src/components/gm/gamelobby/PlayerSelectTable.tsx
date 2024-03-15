import classnames from 'classnames';
import { ReactElement, useState } from 'react';

const fakePlayer = (name) => ({
    uuid: Math.floor(Math.random() * 1000000),
    name,
    position: 'Point Guard',
    ppg: 26.4,
    rpg: 11.1,
    abg: 8.7,
    wl: '12-8',
    plusMinus: 89,
});

const PlayerSelectRow = (props): ReactElement => {
    const { player, addPlayerToSelection } = props;
    const { name, position, ppg, rpg, abg, wl, plusMinus } = player;
    const playerImage = '/images/AvatarPink.png';
    const [isDisabled, setDisabled] = useState(false);
    return (
        <div className="flex flex-row text-white text-display p-4 h-24 border border-white/16 max-w-7xl m-auto">
            <img className="" src={playerImage} alt="Player image" />
            <div className="text-lg  text-center">{name}</div>
            <div className="pl-3 pr-10 ml-6">{position}</div>
            <div className="pl-3 ml-6 pr-10">{ppg}</div>
            <div className="pl-3 ml-6 pr-10">{rpg}</div>
            <div className="pl-3 ml-6 pr-10">{abg}</div>
            <div className="pl-3 ml-6 pr-10">{wl}</div>
            <div className="pl-3 ml-6 pr-10">{plusMinus}</div>
            <button
                className={classnames('pl-3 py-4 ml-6 btn', { 'bg-white/16': isDisabled, 'bg-white': !isDisabled })}
                disabled={isDisabled}
                onClick={() => {
                    addPlayerToSelection(player);
                    setDisabled(true);
                }}
            >
                Add to lineup
            </button>
        </div>
    );
};

const PlayerSelectTable = (props): ReactElement => {
    const fakePlayers = [
        fakePlayer('Donald Jumpshot'),
        fakePlayer('Passtherock Obama'),
        fakePlayer('Benjamin Danklin'),
        fakePlayer('Andrew Inthecan'),
        fakePlayer('Josh Dunkberg'),
    ];
    const { addPlayerToSelection } = props;
    return (
        <div className="pt-10">
            {fakePlayers.map((player) => (
                <PlayerSelectRow addPlayerToSelection={addPlayerToSelection} player={player} />
            ))}
        </div>
    );
};

export default PlayerSelectTable;

import classNames from 'classnames';

interface PlayerStatProps {
    statName: string;
    statValue: string;
}
export const PlayerStat: React.FC<PlayerStatProps> = ({ statName, statValue }) => {
    return (
        <div className="col-span-1 flex flex-col gap-0.5 items-center w-full rounded-lg border-white/16 bg-off-black/30 py-2 border">
            <span className="subheading-three text-white uppercase">{statName}</span>
            <span
                className={classNames('uppercase text-white', {
                    'heading-three': statName !== 'W/L',
                    'subheading-two': statName === 'W/L',
                })}
            >
                {statValue || '-'}
            </span>
        </div>
    );
};

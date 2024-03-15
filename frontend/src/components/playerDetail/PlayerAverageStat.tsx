interface PlayerAverageStatProps {
    statName: string;
    statValue: string;
    fontClassName?: string;
}
export const PlayerAverageStat: React.FC<PlayerAverageStatProps> = ({ statName, statValue, fontClassName }) => {
    return (
        <div className="col-span-1 flex flex-col gap-0.5 items-center w-full rounded-lg py-2">
            <span className={`uppercase text-white ${fontClassName || 'subheading-two sm:heading-three lg:heading-two'}`}>{statValue || '-'}</span>
            <span className="detail-one sm:subheading-two text-assist-green uppercase">{statName}</span>
        </div>
    );
};

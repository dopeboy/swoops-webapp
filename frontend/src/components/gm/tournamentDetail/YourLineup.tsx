import { ReactElement } from 'react';
import LineupCard from 'src/components/gm/tournamentDetail/LineupCard';

interface IProps {
    lineups: any[];
    showButton?: boolean;
}

const YourLineup = (props: IProps): ReactElement => {
    const { lineups, showButton } = props;

    return (
        <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
                <div className="heading-three text-white">Your Lineup</div>
                {showButton && <button className="btn bg-white text-black">Edit Lineup</button>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {lineups.map((lineup, idx) => (
                    <LineupCard key={idx} imageUrl={lineup.imageUrl} name={lineup.name} role={lineup.role} type={lineup.type} />
                ))}
            </div>
        </div>
    );
};

export default YourLineup;

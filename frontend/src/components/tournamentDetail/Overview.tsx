import { ReactElement, useState } from 'react';
import ReadyToPlayCard from 'src/components/gm/tournamentDetail/ReadyToPlayCard';
import YourLineup from 'src/components/gm/tournamentDetail/YourLineup';
import PrizePoolCard from 'src/components/gm/tournamentDetail/PrizePoolCard';
import WonCard from 'src/components/gm/tournamentDetail/WonCard';

interface IProps {
    tournaments: any[];
    lineups: any[];
    started: boolean;
}

const Overview = (props: IProps): ReactElement => {
    const { tournaments, lineups, started } = props;

    const [joined, setJoined] = useState<boolean>(false);
    const [won, setWon] = useState<boolean>(true);

    const handleJoin = () => {
        setJoined(true);
    };

    const renderContent = (joined: boolean): ReactElement => {
        if (joined) {
            return <YourLineup showButton={!started} lineups={lineups} />;
        } else {
            return (
                <ReadyToPlayCard
                    title="Ready to Play?"
                    summary="Assemble your lineup and win big."
                    button="Join Tournament"
                    handleJoin={handleJoin}
                    size="medium"
                    mb
                />
            );
        }
    };

    return (
        <div className="flex flex-col bg-black py-12">
            <div className="container-md">
                {won && (
                    <WonCard
                        title="You won $500.00!"
                        summary="Nice, you finished in the semifinals. Ready to win it all next time?"
                        button="Play Again"
                        size="medium"
                        mb="md:mb-16"
                    />
                )}
                {renderContent(joined)}
                <div className="flex flex-col md:flex-row items-start gap-y-8">
                    {tournaments.map((tournament, idx) => (
                        <PrizePoolCard
                            key={idx}
                            title={tournament.title}
                            summary={tournament.summary}
                            tournaments={tournament.tournaments}
                            mr={idx % 2 === 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Overview;

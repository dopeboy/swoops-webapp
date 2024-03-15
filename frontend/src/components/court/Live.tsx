import { ReactElement } from 'react';
import TournamentCard from 'src/components/court/TournamentCard';

const Live = (props): ReactElement => {
    const { tournamentsSmall, tournamentsLarge } = props;

    return (
        <div className="flex flex-col bg-black  py-12">
            <div className="container-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {tournamentsSmall.map((tournament, idx) => (
                        <TournamentCard
                            type="small"
                            key={idx}
                            prize={tournament.prize}
                            description={tournament.description}
                            time={tournament.time}
                            image_url={tournament.image_url}
                            players={tournament.players}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-8">
                    {tournamentsLarge.map((tournament, idx) => (
                        <TournamentCard
                            type="large"
                            key={idx}
                            prize={tournament.prize}
                            description={tournament.description}
                            time={tournament.time}
                            image_url={tournament.image_url}
                            players={tournament.players}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Live;

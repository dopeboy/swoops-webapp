import React, { ReactElement } from 'react';
import MatchupTable from 'src/components/gm/swoopsGm/MatchupTable';

interface IProps {
    players: any;
}

const Matchup = (props: IProps): ReactElement => {
    const { players } = props;

    return (
        <div className="flex flex-col md:flex-row pb-12 space-y-8 md:space-y-0">
            <MatchupTable title="Your Dream Team Lineup" players={players} />
            <MatchupTable title="The team to beat Lineup" players={players} right />
        </div>
    );
};

export default Matchup;

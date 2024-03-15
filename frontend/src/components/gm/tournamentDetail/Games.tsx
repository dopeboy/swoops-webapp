import { useState, ReactElement } from 'react';
import StartedBracket from 'src/components/gm/tournamentDetail/StartedBracket';
import ResultBracket from 'src/components/gm/tournamentDetail/ResultBracket';

interface IProps {
    matches: any[];
}

const Games = (props: IProps): ReactElement => {
    const { matches } = props;

    const [started, setStarted] = useState<boolean>(false);

    return <div className="flex flex-col bg-black">{started ? <StartedBracket matches={matches} /> : <ResultBracket matches={matches} />}</div>;
};

export default Games;

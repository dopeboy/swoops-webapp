import { useState, ReactElement } from 'react';
import StartedBracket from 'src/components/tournamentDetail/StartedBracket';
import ResultBracket from 'src/components/tournamentDetail/ResultBracket';

interface IProps {
    matches: any[];
}

const Games = (props: IProps): ReactElement => {
    const { matches } = props;

    const [started] = useState<boolean>(false);

    return <div className="flex flex-col bg-black">{started ? <StartedBracket matches={matches} /> : <ResultBracket matches={matches} />}</div>;
};

export default Games;

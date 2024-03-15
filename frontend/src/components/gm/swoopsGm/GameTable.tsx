import { ReactElement } from 'react';
import GameBody from 'src/components/gm/swoopsGm/GameBody';

interface IProps {
    games: any;
}

const GameTable = (props: IProps): ReactElement => {
    const { games } = props;

    return (
        <div className="align-middle inline-block overflow-x-auto w-full rounded-lg border-t border-r border-l border-solid border-white/16">
            <table className="min-w-full text-white table-fixed">
                <thead className="bg-black border-b border-solid border-white/16 w-full">
                    <tr>
                        <th
                            align="left"
                            scope="col"
                            className="px-4 py-3.5 md:px-6 md:py-5 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header"
                        >
                            Date
                        </th>
                        <th
                            align="left"
                            scope="col"
                            className="px-3 py-3.5 md:px-4 md:py-5 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header"
                        >
                            Challenge
                        </th>
                        <th
                            align="left"
                            scope="col"
                            className="px-3 py-3.5 md:px-4 md:py-5 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-header"
                        >
                            Result
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-black">
                    {games && games.map((game, idx) => <GameBody key={game.id} game={{ ...game, position: idx + 1 }} />)}
                </tbody>
            </table>
        </div>
    );
};

export default GameTable;

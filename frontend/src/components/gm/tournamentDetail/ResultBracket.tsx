import React, { ReactElement } from 'react';
import BracketCardHorizontal from 'src/components/gm/tournamentDetail/BracketCardHorizontal';

interface IProps {
    matches: any[];
}

const headers = ['First Round', 'Second Round', 'Third Round', 'Second Round', 'First Round'];

const ResultBracket = (props: IProps): ReactElement => {
    const { matches } = props;

    return (
        <div className="relative">
            <div className="overflow-x-auto">
                <div className="py-5">
                    <div className="container-md">
                        <div className="flex">
                            {headers.map((header, idx) => (
                                <div key={idx} className="min-w-[406px] mr-4">
                                    <div className="text-white uppercase text-[12px] font-header">{header}</div>
                                </div>
                            ))}
                            <div className="lg:min-w-[16px] xl:min-w-[90px]" />
                        </div>
                    </div>
                </div>
                <div className="mb-12 mt-8">
                    <div className="px-2 md:px-4 lg:px-8 xl:px-40 w-full ">
                        <div className="flex flex-row  h-full">
                            <div className="flex flex-col">
                                {matches.slice(0, 2).map((match, i) => (
                                    <div className="relative mr-4 min-w-[406px] h-[456px] flex flex-col justify-around" key={i}>
                                        {match.players.map((player, idx) => (
                                            <BracketCardHorizontal key={idx} challenger={player[0]} challenged={player[1]} type={match.type} />
                                        ))}
                                        <div
                                            className="absolute  top-1/2 right-0 w-px h-[226px] bg-white/64 "
                                            style={{ transform: 'translateY(-50%)' }}
                                        />
                                        <div
                                            className="absolute  top-1/2 -right-0 w-[16px] h-px bg-white/64 "
                                            style={{ transform: 'translateX(100%)' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                {matches.slice(0, 1).map((match, i) => (
                                    <div className="relative mr-4 min-w-[406px] h-full flex flex-col justify-around" key={i}>
                                        {match.players.map((player, idx) => (
                                            <BracketCardHorizontal key={idx} challenger={player[0]} challenged={player[1]} type={match.type} />
                                        ))}
                                        <div
                                            className="absolute  top-1/2 -right-0 w-[16px] h-px bg-white/64 "
                                            style={{ transform: 'translateX(100%)' }}
                                        />

                                        <div
                                            className="absolute  top-1/2 right-0 w-px h-[454px] bg-white/64 mb-8"
                                            style={{ transform: 'translateY(-50%)' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                {matches.slice(0, 1).map((match, i) => (
                                    <div className="relative  h-full flex flex-col justify-around" key={i}>
                                        {match.players.slice(0, 1).map((player, idx) => (
                                            <BracketCardHorizontal key={idx} challenger={player[0]} challenged={player[1]} type={match.type} />
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                {matches.slice(0, 1).map((match, i) => (
                                    <div className="relative ml-4 min-w-[406px] h-full flex flex-col justify-around items-end" key={i}>
                                        {match.players.map((player, idx) => (
                                            <BracketCardHorizontal key={idx} challenger={player[0]} challenged={player[1]} type={match.type} right />
                                        ))}
                                        <div
                                            className="absolute  top-1/2 left-0 w-px h-[454px] bg-white/64 mb-8"
                                            style={{ transform: 'translateY(-50%)' }}
                                        />
                                        <div
                                            className="absolute  top-1/2 left-0 w-[16px] h-px bg-white/64 "
                                            style={{ transform: 'translateX(-100%)' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                {matches.slice(0, 2).map((match, i) => (
                                    <div className="relative ml-4 min-w-[406px] h-[454px] flex flex-col justify-around items-end" key={i}>
                                        {match.players.map((player, idx) => (
                                            <BracketCardHorizontal key={idx} challenger={player[0]} challenged={player[1]} type={match.type} right />
                                        ))}
                                        <div
                                            className="absolute  top-1/2 left-0 w-[16px] h-px bg-white/64 "
                                            style={{ transform: 'translateX(-100%)' }}
                                        />

                                        <div
                                            className="absolute  top-1/2 left-0 w-px h-[226px] bg-white/64 "
                                            style={{ transform: 'translateY(-50%)' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute h-px w-full bg-white/16 top-14" />
        </div>
    );
};

export default ResultBracket;

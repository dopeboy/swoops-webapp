import React, { useState, ReactElement } from 'react';
import BracketCard from 'src/components/gm/tournamentDetail/BracketCard';
import RCTabs, { TabPane } from 'rc-tabs';
import styled from 'styled-components';

const Tabs = styled(RCTabs)`
    .rc-tabs-top {
        flex-direction: row !important;
    }
    .rc-tabs-tab-btn {
        padding-bottom: 12px !important;
    }

    .rc-tabs-tab-btn {
        font-size: 12px !important;
        font-weight: 400 !important;
    }
`;

const tabs = [
    {
        path: 'athletes',
        name: 'Round 1',
        disabled: false,
    },
    {
        path: 'games',
        name: 'Round 2',
        disabled: false,
    },
    {
        path: 'games',
        name: 'Round 3',
        disabled: true,
    },
];

interface IProps {
    matches: any[];
}

const StartedBracket = (props: IProps): ReactElement => {
    const { matches } = props;

    const [tab, setTab] = useState<'Round 1' | 'Round 2' | 'Round 3'>('Round 1');

    return (
        <>
            <div className="container-md">
                <div className="pt-4 border-b border-solid border-white/16">
                    <Tabs
                        data-extra="tabs"
                        activeKey={tab}
                        defaultActiveKey={tab}
                        onTabClick={(key) => {
                            setTab(key);
                        }}
                    >
                        {tabs.map((tab) => (
                            <TabPane disabled={tab.disabled} key={tab.name} tab={<div>{tab.name}</div>} />
                        ))}
                    </Tabs>
                </div>
            </div>
            <div className="mb-12 mt-4 w-full box-border px-2 md:px-4 lg:px-8 xl:px-40  overflow-x-auto ">
                <div className="flex flex-row h-full">
                    <div className="flex flex-col">
                        {matches.map((match, i) => (
                            <div className="relative min-w-[1182px] h-[256px] flex flex-col justify-around" key={i}>
                                {match.players.map((player, idx) => (
                                    <BracketCard key={idx} challenger={player[0]} challenged={player[1]} />
                                ))}
                                <div className="absolute  top-1/2 right-0 w-px h-[128px] bg-white/64 " style={{ transform: 'translateY(-50%)' }} />
                                <div className="absolute  top-1/2 -right-0 w-[64px] h-px bg-white/64 " style={{ transform: 'translateX(100%)' }} />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col">
                        {matches.slice(0, 2).map((match, i) => (
                            <div className="relative ml-16 min-w-[1182px] h-1/2 flex flex-col justify-around" key={i}>
                                {match.players.map((player, idx) => (
                                    <BracketCard key={idx} challenger={player[0]} challenged={player[1]} />
                                ))}
                                <div className="absolute  top-1/2 -right-0 w-[64px] h-px bg-white/64 " style={{ transform: 'translateX(100%)' }} />

                                <div
                                    className="absolute  top-1/2 right-0 w-px h-[256px] bg-white/64 mb-8"
                                    style={{ transform: 'translateY(calc(-50%))' }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col">
                        {matches.slice(0, 1).map((match, i) => (
                            <div className="relative ml-16 min-w-[1182px] h-full flex flex-col justify-around" key={i}>
                                {match.players.map((player, idx) => (
                                    <BracketCard key={idx} challenger={player[0]} challenged={player[1]} />
                                ))}
                                <div className="absolute  top-1/2 -right-0 w-[64px] h-px bg-white/64 " style={{ transform: 'translateX(100%)' }} />

                                <div
                                    className="absolute  top-1/2 right-0 w-px h-[512px] bg-white/64 mb-8"
                                    style={{ transform: 'translateY(calc(-50%))' }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col">
                        {matches.slice(0, 1).map((match, i) => (
                            <div className="relative ml-16 min-w-[1182px] h-full flex flex-col justify-around" key={i}>
                                {match.players.slice(0, 1).map((player, idx) => (
                                    <BracketCard key={idx} challenger={player[0]} challenged={player[1]} last />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StartedBracket;

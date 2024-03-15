import classNames from 'classnames';
import { useEffect, useState } from 'react';

interface PlayByPlayDataDisplayProps {
    data: any[];
}
export const PlayByPlayDataDisplay: React.FC<PlayByPlayDataDisplayProps> = ({ data }) => {
    const [fgMade, setFgMade] = useState(0);
    const [fgPercentage, setFgPercentage] = useState(0);
    const [fgAttempted, setFgAttempted] = useState(0);
    const [threePtMade, setThreePtMade] = useState(0);
    const [threePtAttempted, setThreePtAttempted] = useState(0);
    const [threePtPercentage, setThreePtPercentage] = useState(0);
    const [ftMade, setFtMade] = useState(0);
    const [ftAttempted, setFtAttempted] = useState(0);
    const [ftPercentage, setFtPercentage] = useState(0);
    const [turnovers, setTurnovers] = useState(0);
    // const [possessions, setPossessions] = useState(0);
    const [rebounds, setRebounds] = useState(0);
    const [assists, setAssists] = useState(0);

    const [stats, setStats] = useState([]);

    const calculateFgStats = (): void => {
        const made = data.filter((item) => item?.detail?.includes('Made Two')).length;
        const attempted = data.filter((item) => item?.detail?.includes('Two')).length;
        setFgMade(made);
        setFgAttempted(attempted);
        if (attempted > 0) {
            setFgPercentage(Number(Math.round((made / attempted) * 100).toFixed(1)));
        } else {
            setFgPercentage(0);
        }
    };

    const calculateFtStats = (): void => {
        const made = data.filter((item) => item?.detail?.includes('Made Free Throw')).length;
        setFtMade(made);
        const attempted = data.filter((item) => item?.detail?.includes('Free Throw')).length;
        setFtAttempted(made);
        if (attempted > 0) {
            setFtPercentage(Number(Math.round((made / attempted) * 100).toFixed(1)));
        } else {
            setFtPercentage(0);
        }
    };

    const calculateThreePtStats = (): void => {
        const made = data.filter((item) => item?.detail?.includes('Made Three')).length;
        setThreePtMade(made);
        const attempted = data.filter((item) => item?.detail?.includes('Three')).length;
        setThreePtAttempted(attempted);
        if (attempted > 0) {
            setThreePtPercentage(Number(Math.round((made / attempted) * 100).toFixed(1)));
        } else {
            setThreePtPercentage(0);
        }
    };

    const calculateTurnoverStats = (): void => {
        const turnovers = data.filter((item) => item?.detail?.includes('Turnover')).length;
        setTurnovers(turnovers);
    };

    const calculateAssistStats = (): void => {
        const assists = data.filter((item) => item?.detail?.includes('Assist')).length;
        setAssists(assists);
    };

    const calculateReboundStats = (): void => {
        const rebounds = data.filter((item) => item?.detail?.includes('Rebound')).length;
        setRebounds(rebounds);
    };

    const updateStats = (): void => {
        setStats([
            { name: 'Field Goal %', stat: fgMade, previousStat: fgAttempted, change: fgPercentage },
            { name: 'Three Point %', stat: threePtMade, previousStat: threePtAttempted, change: threePtPercentage },
            { name: 'Free Throw %', stat: ftMade, previousStat: ftAttempted, change: ftPercentage },
            { name: 'Turnovers', stat: turnovers, previousStat: 0, change: 0 },
            { name: 'Assists', stat: assists, previousStat: 0, change: 0 },
            { name: 'Rebounds', stat: rebounds, previousStat: 0, change: 0 },
        ]);
    };

    useEffect(() => {
        calculateFgStats();
        calculateFtStats();
        calculateThreePtStats();
        calculateTurnoverStats();
        calculateAssistStats();
        calculateReboundStats();
    }, [data]);

    useEffect(() => {
        updateStats();
    }, [
        fgMade,
        fgAttempted,
        fgPercentage,
        threePtMade,
        threePtAttempted,
        threePtPercentage,
        ftMade,
        ftAttempted,
        ftPercentage,
        turnovers,
        assists,
        rebounds,
    ]);

    return (
        <div className="w-full">
            <dl className="mt-5 mb-1 w-full grid grid-cols-1 rounded-lg bg-off-black overflow-hidden shadow divide-y divide-black md:grid-cols-6 md:divide-y-0 md:divide-x">
                {stats.map((item) => (
                    <div key={item.name} className="px-4 py-5 sm:p-3">
                        <dt className="subheading-two font-normal text-white">{item.name}</dt>
                        <dd className="mt-1 flex detail-one justify-between items-baseline md:block lg:flex">
                            <div className="flex items-baseline text-lg font-semibold text-white">
                                <span className="mr-1">{item.stat > 0 ? item.stat : '-'}</span>
                                {item?.previousStat > 0 && <span className="text-sm font-medium text-white/80"> / {item.previousStat}</span>}
                            </div>
                            {item?.stat > 0 && item?.previousStat > 0 && item?.change > 0 && (
                                <div
                                    className={classNames(
                                        'bg-white text-black inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:-mt-2'
                                    )}
                                >
                                    {item.change + '%'}
                                </div>
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};

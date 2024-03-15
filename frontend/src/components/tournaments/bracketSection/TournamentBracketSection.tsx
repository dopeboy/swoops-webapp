import classNames from 'classnames';
import { TournamentDetail } from 'src/lib/api';
import { TournamentBracketDesktop } from './TournamentBracketDesktop';
import { TournamentBracketMobile } from './TournamentBracketMobile';
import { TournamentDivisionHeader } from '../TournamentDivisionHeader/TournamentGameSectionDivisionHeader';
import { useState, useEffect } from 'react';
interface TournamentGameSectionProps {
    tournament: TournamentDetail;
    shouldDisplay: boolean;
    roundAmount: number;
    round: string | string[];
    id: string | string[];
}

export const TournamentBracketSection: React.FC<TournamentGameSectionProps> = ({ id, roundAmount, round, shouldDisplay, tournament }) => {
    const [revealAll, setRevealAll] = useState<boolean>(false);
    const [showRevealButton, setShowRevealButton] = useState(false);

    useEffect(() => {
        const rounds = tournament?.rounds;
        for (let i = 0; i < rounds?.length; i++) {
            let count = 0;
            for (let j = 0; j < rounds[i]?.series?.length; j++) {
                if (rounds[i].series[j].status === 'FINISHED') {
                    count++;
                }
                if (count > 2) {
                    setShowRevealButton(true);
                }
            }
        }
        setShowRevealButton(false);
    }, [tournament]);

    return (
        <div
            className={classNames('w-full flex flex-col items-center justify-start', {
                hidden: !shouldDisplay,
            })}
        >
            <TournamentDivisionHeader
                id={id}
                showDivisionButton={tournament?.kind === TournamentDetail.kind.END_OF_SEASON}
                roundAmount={roundAmount}
                round={round}
                isBracket={true}
                showRevealButton={showRevealButton}
                setRevealAll={(e) => setRevealAll(e)}
            />
            <TournamentBracketDesktop
                revealAllSeries={revealAll}
                id={id}
                tournament={tournament}
                className={`${round === '8' || round === '4' || round === 'championship' ? 'sm:flex' : 'sm:block'} hidden`}
                round={round}
            />
            <TournamentBracketMobile id={id} tournament={tournament} className="sm:hidden block" round={round} />
        </div>
    );
};

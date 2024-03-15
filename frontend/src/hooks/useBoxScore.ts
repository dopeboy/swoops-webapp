import router from 'next/router';
import { useState, useEffect } from 'react';
import { Game, Result } from 'src/lib/api';
import { PlayerBoxScore } from 'src/models/player-box-score';
import { ReadonlyPlayer } from 'src/services/PlayerService';

export const useBoxScore = (allowRedirect = true) => {
    const [lineupOnePlayerScores, setLineupOnePlayerScores] = useState<{ player: ReadonlyPlayer; boxScore: PlayerBoxScore }[]>();
    const [lineupTwoPlayerScores, setLineupTwoPlayerScores] = useState<{ player: ReadonlyPlayer; boxScore: PlayerBoxScore }[]>();
    const [game, setGame] = useState<Game>();

    const isFinal = (): boolean => game && game?.contest?.status === 'COMPLETE';

    const getLineupScore = (lineupNumber: number, result: Result): string => {
        const points = [];
        const playerScores = [];
        if (game) {
            for (let i = 1; i < 6; i++) {
                if (!result || (result?.lineup_1_score === null && result?.lineup_2_score === null)) {
                    const emptyBoxScore = {
                        ast: 0,
                        blk: 0,
                        drb: 0,
                        orb: 0,
                        tov: 0,
                        trb: 0,
                        two_p: 0,
                        two_p_pct: 0,
                        two_pa: 0,
                        three_p: 0,
                        three_p_pct: 0,
                        three_pa: 0,
                        fg_pct: 0,
                        fga: 0,
                        fg: 0,
                        ft_pct: 0,
                        fta: 0,
                        ft: 0,
                        pf: 0,
                        pts: 0,
                        stl: 0,
                    };

                    if (game[`lineup_${lineupNumber}`]) {
                        const player = game[`lineup_${lineupNumber}`][`player_${i}`];
                        playerScores.push({ player, emptyBoxScore });
                        points.push(0);
                    }
                } else {
                    const boxScore = result[`lineup_${lineupNumber}_player_${i}_box_score`];
                    if (boxScore) {
                        const player = game[`lineup_${lineupNumber}`][`player_${i}`];
                        playerScores.push({ player, boxScore });
                        points.push(boxScore.pts);
                    }
                }
            }
        }
        if (lineupNumber === 1) {
            setLineupOnePlayerScores(playerScores);
        } else {
            setLineupTwoPlayerScores(playerScores);
        }
        return points?.reduce((a, b) => a + b, 0).toString();
    };

    useEffect(() => {
        if (game) {
            if (allowRedirect && isFinal()) {
                router.push(`/headtohead/${game?.id}/joined/boxscore`);
            }
            getLineupScore(1, game.results);
            getLineupScore(2, game.results);
        }
    }, [game]);

    return { lineupOnePlayerScores, lineupTwoPlayerScores, game, setGame, isFinal };
};

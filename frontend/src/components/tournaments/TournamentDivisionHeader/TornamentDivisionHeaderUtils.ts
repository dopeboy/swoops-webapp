import { DivisionButton } from 'src/models/division-button';

export const defaultDivisionButtons: DivisionButton[] = [
    {
        title: 'Round of 64',
        round: '64',
        isFirst: true,
    },
    {
        title: 'Round of 32',
        round: '32',
    },
    {
        title: 'Swoops 16',
        round: '16',
    },
    {
        title: 'Elite 8',
        round: '8',
    },
    {
        title: 'Final 4',
        round: '4',
    },
    {
        title: 'Championship',
        round: 'championship',
        isLast: true,
    },
];

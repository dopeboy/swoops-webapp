import { Team } from '../api';
import { getPrice } from '../utils';

export interface FakeGame {
    readonly id: number;
    type: string;
    opponent: Team;
    result: string;
    score: string;
}

export const fakeTournamentResultsDataSmall = [
    {
        prize: `${getPrice('120')} Prize`,
        description: 'Head to Head Game',
        time: '00:45',
        players: [
            { name: 'Los Angeles Stakers', score: '67-15', image_url: 'AvatarPink.png', title: '96' },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: '80' },
        ],
        image_url: 'Basketball',
    },
    {
        prize: `${getPrice('120')} Prize`,
        description: 'Head to Head Game',
        time: 'Final',
        players: [
            { name: 'Los Angeles Stakers', score: '67-15', image_url: 'AvatarPink.png', title: '130' },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: '145', live: true },
        ],
        image_url: 'Basketball',
    },
    {
        prize: `${getPrice('120')} Prize`,
        description: 'Head to Head Game',
        time: '00:60',
        players: [
            { name: 'Los Angeles Stakers', score: '67-15', image_url: 'AvatarPink.png', title: '0' },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: '0' },
        ],
        image_url: 'Basketball',
    },
    {
        prize: 'Round 1 of 4',
        description: '$10,000.00 Tournament',
        time: '00:45',
        players: [
            { name: 'Los Angeles Stakers', score: '67-15', image_url: 'AvatarPink.png', title: '96' },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: '80' },
        ],
        image_url: 'Bracket',
    },
    {
        prize: 'Round 1 of 4',
        description: '$10,000.00 Tournament',
        time: 'Final',
        players: [
            { name: 'Los Angeles Stakers', score: '67-15', image_url: 'AvatarPink.png', title: '130' },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: '145', live: true },
        ],
        image_url: 'Bracket',
    },
    {
        prize: 'Round 1 of 4',
        description: '$10,000.00 Tournament',
        time: '00:60',
        players: [
            { name: 'Los Angeles Stakers', score: '67-15', image_url: 'AvatarPink.png', title: '0' },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: '0' },
        ],
        image_url: 'Bracket',
    },
];

export const fakeTournamentResultsDataLarge = [
    {
        prize: `${getPrice('1200')} Tournament Pool`,
        description: '16 Tournament Pool',
        time: '00:45',
        players: [
            { name: 'Los Angeles Stakers', score: '67-15', image_url: 'AvatarPink.png', title: '1st', description: 'Current Ranking' },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: '2nd', description: 'Current Ranking' },
            { name: 'Tennessee Tokens', score: '54-35', image_url: 'AvatarWhite.png', title: '3rd', description: 'Current Ranking' },
            { name: 'Los Angeles Stakers', score: '67-15', image_url: 'AvatarPink.png', title: '4th', description: 'Current Ranking' },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: '5th', description: 'Current Ranking' },
            { name: 'Tennessee Tokens', score: '54-35', image_url: 'AvatarWhite.png', title: '6th', description: 'Current Ranking' },
        ],
        image_url: 'Bracket',
    },
    {
        prize: `${getPrice('2000')} Tournament Pool`,
        description: '16 Tournament Pool',
        time: 'Finished',
        players: [
            {
                name: 'Los Angeles Stakers',
                score: '67-15',
                image_url: 'AvatarPink.png',
                title: `${getPrice('600')} `,
                description: '1st place',
            },
            {
                name: 'Brooklyn NFTs',
                score: '32-27',
                image_url: 'AvatarGreen.png',
                title: `${getPrice('400')} `,
                description: '2nd Place',
            },
            {
                name: 'Tennessee Tokens',
                score: '54-35',
                image_url: 'AvatarWhite.png',
                title: `${getPrice('200')} `,
                description: '3rd Place',
            },
            {
                name: 'Los Angeles Stakers',
                score: '67-15',
                image_url: 'AvatarPink.png',
                title: `${getPrice('100')} `,
                description: '4th Place',
            },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: `${getPrice('50')} `, description: '5th Place' },
            {
                name: 'Tennessee Tokens',
                score: '54-35',
                image_url: 'AvatarWhite.png',
                title: `${getPrice('25')} `,
                description: '6th Place',
            },
        ],
        image_url: 'Bracket',
    },
    {
        prize: `${getPrice('1200')} Tournament Pool`,
        description: '16 Tournament Pool',
        time: 'Starts in 00:60',
        players: [
            { name: 'Los Angeles Stakers', score: '67-15', image_url: 'AvatarPink.png', title: '1st', description: 'Initial Ranking' },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: '2nd', description: 'Initial Ranking' },
            { name: 'Tennessee Tokens', score: '54-35', image_url: 'AvatarWhite.png', title: '3rd', description: 'Initial Ranking' },
            { name: 'Los Angeles Stakers', score: '67-15', image_url: 'AvatarPink.png', title: '4th', description: 'Initial Ranking' },
            { name: 'Brooklyn NFTs', score: '32-27', image_url: 'AvatarGreen.png', title: '5th', description: 'Initial Ranking' },
            { name: 'Tennessee Tokens', score: '54-35', image_url: 'AvatarWhite.png', title: '6th', description: 'Initial Ranking' },
        ],
        image_url: 'Bracket',
    },
];

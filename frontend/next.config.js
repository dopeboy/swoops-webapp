const { withSentryConfig } = require('@sentry/nextjs');

const sentryWebpackPluginOptions = {
    silent: true,
};

const moduleExports = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/login',
                permanent: false,
            },
            {
                source: '/presale',
                destination: '/drop',
                permanent: false,
            },
            {
                source: '/drop',
                destination: 'https://playswoops.com',
                basePath: false,
                permanent: false,
            },
            {
                source: '/locker-room/:teamId',
                destination: '/locker-room/:teamId/roster',
                permanent: false,
            },
            {
                source: '/players',
                destination: '/locker-room',
                permanent: false,
            },
            {
                source: '/players/roster',
                destination: '/locker-room',
                permanent: false,
            },
            {
                source: '/games',
                destination: '/games/open',
                permanent: false,
            },
            {
                source: '/leaderboard',
                destination: '/stats/teams',
                permanent: false,
            },
            {
                source: '/stats',
                destination: '/stats/teams',
                permanent: false,
            },
            {
                source: '/swooperbowl',
                destination: '/tournament/5',
                permanent: false,
            },
            {
                source: '/player-detail/:id',
                destination: '/player-detail/:id/current',
                permanent: false,
            },
            {
                source: '/h2h-matchmake',
                destination: '/h2h-matchmake/roster',
                permanent: false,
            },
            {
                source: '/player-detail/:id/games',
                destination: '/player-detail/:id/current',
                permanent: false,
            },
            {
                source: '/game/:slug*',
                destination: '/locker-room',
                permanent: false,
            },
            {
                source: '/tournament-detail/:slug*',
                destination: '/locker-room',
                permanent: false,
            },
            {
                source: '/build/:slug*',
                destination: '/locker-room',
                permanent: false,
            },
            {
                source: '/headtohead/:gameId/joined',
                destination: '/headtohead/:gameId/joined/matchup',
                permanent: false,
            },
        ];
    },
    webpack: (config) => {
        config.experiments = {
            topLevelAwait: true,
        };
        return config;
    },
    // Will be available on both server and client
    env: {
        VERCEL_GIT_PULL_REQUEST_NUMBER: process.env.VERCEL_GIT_PULL_REQUEST_NUMBER,
        VERCEL_GIT_IS_PULL_REQUEST: process.env.VERCEL_GIT_IS_PULL_REQUEST,
        SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
        IS_UAT: process.env.IS_UAT,
        NEXT_PUBLIC_INFURA_API_KEY: process.env.NEXT_PUBLIC_INFURA_API_KEY,
        NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL: process.env.NEXT_PUBLIC_SWOOPS_LOGOS_BASEURL,
        NEXT_PUBLIC_SWOOPS_IMAGE_BASEURL: process.env.NEXT_PUBLIC_SWOOPS_IMAGE_BASEURL,
        FEATURE_FLAG_TOURNAMENTS: process.env.FEATURE_FLAG_TOURNAMENTS,
        FEATURE_FLAG_IN_SEASON_TOURNAMENTS: process.env.FEATURE_FLAG_IN_SEASON_TOURNAMENTS,
        MAGIC_BELL_API_KEY: process.env.MAGIC_BELL_API_KEY,
        CROSSMINT_API_KEY: process.env.CROSSMINT_API_KEY,
        CROSSMINT_CLIENT_ID: process.env.CROSSMINT_CLIENT_ID,
    },
    productionBrowserSourceMaps: true,
    sentry: {
        hideSourceMaps: true,
    },
    images: {
        domains: [
            'https://s3.us-west-2.amazonaws.com',
            'https://staging-swoops-factory-media.s3.us-west-2.amazonaws.com',
            'swoops-ugc-staging.s3.us-west-2.amazonaws.com',
            'staging-swoops-factory-media.s3.us-west-2.amazonaws.com',
            'swoops-ugc.s3.us-west-1.amazonaws.com',
        ],
    },
};

module.exports = process.env.NODE_ENV !== 'development' ? withSentryConfig(moduleExports, sentryWebpackPluginOptions) : moduleExports;

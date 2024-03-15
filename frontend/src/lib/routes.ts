export const loginRoute = '/login';
export const playerRosterRoute = '/locker-room/';
export const gamesRoute = '/games/open';
export const addTeamRoute = '/add-team';
export const waitingRoom = '/waiting-room';
export const verifyEmail = '/verify-email';
export const courtRoute = '/games/open';
export const underMaintenanceRoute = '/under-maintenance';

export const topLevelRoutes = [
    {
        key: 'locker-room',
        title: 'Locker Room',
        path: 'locker-room',
    },
    {
        key: 'games',
        title: 'Head-to-Head',
        path: 'games/open',
    },
    {
        key: 'tournaments',
        title: 'Tournaments',
        path: 'tournaments',
    },
    {
        key: 'stats',
        title: 'Leaderboard',
        path: 'stats/teams',
    },
    ...(process.env.FEATURE_FLAG_TOURNAMENTS
        ? [
              {
                  key: 'tournament',
                  title: 'SWOOPER BOWL',
                  path: 'swooperbowl',
              },
          ]
        : []),
];

export const publicTopLevelRoutes = [
    {
        key: 'games',
        title: 'Head-to-head',
        path: 'games/open',
    },
    {
        key: 'stats',
        title: 'Leaderboard',
        path: 'stats/teams',
    },
    {
        key: 'tournaments',
        title: 'Tournaments',
        path: 'tournaments',
    },
    process.env.FEATURE_FLAG_TOURNAMENTS
        ? {
              key: 'tournament',
              title: 'SWOOPER BOWL',
              path: 'swooperbowl',
          }
        : {},
];

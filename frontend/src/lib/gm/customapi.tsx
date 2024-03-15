// NOTE - everyting in this file should be deprecated.
// It is here because our type definitions are out of date
// and that needs its own attention. So for now, 
// we're going manual and doing things the old way.

const URL = 'https://gm-api.playswoops.com';

export const validatePartner = async(slug:string) => {
    const response = await fetch(`${URL}/api/game/partner/${slug}`);

    if (response.status !== 200)
        throw new Error()

    const data = await response.json();
    return data
}

export const getStatsByUserEmail = async(email:string) => {

    const response = await fetch(`${URL}/api/game/user/${email}/stats`);

    if (response.status !== 200)
        throw new Error()

    const data = await response.json();
    return data
}

export const getStatsForChallengeByGame = async(gameUuid:string) => {

    const response = await fetch(`${URL}/api/game/${gameUuid}/challenge/stats`);

    if (response.status !== 200)
        throw new Error()

    const data = await response.json();
    return data
}

export const getStreakByUser = async(email:string) => {

    const response = await fetch(`${URL}/api/game/user/${email}/streak`);

    if (response.status !== 200)
        throw new Error()

    const data = await response.json();
    return data
}
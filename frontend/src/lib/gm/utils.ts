import { Login } from 'src/lib/gm/api/models/Login';
import { ApiService, Game, OpenAPI, AccountsService } from './api';
import { User } from './api/models/User';
import { User as OGUser } from '../api/models/User';

export const lol = (): string => {
    return process.env.VERCEL_GIT_IS_PULL_REQUEST ? 'lol' : 'uhh';
};

export const loginUserToClient = async (login: Login): Promise<User> => {
    const user = await AccountsService.accountsLoginCreate(login);
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('user', JSON.stringify(user.email));
    }
    return user;
};

export const logoutUserFromClient = (): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('user');
    }
};

export const isUserLoggedIn = (): boolean => {
    if (typeof window !== 'undefined') {
        return window.localStorage.getItem('user') !== null;
    }
};

export const getUser = (): string => {
    if (typeof window !== 'undefined') {
        return window.localStorage.getItem('user');
    }
};

export const getPrice = (price: string): string => {
    if (!price) return '$0.00';
    return '$' + parseFloat(price).toLocaleString() + '.00';
};

export const getStat = (stat): number => {
    return Math.floor(stat * 10) / 10;
};

export const mapToStatus = (str: string): Game.status => {
    const mappings = {
        open: Game.status.OPEN,
        inprogress: Game.status.IN_PROGRESS,
        completed: Game.status.COMPLETE,
    };

    return mappings[str];
};

export const gmSubmitLineup = async (accessToken: string): Promise<any> => {
    try {
        const payload = localStorage.getItem('lineupPayload');
        const lineupPayload = JSON.parse(payload);
        OpenAPI.TOKEN = accessToken;
        const apiCreateGameRes: any = await ApiService.apiCreateGame(lineupPayload);
        localStorage.removeItem('lineupPayload');
        return apiCreateGameRes;
    } catch (error) {
        console.error(error);
    }
};

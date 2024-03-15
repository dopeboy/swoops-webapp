/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Player = {
    readonly uuid?: string;
    first_name: string;
    last_name: string;
    height?: number;
    strength?: number;
    speed?: number;
    jumping?: number;
    endurance?: number;
    low_post_scoring?: number;
    dunking?: number;
    free_throw_shooting?: number;
    point_jump_shot_ability?: number;
    three_point_shooting?: number;
    offensive_iq?: number;
    defensive_iq?: number;
    dribbling?: number;
    passing?: number;
    rebounding?: number;
    image_url?: string | null;
    owner?: string | null;
};

export type NBAPlayer = {
    first_name: string;
    last_name: string;
    position: string;
    full_name: string;
    image_url: string;
    is_active: boolean;
};

export type NBAPlayerStats = {
    readonly id?: string;
    season: string;
    ppg?: number;
    rpg?: number;
    apg?: number;
    price?: number;
    rating: number;
    player: NBAPlayer;
    type?: string;
    position?: string;
};

export type PrimaryDailyLineupToday = {
    date?: string;
    is_primary: boolean;
    player_1: Player;
    player_2: Player;
    player_3: Player;
    player_4: Player;
    player_5: Player;
};

export type GameCreate = {
    challenge: number;
    player_1: number;
    player_2: number;
    player_3: number;
    player_4: number;
    player_5: number;
    partner_slug: string;
};

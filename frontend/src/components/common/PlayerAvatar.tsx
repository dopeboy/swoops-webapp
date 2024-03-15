import React from 'react';

interface PlayerAvatarProps {
    playerToken: number;
    className: string;
    background?: boolean;
    width: number;
    height: number;
}

const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_IMAGE_BASEURL;

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ background = false, playerToken, className, width, height }) => {
    // Multiplying width and height by 2 because rendered size is actually bigger, just clipped.
    // Without multiplier, image is blurry
    return playerToken ? (
        <img
            className={className}
            src={`${imageBaseUrl}${playerToken}${!background ? '_no_bg' : ''}.png?width=${
                width * 2
            }&height=${height * 2}&auto=format`}
            alt="Player image"
        />
    ) : (
        <></>
    );
};

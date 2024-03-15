import React, { useState, useRef, useEffect } from 'react';
import { RWebShare } from 'react-web-share';

interface IProps {
    status: 'loss' | 'win' | 'lineup';
    imageUrl: string;
    players: string;
    gameUrl: string;
}

const TweetImage = (props: IProps) => {
    const { status, imageUrl, players, gameUrl } = props;
    const [imageFile, setImageFile] = useState(null);
    const imageRef = useRef();

    useEffect(() => {
        async function loadImage() {
            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'image.jpg', { type: blob.type });
                setImageFile(file);
            } catch (error) {
                console.log('Error loading completed game image', error);
            }
        }

        loadImage();
    }, []);

    const renderText = (status) => {
        if (status === 'lineup') {
            return 'I chose ' + players + ' in my lineup for the daily @playswoops challenge. ';
        } else if (status === 'win') {
            return 'I won with ' + players + ' in my lineup for the daily @playswoops challenge. ';
        } else if (status === 'loss') {
            return 'I lost with ' + players + ' in my lineup for the daily @playswoops challenge. ';
        }
    };

    return (
        <div className="min-w-0 flex flex-col w-full mb-3 border border-white/16 rounded-lg">
            <div>
                <img ref={imageRef} src={imageUrl} className="rounded-lg" alt="Challenge Team Versus User Lineup Picture" crossOrigin="anonymous" />
            </div>
            <RWebShare
                sites={['facebook', 'twitter', 'copy']}
                data={{
                    text: renderText(status),
                    url: gameUrl,
                    title: 'Share your result',
                    files: [imageFile],
                }}
            >
                <button className="relative bg-blue rounded-b-lg px-4 py-4 cursor-pointer">
                    <div className="flex items-center justify-center">
                        <span className="text-base font-display font-bold text-white ml-4">Share</span>
                    </div>
                </button>
            </RWebShare>
        </div>
    );
};

export default TweetImage;

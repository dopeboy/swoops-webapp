import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { RWebShare } from 'react-web-share';
import { trackPageLanding } from 'src/lib/tracking';

interface IProps {
    url: string;
}

export const ShareImage: React.FC<IProps> = ({ url }) => {
    const router = useRouter();
    useEffect(() => {
        if (router.isReady) {
            trackPageLanding(`Player Detail`);
        }
    }, [router.isReady]);

    return (
        <div className="flex flex-col items-end w-full p-4 rounded-xl">
            <RWebShare
                sites={['facebook', 'twitter', 'copy']}
                data={{
                    text: 'Check out my Swoops player',
                    url,
                    title: 'Share your player!',
                }}
            >
                <button>
                    <img src="/images/twitter_share_button.png" />
                </button>
            </RWebShare>
        </div>
    );
};

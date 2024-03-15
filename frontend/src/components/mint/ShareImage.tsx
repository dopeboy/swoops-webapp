import { ShareIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { RWebShare } from 'react-web-share';
import { Typography } from '../common/Typography';

const ShareImage: React.FC = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<null | File>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        setImageUrl(`${window.location.origin}/images/just_minted_graphic.png`);
    }, [typeof window === 'undefined']);

    useEffect(() => {
        if (imageUrl === '') {
            return;
        }

        async function loadImage(): Promise<void> {
            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'image.png', { type: blob.type });
                setImageFile(file);
            } catch (error) {
                console.error('Error loading share mint image', error);
            }
        }

        loadImage();
    }, [imageUrl]);

    return (
        <div className="min-w-0 max-w-lg flex flex-col w-full bg-transparent">
            <RWebShare
                sites={['facebook', 'twitter', 'copy']}
                data={{
                    text: 'I just bought a SSN2 Swoopster during the @playswoops presale! Get in while supply lasts!! Sign up for their newsletter to get access! PRESALE ACCESS: https://bit.ly/SWOOPS_NEWSLETTER',
                    url: 'https://bit.ly/SWOOPS_NEWSLETTER',
                    title: 'Share your new Swoopster!',
                    files: [imageFile],
                }}
            >
                <button className="flex flex-row items-center justify-center gap-1.5 relative bg-blue hover:bg-blue/90 transition-all duration-300 border-[3px] border-white rounded-tl-3xl py-3 cursor-pointer">
                    <Typography text="Share" variant="h5" color="white" />
                    <ShareIcon className="h-4 w-4" strokeWidth={2} />
                </button>
            </RWebShare>
            <div>
                <img
                    src={imageUrl}
                    alt="Just Purchased Swoopster"
                    crossOrigin="anonymous"
                    className="rounded-br-3xl border-b-[3px] border-x-[3px] border-white"
                />
            </div>
        </div>
    );
};

export default ShareImage;

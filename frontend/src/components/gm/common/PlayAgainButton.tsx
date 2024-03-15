import { useRouter } from 'next/router';

export const PlayAgainButton: React.FC = () => {
    const router = useRouter();
    return (
        <button
            onClick={() => router.push('/gm')}
            className="sm:w-fit w-full bg-assist-green heading-three sm:heading-two rounded-lg text-black px-4 py-3 sm:px-6 sm:py-3 min-w-[200px] sm:min-w-[300px]"
        >
            Play Again
        </button>
    );
};

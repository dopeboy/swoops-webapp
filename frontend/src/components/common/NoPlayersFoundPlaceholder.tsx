import { trackEvent } from 'src/lib/tracking';

interface NoPlayersFoundPlaceholderProps {
    isTeamOwner?: boolean;
}

export const NoPlayersFoundPlaceholder: React.FC<NoPlayersFoundPlaceholderProps> = ({ isTeamOwner }) => (
    <div className="flex flex-col items-center justify-center pt-12 pb-44 px-4">
        <span className="heading-two text-white text-center">No players in {`${isTeamOwner ? 'your' : 'this'}`} roster yet.</span>
        <div className="flex flex-col items-center gap-3">
            {isTeamOwner && (
                <a
                    className="font-light text-base underline text-gray-200 mt-6"
                    href="https://opensea.io/collection/swoops"
                    target="_blank"
                    onClick={() => trackEvent('OpenSea link clicked')}
                >
                    Add players to your lineup via OpenSea
                </a>
            )}
        </div>
    </div>
);

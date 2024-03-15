interface MobileInnerBannerProps {
    score: number | null;
    teamId: number;
    teamName: string;
    alignTop: boolean;
    record: string;
    isFinal: boolean;
    won: boolean;
}

export const MobileInnerBanner: React.FC<MobileInnerBannerProps> = ({ isFinal, score, alignTop, teamName, teamId, won }) => {
    const scoreDisplay = score || '-';
    return (
        <div className="w-full flex flex-col items-center justify-center">
            {!alignTop && (
                <div className="flex flex-row items-center justify-end gap-3">
                    <div className={`text-off-black heading-two text-center`}>{scoreDisplay}</div>
                    {isFinal && won && <div className="h-2 w-2 rounded-full bg-assist-green"></div>}
                    {isFinal && !won && <div className="h-2 w-2 rounded-full bg-defeat-red"></div>}
                </div>
            )}
            {teamId && (
                <a href={`/locker-room/${teamId}`} target="_blank">
                    <div className={`text-off-black heading-three text-center`}>{teamName}</div>
                </a>
            )}
            {!teamId && <div className={`text-off-black heading-three text-center`}>{teamName}</div>}

            {alignTop && (
                <div className="flex flex-row items-center justify-start gap-3">
                    <div className={`text-off-black heading-two text-center`}>{scoreDisplay}</div>
                    {isFinal && won && <div className="h-2 w-2 rounded-full bg-assist-green"></div>}
                    {isFinal && !won && <div className="h-2 w-2 rounded-full bg-defeat-red"></div>}
                </div>
            )}
        </div>
    );
};

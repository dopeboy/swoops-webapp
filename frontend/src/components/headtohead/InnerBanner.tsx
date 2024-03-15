interface InnerBannerProps {
    score: number | null;
    teamId: number;
    teamName: string;
    alignLeft: boolean;
    record: string;
    isFinal: boolean;
    won: boolean;
}

export const InnerBanner: React.FC<InnerBannerProps> = ({ isFinal, score, alignLeft, teamName, teamId, won }) => {
    const scoreDisplay = score || '-';
    const alignment = alignLeft ? 'text-left' : 'text-right';
    return (
        <div className="w-1/3 relative top-5">
            {!alignLeft && (
                <div className="flex flex-row items-center justify-end gap-3">
                    <div className={`text-off-black heading-two ${alignment}`}>{scoreDisplay}</div>
                    {isFinal && won && <div className="h-2 w-2 rounded-full bg-assist-green"></div>}
                    {isFinal && !won && <div className="h-2 w-2 rounded-full bg-defeat-red"></div>}
                </div>
            )}
            {alignLeft && (
                <div className="flex flex-row items-center justify-start gap-3">
                    {isFinal && won && <div className="h-2 w-2 rounded-full bg-assist-green"></div>}
                    {isFinal && !won && <div className="h-2 w-2 rounded-full bg-defeat-red"></div>}
                    <div className={`text-off-black heading-two ${alignment}`}>{scoreDisplay}</div>
                </div>
            )}
            {teamId && (
                <a href={`/locker-room/${teamId}`} target="_blank">
                    <div className={`text-off-black pt-4 heading-three ${alignment}`}>{teamName}</div>
                </a>
            )}
            {!teamId && <div className={`text-off-black pt-4 heading-three ${alignment}`}>{teamName}</div>}
        </div>
    );
};

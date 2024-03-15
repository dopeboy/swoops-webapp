interface SPBarLockerRoomProps {
    currentSP: number;
    nextLevelSP: number;
    progress: string;
    level: number;
    isMaxLevel: boolean;
    isTopOne?: boolean;
    maxWidth?: boolean;
}
export const SPBarLockerRoom: React.FC<SPBarLockerRoomProps> = ({ isTopOne, isMaxLevel, level, currentSP, nextLevelSP, progress }) => {
    const getColor = (level: number): string => {
        if (level >= 0 && level <= 3) {
            return '#5688FC';
        } else if (level >= 4 && level <= 11) {
            return '#D13DC2';
        } else if (level >= 12 && level <= 18) {
            return '#F44336';
        } else if (level >= 19 && level <= 22) {
            return '#F0CA00';
        } else if (isTopOne) {
            return '#13FF0D';
        }
    };

    return (
        <div className="relative w-[250px] sm:w-[320px] left-4">
            <div className="w-[250px] sm:w-[320px] max-w-lg h-6 absolute -inset-y-3 left-0 bg-white z-0"></div>
            <div
                style={{ backgroundColor: `${getColor(level)}`, opacity: '32%' }}
                className="w-[250px] sm:w-[320px] max-w-lg h-6 absolute -inset-y-3 left-0 z-10"
            ></div>
            <div
                style={{ width: `${Number(progress) >= 100 ? 100 : progress}%`, backgroundColor: `${getColor(level)}` }}
                className="w-[250px] sm:max-w-[320px] h-6 absolute -inset-y-3 left-0 z-20"
            >
                {!isMaxLevel && (
                    <div className="relative">
                        <div className="absolute right-0 h-7 -inset-y-0.5 w-[2px] bg-black "></div>
                    </div>
                )}
            </div>
            {!isMaxLevel && (
                <div className="absolute z-20 -inset-y-[7.5px] w-[250px] sm:w-[320px] detail-one text-[11px] text-center">
                    <span>{currentSP}</span> <span className="hidden sm:inline-block">/ {nextLevelSP}</span>
                </div>
            )}
            {isMaxLevel && (
                <div className="absolute z-20 -inset-y-[7.5px] w-[250px] sm:w-[320px] detail-one text-[11px] text-white text-center">Complete!</div>
            )}
        </div>
    );
};

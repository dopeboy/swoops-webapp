interface SPBarProps {
    currentSP: number;
    nextLevelSP: number;
    progress: string;
    level: number;
    isMaxLevel: boolean;
    loadingSP: boolean;
    isTopOne?: boolean;
}
export const SPBar: React.FC<SPBarProps> = ({ isTopOne, loadingSP, isMaxLevel, level, currentSP, nextLevelSP, progress }) => {
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
        <div className="relative w-[90px] xl:w-[188px]">
            <div
                style={{ backgroundColor: `${getColor(level)}`, opacity: '32%' }}
                className="w-[90px] xl:w-[188px] max-w-lg h-6 absolute -inset-y-3 left-0"
            ></div>
            <div
                style={{ width: `${progress}%`, backgroundColor: `${getColor(level)}` }}
                className="max-w-[90px] xl:max-w-[188px] h-6 absolute -inset-y-3 left-0"
            >
                {!isMaxLevel && (
                    <div className="relative">
                        <div className="absolute right-0 h-7 -inset-y-0.5 w-[2px] bg-black "></div>
                    </div>
                )}
            </div>
            {loadingSP && (
                <div className="absolute z-10 -inset-y-[6px] inset-x-[35px] xl:inset-x-1/2 w-full">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                </div>
            )}
            {!loadingSP && (
                <div className="absolute z-8 -inset-y-[7.5px] w-[80px] xl:w-[188px] detail-one text-[11px] text-center">
                    <span>{currentSP}</span> <span className="hidden xl:inline-block">/ {nextLevelSP}</span>
                </div>
            )}
        </div>
    );
};

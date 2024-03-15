interface HistoricalResultsTwoChartLayoutProps {
    firstSlot: React.ReactNode;
    secondSlot: React.ReactNode;
}
export const HistoricalResultsTwoChartLayout: React.FC<HistoricalResultsTwoChartLayoutProps> = ({ firstSlot, secondSlot }) => {
    return (
        <div className="h-full sm:h-[436px] w-full flex flex-col sm:flex-row items-center justify-start gap-1 mb-0 sm:mb-6">
            <div className="h-full w-full sm:w-1/3">{firstSlot}</div>
            <div className="h-full w-full mt-1.5 sm:mt-0 sm:w-2/3">{secondSlot}</div>
        </div>
    );
};

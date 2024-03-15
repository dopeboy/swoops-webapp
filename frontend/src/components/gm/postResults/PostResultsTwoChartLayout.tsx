interface PostResultsTwoChartLayoutProps {
    firstSlot: React.ReactNode;
    secondSlot: React.ReactNode;
}
export const PostResultsTwoChartLayout: React.FC<PostResultsTwoChartLayoutProps> = ({ firstSlot, secondSlot }) => {
    return (
        <div className="h-full sm:h-[430px] w-full flex flex-col sm:flex-row items-center justify-start gap-1 sm:mb-3">
            <div className="h-full w-full sm:w-2/3">{firstSlot}</div>
            <div className="h-full w-full sm:w-1/3">{secondSlot}</div>
        </div>
    );
};

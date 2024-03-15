interface HeadToHeadStartingSoonNoticeProps {
    onClick: () => void;
}
export const HeadToHeadStartingSoonNotice: React.FC<HeadToHeadStartingSoonNoticeProps> = ({ onClick }) => {
    return (
        <div className="w-full flex flex-col items-center p-4 gap-3 sm:p-0 sm:block bg-black relative mt-20 sm:mt-12 border border-white rounded-lg overflow-hidden">
            <img className="hidden sm:inline-block" src="../../../images/StackedCard.png" width={191} height={197} />
            <div className="inline-block sm:left-[25%] sm:absolute sm:top-[30%]">
                <div className="heading-one text-white text-center">Starting soon...</div>
                <div className="text-base text-display text-white/64 text-center">
                    Your game is starting soon! You can refresh whenever to check if the results are in.
                </div>
            </div>
            <button className="btn-rounded-green pl-10 inline-block sm:absolute sm:top-[35%] sm:right-[3%]" onClick={onClick}>
                Refresh
            </button>
        </div>
    );
};

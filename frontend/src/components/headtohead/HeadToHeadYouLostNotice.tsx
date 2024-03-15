interface HeadToHeadYouLostNoticeProps {
    onClick: () => void;
}
export const HeadToHeadYouLostNotice: React.FC<HeadToHeadYouLostNoticeProps> = ({ onClick }) => {
    return (
        <div className="w-full flex flex-col items-center p-4 gap-3 sm:block sm:p-0 bg-black relative mt-20 sm:mt-12 border border-white rounded-lg overflow-hidden">
            <img className="hidden sm:inline-block" src="../../../images/StackedCard.png" width={191} height={197} />
            <div className="inline-block sm:left-[25%] sm:absolute sm:top-[30%]">
                <div className="heading-one text-white text-center">You Lost.</div>
                <div className="text-base text-display text-white/64 text-center">Get back out there and show'em what you're made of.</div>
            </div>
            <button className="btn-rounded-green pl-10 inline-block sm:absolute sm:top-[35%] sm:right-[10%]" onClick={onClick}>
                Play again
            </button>
        </div>
    );
};

interface HeadToHeadYouWonNoticeProps {
    onClick: () => void;
}
export const HeadToHeadYouWonNotice: React.FC<HeadToHeadYouWonNoticeProps> = ({ onClick }) => {
    return (
        <div className="w-full flex flex-col items-center p-4 gap-3 sm:p-0 sm:block bg-black relative mt-20 sm:mt-12 border border-assist-green rounded-lg overflow-hidden">
            <img className="hidden sm:inline-block" src="../../../images/WonBasketball.png" width={191} height={197} />
            <div className="inline-block sm:left-[25%] sm:absolute sm:top-[30%]">
                <div className="heading-one text-white text-center">You won!</div>
                <div className="text-base text-display text-white/64 text-center">Nice job crushing this head to head match. Ready to win again?</div>
            </div>
            <button className="btn-rounded-green pl-10 inline-block sm:absolute sm:top-[35%] sm:right-[10%]" onClick={onClick}>
                Play again
            </button>
        </div>
    );
};

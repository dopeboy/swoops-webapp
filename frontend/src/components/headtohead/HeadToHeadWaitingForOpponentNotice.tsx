export const HeadToHeadWaitingForOpponentNotice: React.FC = () => {
    return (
        <div className="w-full flex flex-col items-center p-4 gap-3 sm:p-0 sm:block bg-black relative mt-20 sm:mt-12 border border-white rounded-lg overflow-hidden">
            <img className="hidden sm:inline-block" src="../../../images/StackedCard.png" width={191} height={197} />
            <div className="inline-block sm:left-[25%] sm:absolute sm:top-[30%]">
                <div className="heading-one text-white text-center">Waiting for opponent...</div>
                <div className="text-base text-display text-white/64 text-center">
                    Your lineup was successfully submitted. Just need to find an opponent and it's game on!
                </div>
            </div>
        </div>
    );
};

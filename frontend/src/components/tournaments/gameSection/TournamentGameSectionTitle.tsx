interface TournamentGameSectionTitleProps {
    title: string;
    subtitle: string;
}
export const TournamentGameSectionTitle: React.FC<TournamentGameSectionTitleProps> = ({ title, subtitle }) => {
    return (
        <div className="w-full flex flex-col items-center justify-start gap-1.5 md:gap-3 uppercase">
            <h1 className="heading-two text-white text-center">{title}</h1>
            <h2 className="heading-three text-white/64 text-center">{subtitle}</h2>
        </div>
    );
};

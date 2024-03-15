interface PlayByPlayTableHeaderProps {
    homeTeamName?: string;
    awayTeamName?: string;
    userTeamIsHomeTeam?: boolean;
    userTeamIsAwayTeam?: boolean;
}
export const PlayByPlayTableHeader: React.FC<PlayByPlayTableHeaderProps> = ({
    userTeamIsHomeTeam,
    userTeamIsAwayTeam,
    homeTeamName,
    awayTeamName,
}) => {
    return (
        <div className="flex flex-row sticky px-4 border-b-1 border-white bg-off-black top-0 pb-2 items-center w-full justify-start hover:cursor-default">
            <span className="subheading-two text-white w-1/12">Time</span>
            <span className="subheading-two text-white w-full">Play</span>
            <span className="subheading-two text-white text-center w-1/4">{homeTeamName || userTeamIsHomeTeam ? 'Your Team' : 'Unnamed'}</span>
            <span className="subheading-two text-white text-center w-1/4">{awayTeamName || userTeamIsAwayTeam ? 'Your Team' : 'Unnamed'}</span>
        </div>
    );
};

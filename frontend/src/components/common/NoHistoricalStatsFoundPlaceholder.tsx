interface NoHistoricalStatsFoundPlaceholderProps {
    isTeamOwner?: boolean;
}

export const NoHistoricalStatsFoundPlaceholder: React.FC<NoHistoricalStatsFoundPlaceholderProps> = ({ isTeamOwner }) => (
    <div className="flex flex-col items-center justify-center pt-12 pb-44 px-4">
        <span className="heading-two text-white text-center">No Historical stats for {`${isTeamOwner ? 'your' : 'this'}`} player yet.</span>
    </div>
);

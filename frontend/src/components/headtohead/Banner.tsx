import { Game, Team } from 'src/lib/api';
import { InnerBanner } from './InnerBanner';
import { MobileInnerBanner } from './MobileInnerBanner';

interface BannerProps {
    bannerText: string;
    game: Game;
    handleTeamName: (team?: Team) => string;
    lineup1Won: () => boolean;
    lineup2Won: () => boolean;
    isFinal: () => boolean;
}

export const Banner: React.FC<BannerProps> = ({ isFinal, lineup1Won, lineup2Won, handleTeamName, game, bannerText }) => {
    return (
        <div className="banner h-40 w-full">
            <div className="px-6 sm:px-24 w-full">
                <span className="hidden bg-white h-40 rounded-lg sm:flex flex-row justify-center w-full">
                    <InnerBanner
                        isFinal={isFinal()}
                        alignLeft={false}
                        record={!game?.lineup_1?.team ? 'Waiting for opponent' : `${game?.lineup_1?.team?.wins}-${game?.lineup_1?.team?.wins}`}
                        teamId={game?.lineup_1?.team?.id}
                        score={!isFinal() ? null : game?.results?.lineup_1_score}
                        won={lineup1Won()}
                        teamName={handleTeamName(game?.lineup_1?.team)}
                    />
                    <div className="subheading-one text-off-black text-display uppercase text-center font-bold relative mx-6 top-7">{bannerText}</div>
                    <InnerBanner
                        isFinal={isFinal()}
                        alignLeft={true}
                        record={!game?.lineup_2?.team ? 'Waiting for opponent' : `${game?.lineup_2?.team?.wins}-${game?.lineup_2?.team?.wins}`}
                        teamId={game?.lineup_2?.team?.id}
                        score={!isFinal() ? null : game?.results?.lineup_2_score}
                        won={lineup2Won()}
                        teamName={handleTeamName(game?.lineup_2?.team)}
                    />
                </span>
                <span className="sm:hidden bg-white h-52 rounded-lg flex flex-col items-center justify-between py-6 w-full">
                    <MobileInnerBanner
                        isFinal={isFinal()}
                        alignTop={true}
                        record={!game?.lineup_1?.team ? 'Waiting for opponent' : `${game?.lineup_1?.team?.wins}-${game?.lineup_1?.team?.wins}`}
                        teamId={game?.lineup_1?.team?.id}
                        score={!isFinal() ? null : game?.results?.lineup_1_score}
                        won={lineup1Won()}
                        teamName={handleTeamName(game?.lineup_1?.team)}
                    />
                    <div className="subheading-one text-off-black text-display uppercase text-center font-bold relative mx-6">{bannerText}</div>
                    <MobileInnerBanner
                        isFinal={isFinal()}
                        alignTop={false}
                        record={!game?.lineup_2?.team ? 'Waiting for opponent' : `${game?.lineup_2?.team?.wins}-${game?.lineup_2?.team?.wins}`}
                        teamId={game?.lineup_2?.team?.id}
                        score={!isFinal() ? null : game?.results?.lineup_2_score}
                        won={lineup2Won()}
                        teamName={handleTeamName(game?.lineup_2?.team)}
                    />
                </span>
            </div>
        </div>
    );
};

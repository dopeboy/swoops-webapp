import { trackEvent } from 'src/lib/tracking';
interface PlayerTableNoResultsPlaceholderProps {
    shouldShow: boolean;
}

export const PlayerTableNoResultsPlaceholder: React.FC<PlayerTableNoResultsPlaceholderProps> = ({ shouldShow }) => {
    return (
        <>
            {shouldShow && (
                <table className="w-full">
                    <tbody className="bg-black flex flex-col justify-center items-center w-full">
                        <tr>
                            <td>
                                <div className="flex flex-col items-center justify-center pt-12 pb-12">
                                    <span className="subheading-one text-white">No players found.</span>
                                    <div className="w-32 border-1 my-2 bg-white border-white"></div>
                                    <div className="flex flex-col items-center  gap-3">
                                        <span className="subheading-three font-light text-gray-200 mt-2">Get some at</span>
                                        <a
                                            href="https://opensea.io/collection/swoops"
                                            target="_blank"
                                            className="btn-rounded-white"
                                            onClick={() => trackEvent('OpenSea link clicked')}
                                        >
                                            OpenSea
                                        </a>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
        </>
    );
};

import { NoGamesFoundPlaceholder } from './NoGamesFoundPlaceholder';

interface TableNoGamesFoundPlaceholderProps {
    shouldShow: boolean;
}

export const TableNoGamesFoundPlaceholder: React.FC<TableNoGamesFoundPlaceholderProps> = ({ shouldShow }) => {
    return (
        <>
            {shouldShow && (
                <table className="w-full">
                    <tbody className="bg-black flex flex-col justify-center items-center w-full">
                        <tr>
                            <td>
                                <NoGamesFoundPlaceholder />
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
        </>
    );
};

import { LoadingSpinner } from './LoadingSpinner';

interface TableLoadingSpinnerProps {
    loading: boolean;
}

export const TableLoadingSpinner: React.FC<TableLoadingSpinnerProps> = ({ loading }) => {
    return (
        <>
            {loading && (
                <table className="w-full">
                    <tbody className="bg-black flex flex-col justify-center items-center w-full">
                        <tr>
                            <td>
                                <div className="flex flex-col items-center justify-center pt-12 pb-14">
                                    <LoadingSpinner className="w-10 h-10" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
        </>
    );
};

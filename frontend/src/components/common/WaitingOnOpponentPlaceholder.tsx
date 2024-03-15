interface WaitingOnOpponentPlaceholderProps {
    shouldShow: boolean;
}

export const WaitingOnOpponentPlaceholder: React.FC<WaitingOnOpponentPlaceholderProps> = ({ shouldShow }) => {
    return (
        <>
            {shouldShow && (
                <table className="h-96 w-full">
                    <tbody className="h-96 bg-black flex flex-col justify-center items-center w-full">
                        <tr>
                            <td>
                                <div className="flex flex-col rounded-lg border-1 border-white items-center justify-center p-4">
                                    <span className="subheading-one text-white">Waiting for opponent</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
        </>
    );
};

import classNames from 'classnames';
import { PlayerNameChangeRequest } from 'src/lib/api';
import Button from '../common/button/Button';
import { ColorTheme } from '../common/button/types';

interface RenderRenameButtonProps {
    namingStatus: PlayerNameChangeRequest.status;
    onClick: () => void;
}

export const RenderRenameButton: React.FC<RenderRenameButtonProps> = ({ namingStatus, onClick }) => {
    return (
        <>
            {namingStatus === PlayerNameChangeRequest.status.PENDING || namingStatus === PlayerNameChangeRequest.status.ACCEPTED ? (
                <button
                    onClick={onClick}
                    className={classNames(
                        'subheading-two h-[48px] px-8 text-white flex flex-col items-center justify-center border-2 border-white rounded-lg',
                        {
                            'w-fit': PlayerNameChangeRequest.status.ACCEPTED === namingStatus,
                            'w-full': PlayerNameChangeRequest.status.PENDING === namingStatus,
                        }
                    )}
                >
                    {PlayerNameChangeRequest.status.ACCEPTED === namingStatus ? 'Renamed' : 'Rename Pending'}
                </button>
            ) : (
                <div data-tut="swoopster-naming">
                    <Button onClick={onClick} className="subheading-two" colorTheme={ColorTheme.White}>
                        Rename
                    </Button>
                </div>
            )}
        </>
    );
};

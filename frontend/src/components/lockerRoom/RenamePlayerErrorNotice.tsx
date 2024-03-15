import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface RenamePlayerErrorNoticeProps {
    error: string;
}
export const RenamePlayerErrorNotice: React.FC<RenamePlayerErrorNoticeProps> = ({ error }) => {
    return (
        <>
            {error?.length > 0 && (
                <div className="flex flex-row items-center justify-start gap-1.5">
                    <ExclamationCircleIcon className="h-6 w-6 text-defeat-red-text-on-black" />
                    <span className="text-base text-defeat-red-text-on-black font-semibold">{error}</span>
                </div>
            )}
        </>
    );
};

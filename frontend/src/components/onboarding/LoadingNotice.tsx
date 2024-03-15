import { LoadingSpinner } from '../common/LoadingSpinner';

interface LoadingNoticeProps {
    text: string;
}

export const LoadingNotice: React.FC<LoadingNoticeProps> = ({ text }) => {
    return (
        <div className="flex flex-col items-center mt-2 text-white py-2.5 w-full gap-3">
            <LoadingSpinner bgColor="transparent" fill="white" className="h-6 w-6 m-1" />
            <span className="px-2 text-white leading-[1.1] tracking-[.04em] text-[14px] uppercase font-[700] text-center">{text}</span>
        </div>
    );
};

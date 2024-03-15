import { ReactElement } from 'react';

interface HeadToHeadHeaderProps {
    date: string;
}
export const HeadToHeadHeader: React.FC<HeadToHeadHeaderProps> = ({ date }): ReactElement => {
    const event = !date ? null : new Date(date);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    const parsedDate = event?.toLocaleDateString('en-US', options);
    return (
        <div className="flex justify-start w-full">
            <div className="flex flex-col">
                <span className="dark:text-white heading-three sm:heading-one">HEAD TO HEAD</span>
                <span className="detail-one text-gray-400 h-[13.5px] font-bold">{parsedDate || ''}</span>
            </div>
        </div>
    );
};

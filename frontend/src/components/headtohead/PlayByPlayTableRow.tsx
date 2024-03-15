import classNames from 'classnames';

interface PlayByPlayTableRowProps {
    index: number;
    data: any;
}
export const PlayByPlayTableRow: React.FC<PlayByPlayTableRowProps> = ({ index, data }) => {
    return (
        <li
            className={classNames(
                'flex flex-row first:rounded-t-md last:rounded-b-md last:mb-1.5 items-center py-2 w-full justify-start hover:cursor-default',
                {
                    'bg-white/[0.05]': index % 2 === 0,
                }
            )}
        >
            <span className="text-base text-white text-start font-bold pl-5 w-1/12">{data?.gameclock}</span>
            <span className="text-base text-white text-start pl-2 w-full">{data?.detail}</span>
            <span className="text-base text-white text-center -ml-10 w-1/4">{data?.challenged_score}</span>
            <span className="text-base text-white text-center w-1/4">{data?.challenger_score}</span>
        </li>
    );
};

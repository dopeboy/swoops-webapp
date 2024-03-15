import { CurrencyDollarIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';

interface LineupHeaderWithBadgeProps {
    title: string;
    value: number;
    isDesktop: boolean;
    color: 'home' | 'away';
}
export const LineupHeaderWithBadge: React.FC<LineupHeaderWithBadgeProps> = ({ title, value, isDesktop, color }) => {
    const getColorClasses = (): string => {
        switch (color) {
            case 'home':
                return 'bg-assist-green/32 border-assist-green/40';
            case 'away':
                return 'bg-black border-white/16';
            default:
                return '';
        }
    };

    return (
        <tr className="bg-black w-full border-b border-solid border-white/16">
            <td colSpan={isDesktop ? 13 : 12} className="px-2.5 py-2 md:px-6 md:py-4 w-full min-w-full">
                <div className="flex flex-row items-center justify-start gap-2">
                    <div className="text-[12px] md:text-lg uppercase font-semibold tracking-wider">{title}</div>
                    <div
                        className={classNames(
                            'rounded-full border-[0.5px] pl-1.5 gap-0.5 md:gap-1 pr-2 py-1 md:ml-2 flex flex-row items-center justify-center',
                            getColorClasses()
                        )}
                    >
                        <CurrencyDollarIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        <span className="text-base [line-height:14px] md:text-[17px] font-medium">{value}</span>
                    </div>
                </div>
            </td>
        </tr>
    );
};

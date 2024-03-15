import { ArrowDownIcon, ArrowUpIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';

interface PlayerSelectTableHeaderProps {
    headers: Array<SortableHeader>;
    reverse?: boolean;
    updateSortDirection?: (columnToSort: SortableHeader) => void;
    withGap?: boolean;
}

export const PlayerSelectTableHeader: React.FC<PlayerSelectTableHeaderProps> = ({ headers, updateSortDirection, reverse, withGap = false }) => {
    const conditionalStyles = (header, index): string => {
        if (header === 'PLAYER' || header.title === 'PLAYER') {
            return 'pr-4 pl-2 min-w-[180px] text-left';
        } else if (header === 'POS' || header === 'SZN') {
            return 'pl-2 pr-0';
        } else if (index === 0 && !reverse) {
            return 'text-left pl-4';
        } else if (index === headers.length - 1 && reverse) {
            return 'text-right pr-2';
        } else {
            return 'text-center px-1';
        }
    };

    return (
        <tr>
            {withGap && <th></th>}
            {headers.map((header, index) => (
                <th
                    key={header.title + header.value + index}
                    scope="col"
                    className={classNames('subheading-two text-white py-4 w-[10%]', conditionalStyles(header, index))}
                >
                    <div
                        onClick={() => {
                            if (updateSortDirection) updateSortDirection(header);
                        }}
                        className={classNames(
                            'flex flex-row items-center gap-1 hover:cursor-pointer justify-center',
                            conditionalStyles(header, index)
                        )}
                    >
                        <span className="text-[11px]">{header.title}</span>
                        {header.sortDirection === SortDirection.DESC && header.value !== 'rank' && (
                            <ArrowDownIcon className="h-3 w-3 text-white border-white" strokeWidth={3} />
                        )}
                        {header.sortDirection === SortDirection.ASC && header.value !== 'rank' && (
                            <ArrowUpIcon className="h-3 w-3 text-white" strokeWidth={3} />
                        )}
                        {header.sortDirection === SortDirection.NONE && header.value !== 'rank' && (
                            <ArrowsUpDownIcon className="h-3 w-3 text-white" strokeWidth={3} />
                        )}
                    </div>
                </th>
            ))}
        </tr>
    );
};

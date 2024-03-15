import { ArrowDownIcon, ArrowUpIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';

interface MatchupTableHeaderProps {
    headers: Array<SortableHeader>;
    reverse?: boolean;
    updateSortDirection?: (columnToSort: SortableHeader) => void;
    withGap?: boolean;
}

export const MatchupTableHeader: React.FC<MatchupTableHeaderProps> = ({ headers, updateSortDirection, reverse, withGap = false }) => {
    const conditionalStyles = (header, index): string => {
        if (header === 'PLAYER' || header?.title?.toUpperCase() === 'PLAYER') {
            return 'w-64 pr-4';
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
                    className={classNames('subheading-two text-white py-4', conditionalStyles(header, index))}
                >
                    <div
                        onClick={() => {
                            if (updateSortDirection) updateSortDirection(header);
                        }}
                        className={classNames(
                            'flex flex-row items-center gap-1 hover:cursor-pointer w-full justify-center',
                            conditionalStyles(header, index)
                        )}
                    >
                        <span>{header.title}</span>
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

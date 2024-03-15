import { SortDirection } from './sort-direction.enum';

export interface SortableHeader {
    title?: string;
    value?: string;
    sortDirection?: SortDirection;
    sortable?: boolean;
}

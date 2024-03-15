import { useState } from 'react';
import { PositionFilter } from 'src/models';
import { Position } from 'src/models/position.type';

interface UsePositionFilters {
    positions: PositionFilter[];
    selectedPosition: PositionFilter;
    selectPosition: (position: Position) => void;
}

export const usePositionFilters = (): UsePositionFilters => {
    const positions: Array<PositionFilter> = [
        { title: 'All Positions', value: null },
        { title: 'G', value: 'G' },
        { title: 'F', value: 'F' },
        { title: 'C', value: 'C' },
    ];
    const [selectedPosition, setSelectedPosition] = useState<PositionFilter>(positions[0]);

    const selectPosition = (position: Position): void => {
        const newSelectedPosition = positions.find((p) => p.value === position);
        if (newSelectedPosition) {
            setSelectedPosition(newSelectedPosition);
        }
    };

    return { positions, selectedPosition, selectPosition };
};

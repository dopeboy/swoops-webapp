import classNames from 'classnames';
import { PositionFilter } from 'src/models';
import { Position } from 'src/models/position.type';

interface PositionFiltersProps {
    positions: Array<PositionFilter>;
    selectedPosition: PositionFilter;
    filterPlayerPosition: (position: Array<Position>) => void;
    selectPosition: (position: Position) => void;
}

export const PositionFilters: React.FC<PositionFiltersProps> = ({ positions, selectedPosition, selectPosition }) => {
    return (
        <div className="flex flex-row gap-0.5 ml-3 my-3" data-tut="player-pool-filters">
            {positions?.map((position, index) => (
                <button
                    key={position.title + index}
                    onClick={() => {
                        selectPosition(position.value);
                    }}
                    className={classNames(
                        index === 0 ? 'rounded-l-lg w-fit px-4' : index === positions.length - 1 ? 'w-fit rounded-r-lg px-5' : 'px-5',
                        selectedPosition.value === position.value ? 'bg-white text-black' : 'bg-[#FDFDFD] text-white bg-opacity-4 ',
                        ' flex items-center justify-center font-semibold h-12 py-3'
                    )}
                >
                    {position.title}
                </button>
            ))}
        </div>
    );
};

import { StarIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import _ from 'lodash';

interface StarRatingProps {
    rating: number;
    size?: string;
}
export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'h-4 w-4' }) => {
    return (
        <div className="flex flex-row items-center justify-center gap-1">
            {_.times(rating || 1, (index) => (
                <StarIcon key={index} className={classNames('text-yellow-400', size)} />
            ))}
        </div>
    );
};

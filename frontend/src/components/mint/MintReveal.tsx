import { FC } from 'react';
import ShareImage from './ShareImage';

interface MintRevealProps {
    count: number;
}

// TODO - Make sure to switch back 3 to count
const MintReveal: FC<MintRevealProps> = ({ count }): JSX.Element => {
    return <div className="flex flex-col items-center">{count > 0 && <ShareImage />}</div>;
};

export default MintReveal;

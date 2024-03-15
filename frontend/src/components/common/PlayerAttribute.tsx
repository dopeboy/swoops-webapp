import classNames from 'classnames';

interface PlayerAttributeProps {
    attributeValue?: string;
    attributeName: string;
    isTopAttribute: boolean;
}
export const PlayerAttribute: React.FC<PlayerAttributeProps> = ({ attributeValue, attributeName, isTopAttribute }) => {
    return (
        <div className="col-span-1 flex flex-col gap-0.5 items-center w-full rounded-lg border-off-black bg-off-black/30 py-2 border">
            <span className="subheading-three text-assist-green uppercase">{attributeName}</span>
            <span
                className={classNames('heading-three uppercase', {
                    'text-yellow-400': isTopAttribute,
                    'text-white': !isTopAttribute,
                })}
            >
                {attributeValue ? Math.round(Number(attributeValue))?.toFixed(0) : '??'}
            </span>
        </div>
    );
};

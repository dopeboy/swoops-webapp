import classnames from 'classnames';
import { ReactNode, ReactElement } from 'react';
import DollarIcon from 'src/components/gm/swoopsGm/DollarIcon';
import useMediaQuery from 'src/hooks/gm/useMediaQuery';

interface IProps {
    color: string;
    children?: ReactNode;
    className?: string;
}

const DollarBadge = (props: IProps): ReactElement => {
    const isDesktop = useMediaQuery('md');

    const { color, children, className } = props;

    return (
        <span className={classnames('rounded p-1 flex items-center w-fit gap-x-1', className)}>
            <DollarIcon color={color} height={isDesktop ? 20 : 12} width={isDesktop ? 20 : 12} />
            <span className="font-display font-medium text-white text-[10px] md:text-base leading-none">{children}</span>
        </span>
    );
};

export default DollarBadge;

import { ReactElement } from 'react';

interface PageHeaderProps {
    title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }): ReactElement => {
    return (
        <div className="pt-4 px-3 sm:px-12">
            <div className="flex justify-between items-center">
                <h1 className="heading-one text-white">{title}</h1>
            </div>
        </div>
    );
};

export default PageHeader;

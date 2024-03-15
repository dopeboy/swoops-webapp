import { ReactElement } from 'react';

const CourtroomHeader = (): ReactElement => {
    return (
        <div className="pt-4 px-12">
            <div className="flex justify-between items-center">
                <h1 className="heading-one text-white">Court</h1>
            </div>
        </div>
    );
};

export default CourtroomHeader;

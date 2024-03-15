import { ReactElement } from 'react';

const Header = (): ReactElement => {
    return (
        <div className="dark:bg-off-black py-8 px-36">
            <div className="flex justify-between ">
                <div className="flex flex-col">
                    <text className="dark:text-white heading-one">HEAD TO HEAD</text>
                </div>
                <div>
                    <button className="w-12 dark:bg-white/4 dark:text-white btn-primary">...</button>
                </div>
            </div>
        </div>
    );
};

export default Header;

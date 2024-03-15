import React, { ReactElement } from 'react';

interface IProps {
    title: string;
}

const TrueStrategySection = (props: IProps): ReactElement => {
    const { title } = props;

    return (
        <div className="relative pb-8">
            <div className="w-full">
                <div className="hidden md:block absolute top-0 left-0 w-full">
                    <div className={` w-[calc((100%-720px)/2)] bg-[url('/images/TrueStragegyGame_2.png')] h-[508px]`} />
                </div>
                <div className="container-sm">
                    <div className="rounded-lg bg-white md:bg-transparent md:bg-[url('/images/TrueStragegyGame.png')]  md:bg-[length:100%_508px] h-[508px] md:bg-no-repeat  ">
                        <h2 className="heading-one py-28 text-center" dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrueStrategySection;

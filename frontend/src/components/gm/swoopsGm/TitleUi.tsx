import React from 'react';

interface IProps {
    title: string;
    description: string;
}

const TitleUi = (props: IProps) => {
    const { title, description } = props;

    return (
        <div className="mb-16">
            <h2 className="heading-one text-white text-center">{title}</h2>
            <p className="text-base text-white font-medium text-center font-display">{description}</p>
        </div>
    );
};

export default TitleUi;

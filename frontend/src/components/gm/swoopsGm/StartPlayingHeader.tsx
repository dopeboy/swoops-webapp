import React, { ReactElement } from 'react';

interface IProps {
    title: string;
    summary: string;
    button: string;
}

const StartPlayingHeader = (props: IProps): ReactElement => {
    const { title, summary, button } = props;

    return (
        <div className="pb-14">
            <h2 className="heading-one text-white font-bold mb-6" dangerouslySetInnerHTML={{ __html: title }} />
            <p className="text-white/64 font-medium text-base font-display" dangerouslySetInnerHTML={{ __html: summary }} />
            <div className="mt-6">
                <button className="btn-rounded-green">{button}</button>
            </div>
        </div>
    );
};

export default StartPlayingHeader;

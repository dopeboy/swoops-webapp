import classNames from 'classnames';
import React, { ReactElement } from 'react';

interface IProps {
    title: string;
    summary: string | JSX.Element;
    button?: string;
    size: 'medium' | 'large';
    mb: string;
}

const WonCard = (props: IProps): ReactElement => {
    const { title, summary, button, size, mb } = props;

    return (
        <div className={classNames(`bg-transparent rounded-lg  border-solid border border-assist-green mb-6 ${mb}`)}>
            <div
                className={classNames(
                    'flex flex-col md:flex-row justify-between md:items-center relative space-y-6 md:space-y-0 pb-6 px-6 md:px-0 md:pb-0',
                    {
                        'md:h-[197px]': size === 'medium',
                        'md:h-[244px]': size === 'large',
                    }
                )}
            >
                <img src="/images/swoops_ball.png" alt="Swoops Ball" className="hidden md:block h-full rounded-l-lg" />
                <div>
                    <h2 className="heading-one text-white mb-3 md:mb-0" dangerouslySetInnerHTML={{ __html: title }} />
                    <p className="font-display font-medium text-base text-white/64">{summary}</p>
                </div>
                {button ? <button className="btn-rounded-green md:mr-16">{button}</button> : <div className="hidden md:block" />}
            </div>
        </div>
    );
};

export default WonCard;
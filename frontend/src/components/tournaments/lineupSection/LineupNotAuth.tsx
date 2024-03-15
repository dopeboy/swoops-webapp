import { ReactElement, useState, useEffect } from 'react';
import 'rc-tabs/assets/index.css';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Button from '../../common/button/Button';
import { ChipPosition, ColorTheme } from '../../common/button/types';

interface LineupNotAuthProps {
    shouldDisplay: boolean;
}

export const LineupNotAuth: React.FC<LineupNotAuthProps> = ({ shouldDisplay }): ReactElement => {
    const router = useRouter();
    const { id } = router.query;
    return (
        <div
            className={classNames({
                hidden: !shouldDisplay,
            })}
        >
            <div className="p-6 md:p-12 w-full bg-gradient-to-r pl-12 from-black/32 to-black border border-gray-700 rounded-lg flex items-center justify-center">
                <div>
                    <img className="hidden sm:inline-block" src="../../../images/StackedCard.png" width={300} />
                </div>

                <div className="flex flex-col">
                    <h1 className="subheading-one sm:heading-two text-white text-left sm:w-96 w-84">Sign-in to play</h1>
                    <span className="text-base text-gray-400 text-left">Sign in to join the tournament.</span>
                    <Button
                        className="mt-12"
                        chipPosition={ChipPosition.Right}
                        colorTheme={ColorTheme.AssistGreen}
                        onClick={() => router.push(`/login?redirectUrl=tournament/${id}/line-up-roster/32&tournamentId=${id}`)}
                    >
                        Go to Sign-in
                    </Button>
                </div>
            </div>
        </div>
    );
};

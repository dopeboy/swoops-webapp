import { ReactElement } from 'react';
import 'rc-tabs/assets/index.css';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Button from '../../common/button/Button';
import { ChipPosition, ColorTheme } from '../../common/button/types';

interface LineupNotQualifiedProps {
    roundAmount: number;
    shouldDisplay: boolean;
    id: string | string[];
}

export const LineupNotQualified: React.FC<LineupNotQualifiedProps> = ({ id, shouldDisplay, roundAmount }): ReactElement => {
    const router = useRouter();
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
                    <h1 className="subheading-one sm:heading-two text-white text-left sm:w-96 w-84">
                        Sorry, you haven't joined this tournament or the reservation time expired
                    </h1>
                    <span className="text-base text-gray-400 text-left">Go to tournaments in order to join a specific tournament</span>
                    <Button
                        className="mt-12"
                        chipPosition={ChipPosition.Right}
                        colorTheme={ColorTheme.AssistGreen}
                        onClick={() => router.push(`/tournaments`)}
                    >
                        Go to Tournaments
                    </Button>
                </div>
            </div>
        </div>
    );
};

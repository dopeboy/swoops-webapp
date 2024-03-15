import { useRouter } from 'next/router';
import { playerRosterRoute } from 'src/lib/routes';
import { isUserLoggedIn } from 'src/lib/utils';
import Button from '../components/common/button/Button';
import { ChipPosition, ColorTheme } from '../components/common/button/types';

interface ForOhFourPageProps {
    noRedirect?: boolean;
}

const FourOhFour: React.FC<ForOhFourPageProps> = ({ noRedirect }) => {
    const router = useRouter();

    return (
        <div className="flex flex-col px-2 sm:px-0 items-center justify-center w-full h-screen bg-cover bg-[url('/images/LoginBackground.png')] bg-center bg-no-repeat bg-scroll bg-blend-color-soft-light">
            <div className="p-6 md:p-12 max-w-7xl md:w-[30%] bg-gradient-to-r from-black/32 to-black border border-gray-700 rounded-lg flex flex-col items-center justify-center">
                <h1 className="heading-one text-white text-center w-80">Lost in the Sauce?</h1>
                <span className="text-base text-gray-400 text-center">Sorry, page not found.</span>
                {!noRedirect && isUserLoggedIn() && (
                    <Button
                        className="mt-12"
                        chipPosition={ChipPosition.Right}
                        colorTheme={ColorTheme.AssistGreen}
                        onClick={() => router.push(playerRosterRoute)}
                    >
                        Go to Roster
                    </Button>
                )}
            </div>
        </div>
    );
};

export default FourOhFour;

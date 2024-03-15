import { RoundedButton } from '../common/RoundedButton';
import { Typography } from '../common/Typography';

export const MintDetails: React.FC = () => {
    return (
        <>
            <div className="flex flex-col items-center justify-center gap-3">
                <RoundedButton
                    onClick={() => window.open('https://blog.playswoops.com/swoops-overview/', '_blank')}
                    maxWidth="xl"
                    text="What is Swoops?"
                    borderColor="white"
                    hoverBackgroundColor="white"
                />
                <div className="max-w-lg">
                    <Typography text="Click the button above to learn more about the ins and outs of Swoops" variant="subheading-one" />
                </div>
            </div>
        </>
    );
};

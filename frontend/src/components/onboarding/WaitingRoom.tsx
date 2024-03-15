import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { verifyEmail } from '../../lib/routes';
import { RoundedButton } from '../common/RoundedButton';

const WaitingRoom = (): ReactElement => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center gap-4 mx-2">
            <p className="leading-[1.1] tracking-[.04em] text-[14px] font-[400] uppercase text-center ">
                In order to start using your Swoops account, you need to confirm your email address.
            </p>
            <RoundedButton
                onClick={() => router.push(verifyEmail)}
                borderColor="secondary"
                hoverBackgroundColor="secondary"
                maxWidth="lg"
                text="Haven't received an email?"
            />
        </div>
    );
};

export default WaitingRoom;

import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { useDisconnect } from 'wagmi';
import { logoutUserFromClient } from 'src/lib/utils';
import { loginRoute } from '../../lib/routes';
import { RoundedButton } from '../common/RoundedButton';

const EmailVerified = (): ReactElement => {
    const router = useRouter();
    const { disconnect } = useDisconnect();

    const logout = () => {
        router.push({
            pathname: loginRoute,
            query: { lockerRoom: true },
        });
        disconnect();
        logoutUserFromClient();
    };

    return (
        <div className="flex flex-col items-center m-2">
            <RoundedButton onClick={logout} borderColor="secondary" hoverBackgroundColor="secondary" text="Go to Login" />
        </div>
    );
};

export default EmailVerified;

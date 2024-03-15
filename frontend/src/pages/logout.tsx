import { ReactElement, useEffect } from 'react';
import { logoutUserFromClient } from 'src/lib/utils';
import { loginRoute } from 'src/lib/routes';
import { useRouter } from 'next/router';
import { useDisconnect } from 'wagmi';
import { GeneralPageWrapper } from 'src/components/common/GeneralPageWrapper';
import { GeneralPageHeader } from 'src/components/common/GeneralPageHeader';

const EmailVerifiedPage = (): ReactElement => {
    const router = useRouter();
    const { disconnect } = useDisconnect();

    const logoutAndRedirect = () => {
        disconnect();
        logoutUserFromClient();
        router.push({
            pathname: loginRoute,
        });
    };

    useEffect(() => {
        logoutAndRedirect();
    }, []);

    return (
        <GeneralPageWrapper>
            <GeneralPageHeader title="Signing out..." accent="secondary" size="3xl" />
        </GeneralPageWrapper>
    );
};

export default EmailVerifiedPage;

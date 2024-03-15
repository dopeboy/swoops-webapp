import { ReactElement } from 'react';
import withAuthAndEmailUnverified from 'src/components/common/withAuthAndEmailUnverified';
import WaitingRoom from 'src/components/onboarding/WaitingRoom';
import { GeneralPageWrapper } from 'src/components/common/GeneralPageWrapper';
import { GeneralPageHeader } from 'src/components/common/GeneralPageHeader';
import { GeneralPageContent } from 'src/components/common/GeneralPageContent';

const WaitingRoomPage = (): ReactElement => {
    return (
        <GeneralPageWrapper>
            <GeneralPageHeader title="Check your inbox" accent="primary" />
            <GeneralPageContent>
                <WaitingRoom />
            </GeneralPageContent>
        </GeneralPageWrapper>
    );
};

export default withAuthAndEmailUnverified(WaitingRoomPage);

import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { TableLoadingSpinner } from 'src/components/common/TableLoadingSpinner';
import { getUserTeam } from 'src/lib/utils';
import { LayoutDecider } from 'src/components/common/LayoutDecider';

const LockerRoomBasePage: NextPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const { onboarding, showTutorialProgress } = router.query;

    const getTeam = async (): Promise<void> => {
        try {
            const team = await getUserTeam();
            if (!team) {
                router.push('/login');
                return;
            }
            router.push({
                pathname: `/locker-room/${team.id}/roster`,
                query: onboarding === 'true' ? { onboarding: 'true', showTutorialProgress: 'true' } : {},
            });
        } catch (err) {
            console.error('Error getting team' + err);
            router.push('/login');
            setLoading(false);
        }
    };

    useEffect(() => {
        getTeam();
    }, []);

    return (
        <LayoutDecider>
            <TableLoadingSpinner loading={loading} />
        </LayoutDecider>
    );
};

export default LockerRoomBasePage;

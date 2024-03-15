import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { PageLoadingWrapper } from './PageLoadingWrapper';

interface TransitionLoadingProps {
    loading: boolean;
    setLoading: (loading: boolean) => void;
}
export const TransitionLoading: React.FC<TransitionLoadingProps> = ({ loading, setLoading }) => {
    const router = useRouter();
    useEffect(() => {
        router.events.on('routeChangeStart', routeChangeStart);
        router.events.on('routeChangeComplete', routeChangeEnd);
        router.events.on('routeChangeError', routeChangeError);
        return () => {
            router.events.off('routeChangeStart', routeChangeStart);
            router.events.off('routeChangeComplete', routeChangeEnd);
            router.events.off('routeChangeError', routeChangeError);
        };
    }, []);

    const routeChangeStart = () => {
        setLoading(true);
    };
    const routeChangeEnd = () => {
        setLoading(false);
    };

    const routeChangeError = () => {
        setLoading(false);
    };

    return <PageLoadingWrapper loading={loading}></PageLoadingWrapper>;
};

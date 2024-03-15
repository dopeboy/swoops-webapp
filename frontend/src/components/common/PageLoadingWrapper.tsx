import { LoadingSpinner } from './LoadingSpinner';

interface LoadingWrapperProps {
    loading: boolean;
    children?: React.ReactNode;
}

export const PageLoadingWrapper: React.FC<LoadingWrapperProps> = ({ children, loading }) => {
    return (
        <>
            {loading ? (
                <div className="h-screen bg-black w-full">
                    <div className="flex h-full w-full flex-col items-center justify-center">
                        <LoadingSpinner className="w-10 h-10" />
                    </div>
                </div>
            ) : (
                <>{children}</>
            )}
        </>
    );
};

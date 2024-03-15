import { LoadingSpinner } from '../common/LoadingSpinner';

interface TorusLoginButtonProps {
    login: () => void;
    loading: boolean;
}
export const TorusLoginButton: React.FC<TorusLoginButtonProps> = ({ login, loading }) => {
    return (
        <button
            className="block text-white w-full uppercase max-w-[300px] py-[15px] px-[30px] border-[4px] border-primary cursor-pointer mb-[10px] rounded-full bg-transparent hover:bg-primary"
            onClick={login}
        >
            {loading ? (
                <LoadingSpinner bgColor="transparent" fill="#F5F5F5" className="h-6 w-6" />
            ) : (
                <div className="flex flex-row items-center justify-center gap-1.5 text-body font-[500]">
                    <span>Sign in Using </span>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                        alt='Google "G" Logo'
                        className="h-6 w-6 p-0.5 rounded-full bg-white"
                    />
                    Or Email
                </div>
            )}
        </button>
    );
};

import { ReactElement } from 'react';

interface IProps {
    handleConnected: () => void;
}

const SignUp = (props: IProps): ReactElement => {
    const { handleConnected } = props;

    return (
        <div className="rounded-lg border border-solid border-white/16 relative py-16  px-4">
            <div className="max-w-[29rem] mx-auto ">
                <h1 className="heading-one text-white text-center mb-2.5">Start BallN With Swoops</h1>
                <p className="font-medium text-white/64 text-base text-center ">
                    You’ll need the MetaMask browser extension and an Ethereum wallet to use Swoops.
                    <a className="underline" href="/#">
                        {' '}
                        Learn more about MetaMask and Ethereum
                    </a>
                    .
                </p>
                <div className="mt-12 ">
                    <button className="btn-rounded-white py-3   mx-auto flex items-center" onClick={handleConnected}>
                        <img src="/images/Metamask.png" className="h-auto hidden sm:block mr-4" alt="Metamask" />
                        <span>Connect with Metamask</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUp;

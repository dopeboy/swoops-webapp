import { ReactElement, ChangeEvent, useState } from 'react';
import { useRouter } from 'next/router';

const AddEmailAddress = (): ReactElement => {
    const [email, setEmail] = useState<string>('');

    const router = useRouter();

    return (
        <div className="rounded-lg border border-solid border-white/16 relative py-16  px-4">
            <div className="max-w-[29rem] mx-auto ">
                <h1 className="heading-one text-white text-center mb-2.5">You’re Connected</h1>
                <p className="font-medium text-white/64 text-base text-center ">
                    You’ll also need to confirm your email address before competing in a Swoops game. We need your email address to let you know when
                    you’ve won money.
                </p>
                <div className="mt-12 space-y-4">
                    <div className="relative flex flex-wrap w-full lg:w-auto items-stretch grow ">
                        <span className="pl-5 pr-1  bg-white/4 rounded-l-lg flex items-center py-1.5  leading-6 text-base font-normal text-center whitespace-nowrap focus:border-none">
                            <img src="/images/email.png" className="text-white h-6 w-6" alt="Email" />
                        </span>
                        <input
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setEmail(e.target.value);
                            }}
                            className="pl-2 h-12 bg-white/4  rounded-r-lg rounded-l-none text-white   placeholder:text-white/32 text-base   font-display font-bold grow  appearance-none  focus:outline     placeholder:text-white/32 focus:text-white text-white"
                            placeholder="me@win.xyz"
                        />
                    </div>
                    <button
                        className="btn-rounded-white  w-full "
                        onClick={() => {
                            router.push('build/roster');
                        }}
                    >
                        Start Playing
                    </button>
                    <button
                        className="btn-outline w-full "
                        onClick={() => {
                            router.push('build/roster');
                        }}
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEmailAddress;

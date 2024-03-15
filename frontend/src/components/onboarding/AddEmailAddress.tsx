import { ReactElement, ChangeEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { AccountsService } from 'src/lib/api';
import { getUserDetail } from 'src/lib/utils';
import { playerRosterRoute, waitingRoom } from '../../lib/routes';
import { trackEvent } from '../../lib/tracking';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import * as Sentry from '@sentry/nextjs';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { RoundedButton } from '../common/RoundedButton';

const AddEmailAddress = (): ReactElement => {
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [termsOfServiceModalOpen, setTermsOfServiceModalOpen] = useState<boolean>(false);
    const [privacyPolicyModalopen, setPrivacyPolicyModal] = useState<boolean>(false);

    const router = useRouter();

    const sendEmail = async (e): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        const user = getUserDetail();
        try {
            const { is_verified } = await AccountsService.accountsPartialUpdate(user?.id.toString(), { email, team: null });
            if (is_verified) {
                router.push(playerRosterRoute);
            } else {
                router.push(waitingRoom);
            }
        } catch (err) {
            toast.error('There was an error while setting up your email. This email is already being used.');
            setLoading(false);
            Sentry.captureException(err, { extra: { email } });
        }
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center w-full max-w-[29rem]">
                <form onSubmit={sendEmail} className="w-full flex flex-col items-center justify-center">
                    <div className="relative flex flex-col items-center justify-center w-full max-w-[300px]">
                        <span className="absolute left-3 top-1/4">
                            <EnvelopeIcon className="h-6 w-6 text-white" />
                        </span>
                        <input
                            value={email}
                            type="email"
                            id="email"
                            required
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setEmail(e.target.value);
                            }}
                            className="p-[10px] w-full h-[45px] max-w-[300px] text-center text-[17px] rounded-full accent-primary bg-transparent mb-[10px] border border-white mt-1 focus:outline-none focus:ring-0 focus:border-primary text-white placeholder:text-[#D6D6D6] opacity-100"
                            placeholder="me@win.xyz"
                        />
                    </div>
                    <div className="font-medium text-base flex flex-row gap-2 justify-center items-center max-w-[300px] lg:max-w-[430px] mt-4 mb-6">
                        <input
                            id="link-checkbox"
                            type="checkbox"
                            value=""
                            className="w-5 h-5 text-primary rounded-lg border-gray-100 border-2 focus:border-gray-100 focus:ring-0 bg-transparent"
                        />
                        <label htmlFor="link-checkbox" className="ml-2 text-white leading-[1.3] tracking-[.04em] text-[14px] uppercase font-[400]">
                            {'By signing in, you agree the '}
                            <a href="#" className="text-blue-600 underline underline-offset-2" onClick={() => setTermsOfServiceModalOpen(true)}>
                                Terms of service
                            </a>
                            {' and '}
                            <a href="#" className="text-blue-600 underline underline-offset-2" onClick={() => setPrivacyPolicyModal(true)}>
                                Privacy Policy
                            </a>
                            {', including Cookie Use.'}
                        </label>
                    </div>
                    <RoundedButton
                        text="Verify Email"
                        loading={loading}
                        onClick={() => trackEvent('Verify email button clicked')}
                        borderColor="secondary"
                        hoverBackgroundColor="secondary"
                    />
                </form>
            </div>
            <TermsOfServiceModal open={termsOfServiceModalOpen} setOpen={(openValue: boolean) => setTermsOfServiceModalOpen(openValue)} />
            <PrivacyPolicyModal open={privacyPolicyModalopen} setOpen={(openValue: boolean) => setPrivacyPolicyModal(openValue)} />
        </>
    );
};

export default AddEmailAddress;

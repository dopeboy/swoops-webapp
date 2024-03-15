import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/router';
import { ModalWrapper } from '../../common/ModalWrapper';
import { useEffect } from 'react';
import { trackEvent } from '../../../lib/tracking';

interface TimeoutModalProps {
    open: boolean;
}
export const TimeoutModal: React.FC<TimeoutModalProps> = ({ open }) => {
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady) return;
        trackEvent('User submission timeout');
    }, []);
    return (
        <ModalWrapper open={open}>
            <Dialog.Panel className="relative bg-black border-1 border-off-black overflow-y-show rounded-lg text-left shadow-lg shadow-black transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                <div className="flex flex-col divide-y-1 divide-off-black justify-start">
                    <div className="subheading-one text-white px-3 pb-2 pt-3">Time Expired</div>
                    <div className="text-sm text-white px-3 py-3">
                        You ran out of time! To join a tournament, you have 3 minutes to select and submit your lineup. <br /> Return to the
                        tournament page to find a new tournament and keep an eye on the clock next time.
                    </div>
                    <div className="flex flex-row items-center justify-end py-3 px-3">
                        <button
                            onClick={() => {
                                router.push('/tournaments');
                            }}
                            className="pt-1.5 pb-2 px-6 btn-rounded-green "
                        >
                            <span className="detail-one text-black">Go to Tournaments</span>
                        </button>
                    </div>
                </div>
            </Dialog.Panel>
        </ModalWrapper>
    );
};

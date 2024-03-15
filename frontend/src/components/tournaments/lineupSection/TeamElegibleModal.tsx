import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ModalWrapper } from 'src/components/common/ModalWrapper';

interface TimeoutModalProps {
    open: boolean;
    round: string | string[];
    id: string | string[];
}

export const TeamElegibleModal: React.FC<TimeoutModalProps> = ({ open, round, id }) => {
    const router = useRouter();
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        setOpenModal(open);
    }, [open]);

    return (
        <ModalWrapper open={openModal}>
            <Dialog.Panel className="relative bg-black border-1 border-off-black overflow-y-show rounded-lg text-left shadow-lg shadow-black transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                <div className="flex flex-col divide-y-1 divide-off-black justify-start">
                    <div className="subheading-one text-white px-3 pb-2 pt-3">Congratulations!</div>
                    {/*
                    <div className="text-base text-white px-3 py-3">
                        You have entered the tournament! You will be notified once games have completed. <br /> <br />
                        Now more good news! By participating in the event, you have now earned an off-chain Swoopster. To turn this player into a
                        fully-owned, on-chain player, click the button below and complete our new user tutorial.
                    </div>
                    */}
                    <div className="text-base text-white px-3 py-3">
                        You have entered the tournament! You will be notified once games have completed. <br /> <br />
                        Now more good news! By participating in the event, you have now earned an off-chain Swoopster. To turn this player into a
                        fully-owned, on-chain player, click the button below and complete our new user tutorial.
                    </div>
                    <div className="flex flex-row items-center justify-end py-3 px-3">
                        <button
                            onClick={() => {
                                setOpenModal(false);
                                router.push(`/tutorial-v2`);
                                //router.push(`/locker-room`);
                            }}
                            className="pt-1.5 pb-2 px-6 btn-rounded-green "
                        >
                            <span className="detail-one text-black">Go to Tutorial</span>
                            {/*<span className="detail-one text-black">Go to your Locker Room</span>*/}
                        </button>
                    </div>
                </div>
            </Dialog.Panel>
        </ModalWrapper>
    );
};

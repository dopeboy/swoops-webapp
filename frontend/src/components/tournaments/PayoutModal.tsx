import { Dialog } from '@headlessui/react';
import { ModalWrapper } from '../common/ModalWrapper';
import { getPrice } from 'src/lib/utils';

interface PayoutModalProps {
    open: boolean;
    setOpen: (openValue: boolean) => void;
    payoutList: any[];
}
export const PayoutModal: React.FC<PayoutModalProps> = ({ open, setOpen, payoutList }) => {
    return (
        <ModalWrapper open={open}>
            <Dialog.Panel className="relative bg-black border-1 border-off-black overflow-y-show rounded-lg text-left shadow-lg shadow-black transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                <div className="flex flex-col divide-y-1 divide-off-black justify-start">
                    <div className="subheading-one text-white px-3 pb-2 pt-3">Payout Breakdown</div>
                    <div className="text-base text-white px-3 py-3">
                        <div className="flex flex-col text-center">
                            {payoutList.map((payout) => (
                                <h1 className="subheading-one text-white">
                                    {payout.position} <span className="text-assist-green"> {getPrice(payout.amount)} </span>
                                </h1>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-end py-3 px-3">
                        <button onClick={() => setOpen(false)} className="pt-1.5 pb-2 px-6 btn-rounded-green">
                            <span className="detail-one text-black">Close</span>
                        </button>
                    </div>
                </div>
            </Dialog.Panel>
        </ModalWrapper>
    );
};

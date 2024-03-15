import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Button from './button/Button';
import { ColorTheme } from './button/types';
import { ModalWrapper } from './ModalWrapper';
interface GeneralNoticeModalProps {
    open: boolean;
    setOpen: (openValue: boolean) => void;
    title: string;
    body: string;
}
export const GeneralNoticeModal: React.FC<GeneralNoticeModalProps> = ({ title, body, open, setOpen }) => {
    return (
        <ModalWrapper open={open}>
            <Dialog.Panel className="relative bg-black border-1 border-off-black overflow-y-show rounded-lg text-left shadow-lg shadow-black transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
                <div className="flex flex-col divide-y-1 divide-off-black justify-start">
                    <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-col items-start justify-start gap-0 px-4 py-5">
                            <div className="subheading-one text-white ">{title}</div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="rounded-full p-1 m-2 focus:outline-none hover:bg-off-black/90 flex flex-col items-center justify-center"
                        >
                            <XMarkIcon className="h-5 w-5 text-white" />
                        </button>
                    </div>
                    <div className="px-4 py-5 flex flex-col items-center justify-center w-full text-slate-50">{body}</div>
                    <div className="flex flex-row items-center justify-end py-5 px-4">
                        <div className="flex flex-row items-center justify-end w-full gap-2">
                            <Button onClick={() => setOpen(false)} className="subheading-two" colorTheme={ColorTheme.White}>
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog.Panel>
        </ModalWrapper>
    );
};

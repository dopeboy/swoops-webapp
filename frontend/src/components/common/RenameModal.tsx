import { Dialog } from '@headlessui/react';
import { ModalWrapper } from '../common/ModalWrapper';
import { XMarkIcon } from '@heroicons/react/24/solid';

export interface RenameModalProps {
    title: string;
    subtitle?: string;
    subtitleChildren?: React.ReactNode;
    bodyChildren: React.ReactNode;
    footerChildren: React.ReactNode;
    showCloseButton?: boolean;
    open: boolean;
    setOpen: (openValue: boolean) => void;
}
export const RenameModal: React.FC<RenameModalProps> = ({
    open,
    setOpen,
    title,
    subtitle,
    subtitleChildren,
    bodyChildren,
    footerChildren,
    showCloseButton,
}) => {
    return (
        <ModalWrapper open={open}>
            <Dialog.Panel className="relative bg-black border-1 border-off-black overflow-y-show rounded-lg text-left shadow-lg shadow-black transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
                <div className="flex flex-col divide-y-1 divide-off-black justify-start">
                    <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-col items-start justify-start gap-0 px-4 py-5">
                            <div className="subheading-one text-white ">{title}</div>
                            <div className="text-sm text-white/64 pt-0">{subtitle}</div>
                            {subtitleChildren}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-full p-1 m-2 focus:outline-none hover:bg-off-black/90 flex flex-col items-center justify-center"
                            >
                                <XMarkIcon className="h-5 w-5 text-white" />
                            </button>
                        )}
                    </div>
                    <div className="px-4 py-5 flex flex-col items-center justify-center w-full">{bodyChildren}</div>
                    <div className="flex flex-row items-center justify-end py-5 px-4">{footerChildren}</div>
                </div>
            </Dialog.Panel>
        </ModalWrapper>
    );
};

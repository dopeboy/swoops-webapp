import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { ModalWrapper } from './ModalWrapper';

interface ContactUsModalProps {
    open: boolean;
    setOpen: (openValue: boolean) => void;
}
export const ContactUsModal: React.FC<ContactUsModalProps> = ({ open, setOpen }) => {
    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <Dialog.Panel className="rrelative bg-black border-1 border-off-black overflow-y-show rounded-lg text-left shadow-lg shadow-black transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                <div className="flex flex-col items-start w-full divide-y-1 divide-black">
                    <div className="flex flex-row items-center justify-between px-4 pt-4 pb-3 w-full">
                        <div className="subheading-one text-white">Report an issue</div>
                        <button className="mb-1" onClick={() => setOpen(false)}>
                            <XMarkIcon className="text-white w-6 h-6" />
                        </button>
                    </div>
                    <div className="px-4 py-3 pb-1 text-[12px] text-white w-full">
                        Sorry you've experienced an issue! You can reach out to us via Discord and we'll be on it as soon as possible.
                    </div>
                    <div className="p-4 flex flex-row items-center justify-center w-full gap-3 mt-3">
                        <a
                            href="https://discord.gg/playswoops"
                            target="_blank"
                            className="hover:cursor-pointer border-1 border-black flex flex-row items-center gap-2 py-2 px-4 rounded-lg btn-rounded-green"
                        >
                            <img src="/images/Discord.svg" className="h-4 w-4" />
                            <span className="subheading-two">Discord</span>
                        </a>
                    </div>
                </div>
            </Dialog.Panel>
        </ModalWrapper>
    );
};

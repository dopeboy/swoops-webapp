import { Dialog } from '@headlessui/react';
import { ModalWrapper } from '../common/ModalWrapper';

interface EducationalModalProps {
    open: boolean;
    setOpen: (openValue: boolean) => void;
}
export const EducationalModal: React.FC<EducationalModalProps> = ({ open, setOpen }) => {
    return (
        <ModalWrapper open={open}>
            <Dialog.Panel className="relative bg-black border-1 border-off-black overflow-y-show rounded-lg text-left shadow-lg shadow-black transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                <div className="flex flex-col divide-y-1 divide-off-black justify-start">
                    <div className="subheading-one text-white px-3 pb-2 pt-3">Welcome to Swoops Locker Room</div>
                    <div className="text-base text-white px-3 py-3">
                        <ul className="mb-8 space-y-4 text-left">
                            <li className="flex items-center space-x-3">
                                <svg
                                    className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    ></path>
                                </svg>
                                <span>
                                    Your locker room is where your players prepare for their next game. In here, you can view the players on your
                                    roster, their season stats, and learn more about the game among other things!
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg
                                    className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    ></path>
                                </svg>
                                <span>
                                    In the near future, you will be able to name your locker room, upload a logo, and establish a team brand and
                                    history. After all, Swoops is built by you, for you.
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg
                                    className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    ></path>
                                </svg>
                                <span>
                                    You will have the opportunity to name our players as well! It's important to note that once you update your
                                    player's pre-generated name it will stay with it for the remainder of its career.
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg
                                    className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    ></path>
                                </svg>
                                <span>
                                    The locker room is a source of pride. It's here that you can develop your team's lore and share your team and
                                    player pages with the world!
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex flex-row items-center justify-end py-3 px-3">
                        <button onClick={() => setOpen(false)} className="pt-1.5 pb-2 px-6 btn-rounded-green">
                            <span className="detail-one text-black">Go to my Locker Room</span>
                        </button>
                    </div>
                </div>
            </Dialog.Panel>
        </ModalWrapper>
    );
};

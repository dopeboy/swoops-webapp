/* eslint-disable @typescript-eslint/no-empty-function */
import Modal from 'react-modal';
import { useRouter } from 'next/router';
import { FireIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface LineupSubmittedModalProps {
    isOpen: boolean;
    streak: number;
    setOpenModal: (isOpen: boolean) => void;
}
export const LineupSubmittedModal: React.FC<LineupSubmittedModalProps> = ({ isOpen, setOpenModal, streak }) => {
    const router = useRouter();

    const resultTime = '6:30 PM PT / 9:30 PM ET';
    const routeToFullRecap = (): void => {
        router.push('/gm/me');
    };

    const close = (): void => {
        setOpenModal(false);
    };
    return (
        <Modal
            isOpen={isOpen}
            className="absolute sm:h-auto p-6 top-1/2 left-1/2 -mr-[50%] w-[95%] sm:w-full max-w-[400px] bg-black border border-solid border-black rounded-2xl right-auto bottom-auto transform-translate-50-50"
            bodyOpenClassName=""
            onRequestClose={() => {}}
        >
            <div className="relative z-100 flex flex-col items-center justify-center">
                <div className="absolute -top-3 -right-3">
                    <XMarkIcon className="h-5 w-5 text-white hover:cursor-pointer" onClick={close} />
                </div>
                <div className="flex flex-col items-center justify-center gap-4 pb-4">
                    <div className="flex flex-col items-center justify-center gap-1 -mt-2">
                        <h1 className="heading-one text-white">Submitted!</h1>
                        <p className="font-extralight text-white text-xs">Come back at {resultTime} for your results.</p>
                    </div>
                    <div className="max-w-[300px] rounded-lg px-4 py-2 mt-3">
                        <div className="flex flex-row items-center justify-end gap-2 w-full">
                            <div className="flex items-center justify-center p-2 rounded-full bg-secondary">
                                <FireIcon className="text-white h-6 w-6 md:h-8 md:w-8" />
                            </div>
                            <div className="flex flex-col items-start justify-start">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:gap-1.5">
                                    <span className="text-[12x] uppercase font-header font-bold md:heading-two text-white">{streak}</span>
                                    <span className="text-[8px] sm:text-[10px] uppercase font-header font-bold subheading-two text-white -mt-1 sm:mt-0 sm:-mb-2">
                                        Days 
                                    </span>
                                </div>
                                <span className="text-[8px] md:text-[12px] uppercase font-header md:heading-three text-slate-300 sm:-mt-2">
                                    Streak
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-2.3 flex flex-col-reverse sm:flex-row sm:items-center justify-center pt-5 gap-y-6">
                    <button className="mr-2 rounded-lg px-6 py-3 heading-three bg-white w-full" onClick={routeToFullRecap}>
                        Your stats
                    </button>
                </div>
            </div>
        </Modal>
    );
};

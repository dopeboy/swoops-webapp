import Modal from 'react-modal';
import { useRouter } from 'next/router';

const OGModal = (props) => {
    const {isOpen, setOpenModal } = props
    const router = useRouter();

    return (
        <Modal
            isOpen={isOpen}
            className="absolute h-screen sm:h-auto p-4 rounded-none top-1/2 left-1/2 -mr-[50%] w-full max-w-[680px] bg-black border border-solid border-black p-0 sm:rounded-lg right-auto bottom-auto transform-translate-50-50"
            bodyOpenClassName=""
            onRequestClose={() => {
            }}
        >
            <div className="hidden md:block z-100">
                <div className="flex flex-col h-full">
                    <div className="flex justify-center items-center">
                        <img className="h-[400px] object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/gm/desktop/1.png" alt="" />
                    </div>
                </div>
                <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center justify-end pt-5 border-t border-solid  border-white/8 gap-y-6">
                    <button className="mr-2 btn-rounded-green bg-assist-green w-40" onClick={() => router.push('/tutorial-v2')}>
                        Join
                    </button>
                    <button className="btn-rounded-white bg-white w-40" onClick={() => setOpenModal(false)}>
                        Close
                    </button>
                </div>
            </div>
            <div className="md:hidden z-100">
                <div className="flex flex-col h-full">
                    <div className="flex justify-center items-center">
                        <img className="object-scale-down max-h-full drop-shadow-md rounded-md m-auto" src="/images/gm/desktop/1.png" alt="" />
                    </div>
                </div>
                <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center justify-end pt-5 border-t border-solid  border-white/8 gap-y-3">
                    <button className="btn-rounded-white bg-white w-full" onClick={() => setOpenModal(false)}>
                        Close
                    </button>
                    <button className="mr-2 w-full btn-rounded-green bg-assist-green" onClick={() => router.push('/tutorial-v2')}>
                        Join
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default OGModal;
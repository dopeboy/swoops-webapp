import React, { useState } from 'react';
import Modal from 'react-modal';
import config from 'tailwind.config';

interface IProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 600,
        borderRadius: 16,
        background: config.theme.extend.colors.black,
        padding: 0,
        border: `1px solid ${config.theme.extend.colors.black}`,
    },
};

const NewPlayerNoteModal = ({ open, setOpen }: IProps) => {
    const [note, setNote] = useState<string>('');

    return (
        <Modal
            isOpen={open}
            style={customStyles}
            onRequestClose={() => {
                setOpen(false);
            }}
        >
            <div className="flex items-start space-between py-5 px-5 uppercase border-b border-solid border-white/8 w-full">
                <h2 className="heading-three text-white">New player note</h2>
            </div>
            <div className="relative py-5 px-5 flex-auto">
                <label htmlFor="note" className="block text-sm font-medium text-white">
                    Note
                </label>
                <div className="mt-1.5">
                    <textarea
                        id="note"
                        rows={5}
                        name="note"
                        placeholder="What would you like to note?"
                        onChange={(e) => setNote(e.target.value)}
                        value={note}
                        required
                        className="resize-none border-none bg-white/4 appearance-none block w-full px-3 py-2  rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder:text-white/32 focus:text-white text-white"
                    />
                </div>
            </div>
            <div className="w-full flex items-center justify-end px-5 py-5 border-t border-solid  border-white/8 ">
                <button
                    className="btn-rounded-green"
                    onClick={() => {
                        setOpen(false);
                    }}
                >
                    Save
                </button>
            </div>
        </Modal>
    );
};

export default NewPlayerNoteModal;

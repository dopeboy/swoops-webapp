import { ReactElement } from 'react';

const NotesTable = (): ReactElement => {
    const noteIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

    const notes = noteIds.map((id) => ({
        id: `noteId-${id}`,
        noteText:
            'Excellent defense, a defensive beast, and progressing very quickly.  This robot will be incredibly valuable after a few more tournaments.',
        createdTime: 'someTime',
        lastEditedTime: 'someEditedTime',
    }));

    const renderNote = (note) => {
        return (
            <tr key={note.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">
                    <div className="py-2">{note.noteText}</div>
                    <div className="py-2 text-white/64">Created yestered * Edited Today</div>
                </td>

                <td>
                    <button className="text-white"> Edit </button>
                </td>
            </tr>
        );
    };

    return (
        <div className="flex flex-col bg-black px-36">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/64">{notes.map(renderNote)}</table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesTable;

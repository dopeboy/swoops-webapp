import { ReactElement, useState } from 'react';
import EmbeddedNavBar, { EmbeddedNavbarRoute } from '../common/EmbeddedNavBar';
import SearchBar from '../common/SearchBar';
import { useRouter } from 'next/router';
import NewPlayerNoteModal from './NewPlayerNoteModal';
import ContextMenu from '../common/ContextMenu';

const mainRoutes: EmbeddedNavbarRoute[] = [
    {
        path: 'roster',
        title: 'Roster',
    },
    {
        path: 'games',
        title: 'Games',
    },
];

const playerRoutes: EmbeddedNavbarRoute[] = [
    {
        path: 'games',
        title: 'Games',
    },
    {
        path: 'notes',
        title: 'Notes',
    },
];

interface LockerRoomHeaderProps {
    title: string;
    subtitle?: string;
    children?: JSX.Element;
}

const LockerRoomHeader = (props: LockerRoomHeaderProps): ReactElement => {
    const { title, subtitle, children } = props;
    const [openNote, setOpenNote] = useState<boolean>(false);

    const router = useRouter();
    const { uuid } = router.query;
    const isPlayerProfileRoute = !!uuid;
    const routesToUse = isPlayerProfileRoute ? playerRoutes : mainRoutes;

    return (
        <div className="dark">
            <div className="dark:bg-off-black px-36 pt-8">
                <div className="flex justify-between">
                    <div className="flex flex-col">
                        <text className="dark:text-white heading-one">{title}</text>
                        <text className="header-four text-white/64">{subtitle}</text>
                    </div>
                    <div className="flex flex-row justify-center">
                        <ContextMenu />
                        {!isPlayerProfileRoute && <button className="w-44 pl-2 dark:bg-white btn-primary rounded-br-3xl ml-2"> add players </button>}
                        {isPlayerProfileRoute && (
                            <>
                                <button
                                    className="w-44 pl-2 dark:bg-white
                                     btn-primary rounded-br-3xl ml-2"
                                    onClick={() => setOpenNote(true)}
                                >
                                    Add note
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {children}
                <EmbeddedNavBar routesToUse={routesToUse} />
                {/* we'll add back post-MVP */}
                {/* <div className="py-4">
                    <SearchBar />
                </div> */}
            </div>
            <NewPlayerNoteModal open={openNote} setOpen={setOpenNote} />
        </div>
    );
};

export default LockerRoomHeader;

import { ResponsiveNavbar } from './ResponsiveNavbar';

const AuthedLayout = (props): JSX.Element => {
    return (
        <>
            <ResponsiveNavbar />
            <main className="dark" role="main">
                <div className="pt-8 dark:bg-off-black">{props.children}</div>
            </main>
        </>
    );
};

export default AuthedLayout;

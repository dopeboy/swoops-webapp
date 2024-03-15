import { ReactElement, useEffect } from 'react';
import withAuth from 'src/components/common/withAuth';
import { trackPageLanding } from '../lib/tracking';

const UnderMaintenancePage = (): ReactElement => {

    useEffect(() => {
        trackPageLanding(`Email verification successful`);
    }, []);

    return (
        <div>
            <div className="h-screen w-full flex flex-col justify-center bg-[url('/images/LoginBackground.png')] bg-cover bg-no-repeat">
                <div className="container-xs">
                    <div className="rounded-lg border from-black/32 to-black bg-gradient-to-r border-solid border-white/16 relative py-16  px-4">
                        <div className="max-w-[29rem] mx-auto ">
                            <h1 className="heading-one text-white text-center mb-2.5">Under maintenance.</h1>
                            <h2 className="text-white text-xl text-center mb-2.5">Swoops game incoming 👀 🔥 </h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuth(UnderMaintenancePage);

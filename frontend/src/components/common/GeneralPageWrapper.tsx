interface GeneralPageWrapperProps {
    children: React.ReactNode;
}
export const GeneralPageWrapper: React.FC<GeneralPageWrapperProps> = ({ children }) => {
    return (
        <div className="bg-[url('https://uploads-ssl.webflow.com/645b4c0a314a7c30d3e3d669/64623255b6b12cc4eef7bc89_Rectangle%2012.png')]">
            <div className="min-h-screen w-full flex flex-col justify-center bg-[url('https://uploads-ssl.webflow.com/645b4c0a314a7c30d3e3d669/645b80f1c04f481e353ee57b_section%20background.png')] bg-cover bg-no-repeat">
                <div className="w-full h-full flex flex-col items-center justify-center">{children}</div>
            </div>
        </div>
    );
};

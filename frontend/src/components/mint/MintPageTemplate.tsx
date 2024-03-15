import React from 'react';
import { Typography } from '../common/Typography';
import { MintDetails } from './MintDetails';
import ShareImage from './ShareImage';

export const MintPageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="relative flex flex-col items-center justify-center w-full h-full space-y-1 mt-2">{children}</div>;
};

export const MintPageContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center px-6 pt-8 pb-10 lg:pt-10 lg:pb-12 lg:px-12 border-[3px] bg-[url(/images/bg-black-texturized-lg.png)] space-y-6 border-white rounded-tl-3xl rounded-br-3xl">
            {children}
        </div>
    );
};

export const MintPageTitle: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
    return (
        <div className="space-y-2 bg-[url('/images/bg-white-texturized-sm.png')] rounded-tl-3xl rounded-br-3xl border-[3px] border-black py-4 px-6 lg:py-5 lg:px-12">
            <Typography text={title} variant="h4" align="center" color="black" />
            <Typography text={subtitle} variant="h5" align="center" color="black" />
        </div>
    );
};

export const SoldoutTitle: React.FC = () => {
    return (
        <div className="space-y-2 w-full bg-primary rounded-tl-3xl rounded-br-3xl border-[3px] border-white py-4 px-6 lg:py-5 lg:px-12">
            <Typography text="SOLD OUT" variant="h4" align="center" color="white" />
        </div>
    );
};

interface MintPageFooterProps {
    showShareImage?: boolean;
}
export const MintPageFooter: React.FC<MintPageFooterProps> = ({ showShareImage = true }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            {showShareImage && <ShareImage />}
            <div className="border-b-[2px] border-white w-full max-w-[80px] my-4"></div>
            <MintDetails />
        </div>
    );
};

interface MintPageTemplateProps {
    children: React.ReactNode;
    showSoldout?: boolean;
    showShareImage?: boolean;
}
export const MintPageTemplate: React.FC<MintPageTemplateProps> = ({ showSoldout, showShareImage, children }) => {
    return (
        <MintPageContainer>
            {!showSoldout && <MintPageTitle title="Welcome to the SSN2 Drop" subtitle="Get in while supply lasts" />}
            {showSoldout && <SoldoutTitle />}
            <MintPageContent>
                {children}
                <MintPageFooter showShareImage={showShareImage} />
            </MintPageContent>
        </MintPageContainer>
    );
};

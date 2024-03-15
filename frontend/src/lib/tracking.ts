import { getUserDetail, getWalletAddress } from './utils';

const trackNewsletterSubscribed = (properties: any) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window?.analytics?.track('News Letter Subscribed', properties);
};

const trackPageLanding = (pageName: string = null) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window?.analytics?.page(pageName);
};

const trackEvent = (eventName: string, properties: any = {}) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window?.analytics?.track(eventName, {
        ...properties,
    });
};

const identifyUser = () => {
    const userDetail = getUserDetail();
    const walletAddress = getWalletAddress();
    if (userDetail && walletAddress) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window?.analytics?.identify(`user-${userDetail.id}`, {
            email: userDetail.email || 'Email not entered',
            walletAddress: walletAddress,
        });
    }
};

export { trackEvent, trackNewsletterSubscribed, trackPageLanding, identifyUser };

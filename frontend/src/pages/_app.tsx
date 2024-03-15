import '../styles/fontface.css';
import '../styles/globals.css';
import '../styles/style.css';
import '@rainbow-me/rainbowkit/styles.css';
import { AppProps } from 'next/app';
import { OpenAPI } from '../lib/api/index';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets, darkTheme } from '@rainbow-me/rainbowkit';
import { trustWallet } from '@rainbow-me/rainbowkit/wallets';
import { mainnet, optimism, arbitrum, goerli, polygon } from 'wagmi/chains';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { getAccessToken } from '../lib/utils';
import { TransitionLoading } from 'src/components/common/TransitionLoading';
import * as snippet from '@segment/snippet';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { identifyUser } from '../lib/tracking';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Sentry from '@sentry/nextjs';
import useHotjar from 'react-use-hotjar';
import useAccessTokenRefresh from 'src/hooks/useAccessTokenRefresh';
import { TorusProvider } from 'src/contexts/Torus.context';
import { Web3Provider } from 'src/contexts/Web3.context';
import dynamic from 'next/dynamic'

export const getAPIUrl = () => {
    if (process.env.IS_UAT) return 'https://swoops-webapp-uat.onrender.com';
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'development') return 'http://127.0.0.1:8000';
    if (process.env.VERCEL_GIT_IS_PULL_REQUEST !== undefined && process.env.VERCEL_GIT_PULL_REQUEST_NUMBER !== undefined) {
        return `https://swoops-pr-master-${process.env.VERCEL_GIT_PULL_REQUEST_NUMBER}.onrender.com`;
    } else if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
        return `https://swoops-webapp-staging.onrender.com`;
    } else {
        return 'https://api.playswoops.com';
    }
};
OpenAPI.BASE = getAPIUrl();
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.TOKEN = getAccessToken();

const { chains, provider, webSocketProvider } = configureChains(
    [mainnet, polygon, optimism, arbitrum, ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : [])],
    [infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY }), publicProvider()]
);

const { wallets } = getDefaultWallets({
    appName: 'Swoops',
    chains,
});

const demoAppInfo = {
    appName: 'Swoops',
};

const connectors = connectorsForWallets([
    ...wallets,
    {
        groupName: 'Other',
        wallets: [trustWallet({ chains })],
    },
]);

let wagmiClient;
try {
    wagmiClient = createClient({
        connectors,
        provider,
        webSocketProvider,
        autoConnect: true,
    });
} catch (error) {
    toast.error('There was an issue while attempting to connect. Please try again later.');
    Sentry.captureException(error, { tags: { wagmi: 'Wagmi error on createClient.' } });
    console.error('Client creation error: ', error);
}

const toastClass = {
    success:
        'm-2 hover:border-2 hover:border-[#07bc0c] w-fit swoops-font text-[9px] font-[10] uppercase bg-white text-black text-left px-4 py-2 rounded-md border-2 border-transparent shadow-lg hover:cursor-pointer active:bg-slate-100',
    error: 'm-2 hover:border-2 hover:border-[#e74c3c] w-fit swoops-font text-[9px] font-[10] uppercase bg-white text-black text-left px-4 py-2 rounded-md border-2 border-transparent shadow-lg hover:cursor-pointer active:bg-slate-100',
    info: 'm-2 hover:border-2 hover:border-[#3498db] w-fit swoops-font text-[9px] font-[10] uppercase bg-white text-black text-left px-4 py-2 rounded-md border-2 border-transparent shadow-lg hover:cursor-pointer active:bg-slate-100',
    warning:
        'm-2 hover:border-2 hover:border-[#f1c40f] w-fit swoops-font text-[9px] font-[10] uppercase bg-white text-black text-left px-4 py-2 rounded-md border-2 border-transparent shadow-lg hover:cursor-pointer active:bg-slate-100',
    default:
        'm-2 hover:border-2 hover:border-[#fff] w-fit swoops-font text-[9px] font-[10] uppercase bg-white text-black text-left px-4 py-2 rounded-md border-2 border-transparent shadow-lg hover:cursor-pointer active:bg-slate-100',
    dark: 'm-2 hover:border-2 hover:border-[#121212] w-fit swoops-font text-[9px] font-[10] uppercase bg-white text-black text-left px-4 py-2 rounded-md border-2 border-transparent shadow-lg hover:cursor-pointer active:bg-slate-100',
};

const CrispWithNoSSR = dynamic(
  () => import('../components/crisp'),
  { ssr: false }
)

const SwoopsWeb = ({ Component, pageProps }: AppProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const { initHotjar } = useHotjar();
    const router = useRouter();
    const loadSegment = () => {
        const options = {
            apiKey: process.env.SEGMENT_WRITE_KEY,
        };
        if (process.env.NEXT_PUBLIC_NODE_ENV) {
            return snippet.max(options);
        } else {
            return snippet.min(options);
        }
    };

    useAccessTokenRefresh();

    useEffect(() => {
        if (!router.isReady) return;
        identifyUser();
    }, []);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
            initHotjar(3344446, 6, false, console.info);
        }
    }, [initHotjar]);

    return (
        <WagmiConfig client={wagmiClient}>
            <CrispWithNoSSR />
            <RainbowKitProvider
                theme={darkTheme({
                    accentColorForeground: '#282828',
                    accentColor: '#FDFDFD',
                })}
                appInfo={demoAppInfo}
                modalSize="compact"
                chains={chains}
            >
                <TorusProvider>
                    <Web3Provider>
                        <TransitionLoading loading={loading} setLoading={setLoading} />
                        <Script dangerouslySetInnerHTML={{ __html: loadSegment() }} id="segmentScript" />
                        <Component {...pageProps} />
                        <ToastContainer
                            position="bottom-left"
                            closeButton={false}
                            toastClassName={({ type }) => toastClass[type]}
                            hideProgressBar={true}
                        />
                    </Web3Provider>
                </TorusProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    );
};
export default SwoopsWeb;

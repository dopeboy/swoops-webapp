/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext, useEffect, useState } from 'react';
import Torus from '@toruslabs/torus-embed';
import _ from 'lodash';
import { getOperatingSystem } from 'src/lib/utils';

export interface TorusContext {
    torus: Torus | null;
    setTorus: (torus: Torus) => void;
}

export const TorusContext = createContext<TorusContext>({
    torus: null,
    setTorus: () => {},
});

export const useTorus = (): TorusContext => useContext(TorusContext);

export const TorusProvider: React.FC = ({ children }) => {
    const [torus, setTorus] = useState<Torus | null>(null);

    const initializeTorus = async () => {
        const isBrowser = typeof window !== 'undefined';
        const hasEthereum = isBrowser && _.has(window, 'ethereum');
        const os = getOperatingSystem();
        if (isBrowser && hasEthereum && os === 'Android') {
            // Social Sign in is not supported on Android with the MetaMask Browser.
            return;
        }

        const torusInstance = new Torus({
            buttonSize: 0,
        });
        await torusInstance.init({
            network: {
                host: 'mainnet',
                chainId: 1,
                networkName: 'Main Ethereum Network',
                ticker: 'ETH',
                blockExplorer: 'https://etherscan.io/',
                tickerName: 'ETH',
            },
            whiteLabel: {
                theme: {
                    isDark: true,
                    colors: {
                        torusBrand1: '#20ad1d',
                        torusBrand2: '#a83236',
                        torusBrand3: '#323ca8',
                    },
                },
                logoDark: 'https://uploads-ssl.webflow.com/645b4c0a314a7c30d3e3d669/648af775364ba438b0200522_ICON_0000_SWOOPS_GREEN-p-800.png',
                logoLight: 'https://uploads-ssl.webflow.com/645b4c0a314a7c30d3e3d669/648af775364ba438b0200522_ICON_0000_SWOOPS_GREEN-p-800.png',
            },
            enableLogging: false,
            showTorusButton: false,
            mfaLevel: 'none',
            buildEnv: 'production',
        });
        setTorus(torusInstance);
    };

    useEffect(() => {
        initializeTorus();
    }, []);

    return <TorusContext.Provider value={{ torus, setTorus }}>{children}</TorusContext.Provider>;
};

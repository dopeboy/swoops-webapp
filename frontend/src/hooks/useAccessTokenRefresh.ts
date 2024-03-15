import { MutableRefObject, useEffect, useRef } from 'react';
import { getAccessTokenExpiration, hasValidRefreshToken, refreshAccessToken } from 'src/lib/utils';
import { OpenAPI } from 'src/lib/api/core/OpenAPI';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const TEN_MINUTES = 10 * ONE_MINUTE;

/**
 * Checks if the access token in localStorage is expired, requests a new one if current is expired,
 * and schedules the next check
 * @param timeoutRef Ref object used to store the timeoutId so setTimeout can be canceled
 */
const accessTokenRefresh = async (timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | undefined>): Promise<void> => {
    let timeUntilCheck = ONE_MINUTE;

    try {
        // Get access token expiration
        let accessTokenExpiration = getAccessTokenExpiration();

        // If refresh token is valid and the access token is expired or will expire soon, update the access token
        if (hasValidRefreshToken() && Date.now() + TEN_MINUTES > accessTokenExpiration) {
            await refreshAccessToken();
            accessTokenExpiration = getAccessTokenExpiration();
        }

        // Calculate how much time until we should check again
        const timeUntilExpiration = accessTokenExpiration - Date.now();
        timeUntilCheck = Math.max(ONE_MINUTE, timeUntilExpiration / 2);
    } catch (err) {
        // If error, schedule next check for soon in the future
        timeUntilCheck = ONE_MINUTE;
    } finally {
        // Schedule next check and store timeoutId to cancel it in timeoutRef. Make sure we're waiting at least 1 second.
        timeoutRef.current = setTimeout(() => accessTokenRefresh(timeoutRef), Math.max(timeUntilCheck, ONE_SECOND));
    }
};

/**
 * Syncs OpenAPI object with localStorage changes made by a separate tab or window
 * Events aren't triggered for localStorage changes made in the same tab
 */
const useOpenApiSync = (): void => {
    const storageEventListener = (event: StorageEvent): void => {
        if (event.key !== 'access_token') {
            return;
        }

        if (event.newValue === null) {
            // If access_token removed from localStorage, set OpenAPI.TOKEN to default value
            // NOTE - We may want to set CREDENTIALS and WITH_CREDENTIALS as well. Leaving it as-is for now.
            OpenAPI.TOKEN = undefined;
        } else if (event.newValue !== OpenAPI.TOKEN) {
            OpenAPI.TOKEN = event.newValue;
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', storageEventListener);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('storage', storageEventListener);
            }
        };
    }, []);
};

/**
 * Sets up recurring client-side check and refresh of access token validity
 * Also syncs localStorage access token with token stored in OpenAPI object
 */
const useAccessTokenRefresh = (): void => {
    useOpenApiSync();

    const timeout = useRef<ReturnType<typeof setTimeout>>();
    useEffect(() => {
        accessTokenRefresh(timeout);

        return () => clearTimeout(timeout.current);
    }, []);
};

export default useAccessTokenRefresh;

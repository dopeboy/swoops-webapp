import { useEffect, useState } from 'react';

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);

        const handler: (event: MediaQueryListEvent) => void = (event) => {
            setMatches(event.matches);
        };

        // Set initial state
        handler({ matches: mediaQuery.matches } as MediaQueryListEvent);

        // Attach listener to update state on window resize
        mediaQuery.addEventListener('change', handler);

        // Clean up: remove listener on unmount
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
};

export default useMediaQuery;

import React, { createContext, useState, useEffect, useCallback } from 'react';
import useApiClient from '../api/apiClient';
import { handleApiError } from '../api/apiErrors';

export interface AuthContextInterface {
    isLoading: boolean;
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    token: string;
    setAccessToken: (token: string) => void;
    csrfToken: string;
    fetchCsrfToken: () => void;
    setLoggedOut: () => void;
    refreshTokenApiCall: () => Promise<void>;
}

const AuthContext = createContext<AuthContextInterface | null>(null);

const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setAccessToken] = useState<string>('');
    const [, setRefreshToken] = useState<string>('');
    const [csrfToken, setCsrfToken] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshIntervalId, setRefreshIntervalId] = useState<number | null>(null);
    const apiClient = useApiClient().apiClient;
    
    // Add a custom setter without logging
    const setIsLoggedInWithLogging = (value: boolean) => {
        setIsLoggedIn(value);
    };

    const fetchCsrfToken = useCallback(async () => {
        try {
            // Only log in non-test environments
            if (process.env.NODE_ENV === 'development') {
                console.log("=== CSRF Token Fetch ===");
                console.log("Current domain:", window.location.hostname);
                
                // Safely check API domain
                try {
                    if (apiClient?.defaults?.baseURL) {
                        const apiUrl = new URL(apiClient.defaults.baseURL);
                        console.log("API domain:", apiUrl.hostname);
                        console.log("Protocol:", window.location.protocol);
                        console.log("API protocol:", apiUrl.protocol);
                    }
                } catch (e) {
                    console.log("Could not parse API URL");
                }
                
                console.log("Current cookies:", document.cookie);
            }
            
            // Check if we already have a CSRF token before making the API call
            const existingCookie = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
            if (existingCookie && existingCookie[1]) {
                if (process.env.NODE_ENV === 'development') {
                    console.log("Found existing CSRF token:", existingCookie[1]);
                }
                setCsrfToken(existingCookie[1]);
                return; // Return early if we already have a token
            }
            
            // If no token exists, fetch a new one
            if (process.env.NODE_ENV === 'development') {
                console.log("No CSRF token found, fetching new one");
            }
            
            try {
                const response = await apiClient.get("/get-xsrf-cookie", {
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (process.env.NODE_ENV === 'development') {
                    console.log("CSRF token response status:", response.status);
                    console.log("CSRF token response headers:", response.headers);
                }
            } catch (fetchError) {
                if (process.env.NODE_ENV === 'development') {
                    console.error("Error fetching CSRF token:", fetchError);
                }
            }
            
            const cookie = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
            if (process.env.NODE_ENV === 'development') {
                console.log("After fetch, cookies:", document.cookie);
            }
            
            if (cookie && cookie[1]) {
                if (process.env.NODE_ENV === 'development') {
                    console.log("New CSRF token received:", cookie[1]);
                }
                setCsrfToken(cookie[1]);
            } else if (process.env.NODE_ENV === 'development') {
                console.warn("Failed to get CSRF token after fetch");
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("CSRF token fetch error:", error);
            }
            handleApiError(error);
        }
    }, [apiClient]);

    const setLoggedOut = useCallback(() => {
        setIsLoggedInWithLogging(false);
        setAccessToken('');
        setRefreshToken('');
        setIsLoading(false);
        
        // Clear the token refresh interval
        if (refreshIntervalId !== null) {
            clearInterval(refreshIntervalId);
            setRefreshIntervalId(null);
        }
    }, [setAccessToken, setRefreshToken, setIsLoading, refreshIntervalId]);

    const refreshTokenApiCall = useCallback(async () => {
        // If we're on the sign-in page, don't try to refresh the token
        if (window.location.pathname.includes('sign-in') || window.location.pathname.includes('sign-up')) {
            return;
        }
        
        setIsLoading(true); // Start loading state
        try {
            const response = await apiClient.post('/refresh-token', {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                },
            });
            setIsLoggedInWithLogging(true);
            setAccessToken(response.data.accessToken);
        } catch (error) {
            setLoggedOut();
            if (process.env.NODE_ENV === 'development') {
                console.error("Failed to refresh token:", error);
            }
        } finally {
            setIsLoading(false); // Ensure isLoading is set to false after attempt
        }
    }, [csrfToken, apiClient, setLoggedOut, setAccessToken, setIsLoggedIn, fetchCsrfToken]);

    useEffect(() => {
        const setupAuth = async () => {
            try {
                await fetchCsrfToken();
                await refreshTokenApiCall();
            } catch (error) {
                setLoggedOut();
            } finally {
                setIsLoading(false); // Ensure isLoading is set to false after attempt
            }
        };
        setupAuth();

        const intervalId = setInterval(refreshTokenApiCall, 2 * 60 * 1000); // 2 minutes

        return () => {
            clearInterval(intervalId);
        };
    }, [fetchCsrfToken, refreshTokenApiCall, setLoggedOut]);

    return (
        <AuthContext.Provider value={{
            isLoading,
            isLoggedIn,
            setIsLoggedIn: setIsLoggedInWithLogging,
            token,
            setAccessToken,
            csrfToken,
            fetchCsrfToken,
            setLoggedOut,
            refreshTokenApiCall
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
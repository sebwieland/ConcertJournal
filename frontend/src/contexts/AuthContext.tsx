import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import apiClient, { setAccessToken as setModuleAccessToken, setOnLogout } from "../api/apiClient";
import { handleApiError } from "../api/apiErrors";

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
  const [token, setAccessTokenState] = useState<string>("");
  const [csrfToken, setCsrfToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync access token to both React state and module-level variable
  const setAccessToken = useCallback((newToken: string) => {
    setAccessTokenState(newToken);
    setModuleAccessToken(newToken);
  }, []);

  const setIsLoggedInWithLogging = (value: boolean) => {
    setIsLoggedIn(value);
  };

  const fetchCsrfToken = useCallback(async () => {
    try {
      const existingCookie = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
      if (existingCookie && existingCookie[1]) {
        setCsrfToken(existingCookie[1]);
        return;
      }

      await apiClient.get("/get-xsrf-cookie");

      const cookie = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
      if (cookie && cookie[1]) {
        setCsrfToken(cookie[1]);
      }
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const setLoggedOut = useCallback(() => {
    setIsLoggedInWithLogging(false);
    setAccessToken("");
    setIsLoading(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [setAccessToken]);

  const refreshTokenApiCall = useCallback(async () => {
    if (
      window.location.pathname === "/sign-in" ||
      window.location.pathname === "/sign-up"
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/refresh-token", {});
      setIsLoggedInWithLogging(true);
      setAccessToken(response.data.accessToken);
    } catch (error) {
      setLoggedOut();
    } finally {
      setIsLoading(false);
    }
  }, [setLoggedOut, setAccessToken]);

  // Register logout callback for the 401 interceptor
  useEffect(() => {
    setOnLogout(() => {
      setIsLoggedInWithLogging(false);
      setAccessToken("");
      setIsLoading(false);
    });
  }, [setAccessToken]);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        await fetchCsrfToken();
        await refreshTokenApiCall();
      } catch (error) {
        setLoggedOut();
      } finally {
        setIsLoading(false);
      }

      // Start refresh interval AFTER initial setup completes (fixes race condition)
      intervalRef.current = setInterval(refreshTokenApiCall, 2.5 * 60 * 1000);
    };
    setupAuth();

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchCsrfToken, refreshTokenApiCall, setLoggedOut]);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isLoggedIn,
        setIsLoggedIn: setIsLoggedInWithLogging,
        token,
        setAccessToken,
        csrfToken,
        fetchCsrfToken,
        setLoggedOut,
        refreshTokenApiCall,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

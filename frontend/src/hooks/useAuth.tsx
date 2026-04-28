import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useMutation } from "react-query";
import { login as apiLogin, register as apiRegister, logout as apiLogout, LoginResponse } from "../api/apiAuth";
import { ApiError, handleApiError } from "../api/apiErrors";

interface UseAuth {
  token: string;
  login: (data: {
    email: string;
    password: string;
  }) => Promise<LoginResponse | void>;
  signUp: (data: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: ApiError | null;
}

const useAuth = (): UseAuth => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is not provided");
  }
  const { setIsLoggedIn, setAccessToken, fetchCsrfToken, setLoggedOut } =
    authContext;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const { mutateAsync: loginMutation } = useMutation(apiLogin, {
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setIsLoggedIn(true);
      fetchCsrfToken();
    },
    onError: (error: unknown) => {
      setError(handleApiError(error));
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const { mutateAsync: signUpMutation } = useMutation(apiRegister, {
    onSuccess: () => {
      fetchCsrfToken();
    },
    onError: (error: unknown) => {
      setError(handleApiError(error));
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const { mutateAsync: logoutMutation } = useMutation(apiLogout, {
    onSuccess: () => {
      authContext.setIsLoggedIn(false);
      authContext.setAccessToken("");
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure;";
      fetchCsrfToken();
    },
    onError: (error) => {
      setError(handleApiError(error));
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const login = async (data: { email: string; password: string }) => {
    try {
      const result = await loginMutation(data);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (data: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<void> => {
    await signUpMutation(data);
  };

  const logout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to logout:", error);
      }
    }
  };

  return { token: authContext.token, login, logout, signUp, isLoading, error };
};

export default useAuth;

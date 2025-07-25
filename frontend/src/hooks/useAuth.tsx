import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useMutation } from 'react-query';
import useAuthApi from "../api/apiAuth";
import { ApiError, handleApiError } from '../api/apiErrors';

// Define the login response type
interface LoginResponse {
    accessToken: string;
    // Add other fields that might be in the response
}

interface UseAuth {
    token: string;
    login: (data: { email: string; password: string }) => Promise<LoginResponse | void>;
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
    const authApi = useAuthApi();
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error('AuthContext is not provided');
    }
    const { setIsLoggedIn, setAccessToken, fetchCsrfToken, setLoggedOut } = authContext;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const { mutateAsync: loginMutation } = useMutation(authApi.login, {
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
            setIsLoggedIn(true);
            fetchCsrfToken();
            // Development logging removed
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

    const { mutateAsync: signUpMutation } = useMutation(authApi.register, {
        onSuccess: () => {
            fetchCsrfToken();
            // Development logging removed
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

    const { mutateAsync: logoutMutation } = useMutation(authApi.logout, {
        onSuccess: () => {
            authContext.setIsLoggedIn(false);
            authContext.setAccessToken('');
            document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure;";
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
            // Return the result of the mutation so we can await it
            const result = await loginMutation(data);
            return result;
        } catch (error) {
            // Development logging removed
            throw error; // Re-throw the error so the caller can handle it
        }
    };

    const signUp = async (data: {
        username: string;
        password: string;
        email: string;
        firstName: string;
        lastName: string;
    }): Promise<void> => {
        // We need to let the error propagate for the test to catch it
        // But we need to return void to match the function signature
        await signUpMutation(data);
    };

    const logout = async () => {
        try {
            await logoutMutation();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Failed to logout:", error);
            }
        }
    };

    return { token: authContext.token, login, logout, signUp, isLoading, error };
};

export default useAuth;
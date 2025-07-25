import React, { memo, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from "react-router-dom";
import LoadingIndicator from "./utilities/LoadingIndicator";

interface AuthenticatedPageProps {
    element: React.ReactElement;
}

const AuthenticatedPage = memo(({ element }: AuthenticatedPageProps) => {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error('AuthContext is not provided');
    }
    const { isLoggedIn, isLoading: authLoading } = authContext;
    const [isLoading, setIsLoading] = React.useState(authLoading);

    useEffect(() => {
        setIsLoading(authLoading);
        return () => {
            // Cleanup function
        };
    }, [authLoading, isLoggedIn]);

    // Check for authentication state
    useEffect(() => {
        // Authentication state monitoring without logging
    }, [isLoading, isLoggedIn]);

    if (isLoading) {
        return <LoadingIndicator />;
    }

    if (!isLoggedIn) {
        // Clear any lingering auth state before redirecting
        try {
            if (authContext.setLoggedOut) {
                authContext.setLoggedOut();
            }
        } catch (error) {
            // Error handling without logging
        }
        
        // Use React Router's Navigate component instead of hard redirect
        // This prevents a full page reload which can disrupt the auth flow
        return <Navigate to="/sign-in" replace />;
    }

    return element;
});

export default AuthenticatedPage;
import React, { memo, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Navigate } from "react-router-dom";
import LoadingIndicator from "../utilities/LoadingIndicator";

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
    }, [authLoading]);

    if (isLoading) {
        return <LoadingIndicator />;
    }

    if (!isLoggedIn) {
        return <Navigate to="/sign-in" replace />;
    }

    return element;
});

export default AuthenticatedPage;
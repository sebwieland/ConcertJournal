import React, { useState, useEffect } from "react";
import SignInCard from "./SignInCard";
import Content from "./Content";
import DefaultLayout from "../../theme/DefaultLayout";
import useAuth from "../../hooks/useAuth";
import { Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export default function SignInSide() {
    const { login, error, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();
    
    // Get auth context to check if user is already logged in
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error('AuthContext is not provided');
    }
    const { isLoggedIn } = authContext;
    
    // Redirect to landing page if already logged in
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setShowError(false);
        try {
            // Wait for login to complete
            const result = await login({ email, password });
            
            // If login was successful, redirect to landing page
            if (result) {
                navigate('/');
            } else {
                // Check auth context as a fallback
                setTimeout(() => {
                    if (authContext.isLoggedIn) {
                        navigate('/');
                    }
                }, 500); // Small delay to allow context to update
            }
        } catch (error) {
            setShowError(true);
        }
    };

    return (
        <DefaultLayout>
            <Content />
            <SignInCard
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleLogin={handleLogin}
                isLoading={isLoading}
            />
            {showError && error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error.message}
                </Alert>
            )}
        </DefaultLayout>
    );
}
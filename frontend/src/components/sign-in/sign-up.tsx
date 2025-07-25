// sign-up.tsx
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { styled } from '@mui/material/styles';

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import {AxiosError} from "axios";

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

export default function SignUpCard() {
    const navigate = useNavigate();
    const { signUp, token } = useAuth();
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');
    const [signUpError, setSignUpMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSignUpMessage('');
        const data = new FormData(event.currentTarget);
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        if (validateInputs()) {
            try {
                await signUp({ email, password, firstName: '', lastName: '', username: '' });
                setSignUpMessage('Registration successful! Redirecting to login page...')
                setTimeout(() => {
                    navigate('/sign-in', { replace: true });
                }, 2000);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.log(error);
                }
                if (error instanceof AxiosError) {
                    if (error.status === 409) {
                        setSignUpMessage('User already exists. Please try a different email address.');
                    } else {
                        setSignUpMessage("Unknown error")
                    }
                }
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error signing up:', error);
                }
            }
        } else {
            setSignUpMessage('Invalid email or password. Please try again')
            if (process.env.NODE_ENV === 'development') {
                console.error('Invalid inputs');
            }
        }
    };

    useEffect(() => {
        if (token) {
            navigate('/', { replace: true });
        }
    }, [navigate, token]);

    const validateInputs = () => {
        const email = document.getElementById('email') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;
        const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;

        let isValid = true;

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (password.value !== confirmPassword.value) {
            setConfirmPasswordError(true);
            setConfirmPasswordErrorMessage('Passwords do not match.');
            isValid = false;
        } else {
            setConfirmPasswordError(false);
            setConfirmPasswordErrorMessage('');
        }

        return isValid;
    };

    return (
        <Card variant="outlined">
            <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                <img
                    src="/ConcertJournal_logo.png"
                    alt="Logo"
                    width={"50"}
                    height={"50"}
                />
            </Box>
            <Typography
                component="h1"
                variant="h4"
                sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
                Sign up
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
                onKeyDown={(event: React.KeyboardEvent<HTMLFormElement>) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSubmit(event as React.FormEvent<HTMLFormElement>);
                    }
                }}
            >
                <FormControl>
                    <FormLabel htmlFor="firstName">First Name</FormLabel>
                    <TextField
                        id="firstName"
                        name="firstName"
                        placeholder="Your First Name"
                        autoComplete="firstName"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        sx={{ ariaLabel: 'firstName' }}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="secondName">First Name</FormLabel>
                    <TextField
                        id="secondName"
                        name="secondName"
                        placeholder="Your Second Name"
                        autoComplete="secondName"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        sx={{ ariaLabel: 'secondName' }}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="email">Email*</FormLabel>
                    <TextField
                        error={emailError}
                        helperText={emailErrorMessage}
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com (required)"
                        autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={emailError ? 'error' : 'primary'}
                        sx={{ ariaLabel: 'email' }}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="password">Password*</FormLabel>
                    <TextField
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={passwordError ? 'error' : 'primary'}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                    <TextField
                        error={confirmPasswordError}
                        helperText={confirmPasswordErrorMessage}
                        name="confirmPassword"
                        placeholder="••••••"
                        type="password"
                        id="confirmPassword"
                        autoComplete="current-password"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={confirmPasswordError ? 'error' : 'primary'}
                    />
                </FormControl>
                <Button type="submit" fullWidth variant="contained" onClick={validateInputs}>
                    Sign up
                </Button>
                {signUpError && (
                    <Typography
                        color={signUpError.includes('Registration successful') ? 'success' : 'error'}
                        sx={{ textAlign: 'center' }}
                    >
                        {signUpError}
                    </Typography>
                )}
                <Typography sx={{ textAlign: 'center' }}>
                    Already have an account?{' '}
                    <span>
            <Link
                href="/sign-in"
                variant="body2"
                sx={{ alignSelf: 'center' }}
            >
              Sign in
            </Link>
          </span>
                </Typography>
            </Box>
        </Card>
    );
}
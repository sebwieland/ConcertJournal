import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {styled} from '@mui/material/styles';

import {useNavigate} from "react-router-dom";
import {useLayoutEffect, useState} from "react";
import useAuth from "../../hooks/useAuth";

const Card = styled(MuiCard)(({theme}) => ({
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

export default function SignInCard() {
    const navigate = useNavigate();
    const {login, token} = useAuth();
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [signInError, setSignInError] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSignInError('');
        const data = new FormData(event.currentTarget);
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        if (validateInputs()) {
            try {
                await login({email, password});
                navigate('/', {replace: true});
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error logging in:', error);
                }
                setSignInError('Invalid email or password. Please try again')
            }
        } else {
            if (process.env.NODE_ENV === 'development') {
                console.error('Invalid inputs');
            }
        }
    };

    useLayoutEffect(() => {
        if (token) {
            navigate('/', {replace: true});
        }
    }, [token, navigate]);


    const validateInputs = () => {
        const email = document.getElementById('email') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;

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
                sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)'}}
            >
                Sign in
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{display: 'flex', flexDirection: 'column', width: '100%', gap: 2}}
                onKeyDown={(event: React.KeyboardEvent<HTMLFormElement>) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSubmit(event as React.FormEvent<HTMLFormElement>);
                    }
                }}
            >
                <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField
                        error={emailError}
                        helperText={emailErrorMessage}
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={emailError ? 'error' : 'primary'}
                        sx={{ariaLabel: 'email'}}
                    />
                </FormControl>
                <FormControl>
                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                    </Box>
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

                <Button type="submit" fullWidth variant="contained" onClick={validateInputs}>
                    Sign in
                </Button>
                {signInError && (
                    <Typography color="error" sx={{textAlign: 'center'}}>
                        {signInError}
                    </Typography>
                )}
                <Typography sx={{textAlign: 'center'}}>
                    Don&apos;t have an account?{' '}
                    <span>
            <Link
                href="/sign-up"
                variant="body2"
                sx={{alignSelf: 'center'}}
            >
              Sign up
            </Link>
          </span>
                </Typography>
            </Box>
        </Card>
    );
}

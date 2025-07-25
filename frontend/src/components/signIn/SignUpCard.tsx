import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useLayoutEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { Alert } from "@mui/material";

interface SignUpCardProps {
    username: string;
    setUsername: (username: string) => void;
    password: string;
    setPassword: (password: string) => void;
    email: string;
    setEmail: (email: string) => void;
    firstName: string;
    setFirstName: (firstName: string) => void;
    lastName: string;
    setLastName: (lastName: string) => void;
    handleSignUp: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isLoading: boolean;
}

const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
    [theme.breakpoints.up("sm")]: {
        width: "450px",
    },
    ...theme.applyStyles("dark", {
        boxShadow:
            "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
    }),
}));

export default function SignUpCard({ username, setUsername, password, setPassword, email, setEmail, firstName, setFirstName, lastName, setLastName, handleSignUp, isLoading }: SignUpCardProps) {
    const navigate = useNavigate();

    useLayoutEffect(() => {
        if (isLoading && process.env.NODE_ENV === 'development') {
            console.log('Loading...');
        }
    }, [isLoading]);

    const validateInputs = () => {
        let isValid = true;

        if (!username || username.length < 3) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Username must be at least 3 characters long.");
            }
            isValid = false;
        }

        if (!password || password.length < 6) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Password must be at least 6 characters long.");
            }
            isValid = false;
        }

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Please enter a valid email address.");
            }
            isValid = false;
        }

        if (!firstName || firstName.length < 1) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Please enter your first name.");
            }
            isValid = false;
        }

        if (!lastName || lastName.length < 1) {
            if (process.env.NODE_ENV === 'development') {
                console.error("Please enter your last name.");
            }
            isValid = false;
        }

        return isValid;
    };

    return (
        <Card variant="outlined">
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
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
                sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
            >
                Sign up
            </Typography>
            <Box
                component="form"
                onSubmit={handleSignUp}
                noValidate
                sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
                onKeyDown={(event: React.KeyboardEvent<HTMLFormElement>) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        handleSignUp(event as React.FormEvent<HTMLFormElement>);
                    }
                }}
            >
                <FormControl>
                    <FormLabel htmlFor="username">Username</FormLabel>
                    <TextField
                        error={username.length > 0 && username.length < 3}
                        helperText={username.length > 0 && username.length < 3 ? "Username must be at least 3 characters long." : ""}
                        id="username"
                        type="text"
                        name="username"
                        placeholder="yourusername"
                        autoComplete="username"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={username.length > 0 && username.length < 3 ? "error" : "primary"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="firstName">First Name</FormLabel>
                    <TextField
                        error={firstName.length > 0 && firstName.length < 1}
                        helperText={firstName.length > 0 && firstName.length < 1 ? "Please enter your first name." : ""}
                        id="firstName"
                        type="text"
                        name="firstName"
                        placeholder="John"
                        autoComplete="given-name"
                        required
                        fullWidth
                        variant="outlined"
                        color={firstName.length > 0 && firstName.length < 1 ? "error" : "primary"}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="lastName">Last Name</FormLabel>
                    <TextField
                        error={lastName.length > 0 && lastName.length < 1}
                        helperText={lastName.length > 0 && lastName.length < 1 ? "Please enter your last name." : ""}
                        id="lastName"
                        type="text"
                        name="lastName"
                        placeholder="Doe"
                        autoComplete="family-name"
                        required
                        fullWidth
                        variant="outlined"
                        color={lastName.length > 0 && lastName.length < 1 ? "error" : "primary"}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField
                        error={email.includes('@') && !/\S+@\S+\.\S+/.test(email)}
                        helperText={email.includes('@') && !/\S+@\S+\.\S+/.test(email) ? "Please enter a valid email address." : ""}
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        autoComplete="email"
                        required
                        fullWidth
                        variant="outlined"
                        color={email.includes('@') && !/\S+@\S+\.\S+/.test(email) ? "error" : "primary"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <TextField
                        error={password.length > 0 && password.length < 6}
                        helperText={password.length > 0 && password.length < 6 ? "Password must be at least 6 characters long." : ""}
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        required
                        fullWidth
                        variant="outlined"
                        color={password.length > 0 && password.length < 6 ? "error" : "primary"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FormControl>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading...' : 'Sign up'}
                </Button>
                <Typography sx={{ textAlign: "center" }}>
                    Already have an account?{" "}
                    <span>
                        <Link href="/sign-in" variant="body2" sx={{ alignSelf: "center" }}>
                            Sign in
                        </Link>
                    </span>
                </Typography>
            </Box>
        </Card>
    );
}
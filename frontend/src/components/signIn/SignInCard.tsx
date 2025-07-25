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

interface SignInCardProps {
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    handleLogin: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
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

export default function SignInCard({ email, setEmail, password, setPassword, handleLogin, isLoading }: SignInCardProps) {
    const navigate = useNavigate();

    useLayoutEffect(() => {
        if (isLoading && process.env.NODE_ENV === 'development') {
            console.log('Loading...');
        }
    }, [isLoading]);

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
                Sign in
            </Typography>
            <Box
                component="form"
                onSubmit={handleLogin}
                noValidate
                sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
                onKeyDown={(event: React.KeyboardEvent<HTMLFormElement>) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        handleLogin(event as React.FormEvent<HTMLFormElement>);
                    }
                }}
            >
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
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={email.includes('@') && !/\S+@\S+\.\S+/.test(email) ? "error" : "primary"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                    </Box>
                    <TextField
                        error={password.length > 0 && password.length < 6}
                        helperText={password.length > 0 && password.length < 6 ? "Password must be at least 6 characters long." : ""}
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="current-password"
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
                    {isLoading ? 'Loading...' : 'Sign in'}
                </Button>
                <Typography sx={{ textAlign: "center" }}>
                    Don't have an account?{" "}
                    <span>
                        <Link href="/sign-up" variant="body2" sx={{ alignSelf: "center" }}>
                            Sign up
                        </Link>
                    </span>
                </Typography>
            </Box>
        </Card>
    );
}
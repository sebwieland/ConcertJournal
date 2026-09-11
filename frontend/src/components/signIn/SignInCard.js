import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { useLayoutEffect } from "react";
const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow: "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
    [theme.breakpoints.up("sm")]: {
        width: "450px",
    },
    ...theme.applyStyles("dark", {
        boxShadow: "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
    }),
}));
export default function SignInCard({ email, setEmail, password, setPassword, handleLogin, isLoading, }) {
    useLayoutEffect(() => {
        if (isLoading && process.env.NODE_ENV === "development") {
            console.log("Loading...");
        }
    }, [isLoading]);
    return (_jsxs(Card, { variant: "outlined", children: [_jsx(Box, { sx: { display: { xs: "flex", md: "none" } }, children: _jsx("img", { src: "/ConcertJournal_logo.png", alt: "Logo", width: "50", height: "50" }) }), _jsx(Typography, { component: "h1", variant: "h4", sx: { width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }, children: "Sign in" }), _jsxs(Box, { component: "form", onSubmit: handleLogin, noValidate: true, sx: { display: "flex", flexDirection: "column", width: "100%", gap: 2 }, onKeyDown: (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        handleLogin(event);
                    }
                }, children: [_jsxs(FormControl, { children: [_jsx(FormLabel, { htmlFor: "email", children: "Email" }), _jsx(TextField, { error: email.includes("@") && !/\S+@\S+\.\S+/.test(email), helperText: email.includes("@") && !/\S+@\S+\.\S+/.test(email)
                                    ? "Please enter a valid email address."
                                    : "", id: "email", type: "email", name: "email", placeholder: "your@email.com", autoComplete: "email", autoFocus: true, required: true, fullWidth: true, variant: "outlined", color: email.includes("@") && !/\S+@\S+\.\S+/.test(email)
                                    ? "error"
                                    : "primary", value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs(FormControl, { children: [_jsx(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: _jsx(FormLabel, { htmlFor: "password", children: "Password" }) }), _jsx(TextField, { error: password.length > 0 && password.length < 6, helperText: password.length > 0 && password.length < 6
                                    ? "Password must be at least 6 characters long."
                                    : "", name: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", type: "password", id: "password", autoComplete: "current-password", required: true, fullWidth: true, variant: "outlined", color: password.length > 0 && password.length < 6 ? "error" : "primary", value: password, onChange: (e) => setPassword(e.target.value) })] }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", disabled: isLoading, children: isLoading ? "Loading..." : "Sign in" }), _jsxs(Typography, { sx: { textAlign: "center" }, children: ["Don't have an account?", " ", _jsx("span", { children: _jsx(Link, { href: "/sign-up", variant: "body2", sx: { alignSelf: "center" }, children: "Sign up" }) })] })] })] }));
}
//# sourceMappingURL=SignInCard.js.map
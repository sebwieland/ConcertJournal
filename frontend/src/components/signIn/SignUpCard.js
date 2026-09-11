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
export default function SignUpCard({ username, setUsername, password, setPassword, email, setEmail, firstName, setFirstName, lastName, setLastName, handleSignUp, isLoading, }) {
    useLayoutEffect(() => {
        if (isLoading && process.env.NODE_ENV === "development") {
            console.log("Loading...");
        }
    }, [isLoading]);
    return (_jsxs(Card, { variant: "outlined", children: [_jsx(Box, { sx: { display: { xs: "flex", md: "none" } }, children: _jsx("img", { src: "/ConcertJournal_logo.png", alt: "Logo", width: "50", height: "50" }) }), _jsx(Typography, { component: "h1", variant: "h4", sx: { width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }, children: "Sign up" }), _jsxs(Box, { component: "form", onSubmit: handleSignUp, noValidate: true, sx: { display: "flex", flexDirection: "column", width: "100%", gap: 2 }, onKeyDown: (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        handleSignUp(event);
                    }
                }, children: [_jsxs(FormControl, { children: [_jsx(FormLabel, { htmlFor: "username", children: "Username" }), _jsx(TextField, { error: username.length > 0 && username.length < 3, helperText: username.length > 0 && username.length < 3
                                    ? "Username must be at least 3 characters long."
                                    : "", id: "username", type: "text", name: "username", placeholder: "yourusername", autoComplete: "username", autoFocus: true, required: true, fullWidth: true, variant: "outlined", color: username.length > 0 && username.length < 3 ? "error" : "primary", value: username, onChange: (e) => setUsername(e.target.value) })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { htmlFor: "firstName", children: "First Name" }), _jsx(TextField, { error: firstName.length > 0 && firstName.length < 1, helperText: firstName.length > 0 && firstName.length < 1
                                    ? "Please enter your first name."
                                    : "", id: "firstName", type: "text", name: "firstName", placeholder: "John", autoComplete: "given-name", required: true, fullWidth: true, variant: "outlined", color: firstName.length > 0 && firstName.length < 1 ? "error" : "primary", value: firstName, onChange: (e) => setFirstName(e.target.value) })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { htmlFor: "lastName", children: "Last Name" }), _jsx(TextField, { error: lastName.length > 0 && lastName.length < 1, helperText: lastName.length > 0 && lastName.length < 1
                                    ? "Please enter your last name."
                                    : "", id: "lastName", type: "text", name: "lastName", placeholder: "Doe", autoComplete: "family-name", required: true, fullWidth: true, variant: "outlined", color: lastName.length > 0 && lastName.length < 1 ? "error" : "primary", value: lastName, onChange: (e) => setLastName(e.target.value) })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { htmlFor: "email", children: "Email" }), _jsx(TextField, { error: email.includes("@") && !/\S+@\S+\.\S+/.test(email), helperText: email.includes("@") && !/\S+@\S+\.\S+/.test(email)
                                    ? "Please enter a valid email address."
                                    : "", id: "email", type: "email", name: "email", placeholder: "your@email.com", autoComplete: "email", required: true, fullWidth: true, variant: "outlined", color: email.includes("@") && !/\S+@\S+\.\S+/.test(email)
                                    ? "error"
                                    : "primary", value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { htmlFor: "password", children: "Password" }), _jsx(TextField, { error: password.length > 0 && password.length < 6, helperText: password.length > 0 && password.length < 6
                                    ? "Password must be at least 6 characters long."
                                    : "", name: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", type: "password", id: "password", autoComplete: "new-password", required: true, fullWidth: true, variant: "outlined", color: password.length > 0 && password.length < 6 ? "error" : "primary", value: password, onChange: (e) => setPassword(e.target.value) })] }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", disabled: isLoading, children: isLoading ? "Loading..." : "Sign up" }), _jsxs(Typography, { sx: { textAlign: "center" }, children: ["Already have an account?", " ", _jsx("span", { children: _jsx(Link, { href: "/sign-in", variant: "body2", sx: { alignSelf: "center" }, children: "Sign in" }) })] })] })] }));
}
//# sourceMappingURL=SignUpCard.js.map
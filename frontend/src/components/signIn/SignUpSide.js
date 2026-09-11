import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import SignUpCard from "./SignUpCard";
import Content from "./Content";
import DefaultLayout from "../../theme/DefaultLayout";
import useAuth from "../../hooks/useAuth";
import { Alert } from "@mui/material";
export default function SignUpSide() {
    const { signUp, error, isLoading } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [showError, setShowError] = useState(false);
    const handleSignUp = async (event) => {
        event.preventDefault();
        setShowError(false);
        try {
            await signUp({ username, password, email, firstName, lastName });
        }
        catch (error) {
            setShowError(true);
            if (process.env.NODE_ENV === "development") {
                console.error("Sign up error:", error);
            }
        }
    };
    return (_jsxs(DefaultLayout, { children: [_jsx(Content, {}), _jsx(SignUpCard, { username: username, setUsername: setUsername, password: password, setPassword: setPassword, email: email, setEmail: setEmail, firstName: firstName, setFirstName: setFirstName, lastName: lastName, setLastName: setLastName, handleSignUp: handleSignUp, isLoading: isLoading }), showError && error && (_jsx(Alert, { severity: "error", sx: { mt: 2 }, children: error.message }))] }));
}
//# sourceMappingURL=SignUpSide.js.map
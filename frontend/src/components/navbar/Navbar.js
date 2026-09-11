import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { AppBar, Toolbar, Typography, useMediaQuery, useTheme, } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import BookIcon from "@mui/icons-material/Book";
import { useContext } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { AuthContext } from "../../contexts/AuthContext";
const Navbar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error("AuthContext is not provided");
    }
    const { setLoggedOut } = authContext;
    // if (!isLoggedIn) return null;
    const handleLogout = () => {
        // Call setLoggedOut directly from AuthContext first to ensure immediate client-side logout
        setLoggedOut();
        // Then call the logout function which handles the API call
        try {
            logout();
        }
        catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.warn("Error during logout API call, but client-side logout already completed:", error);
            }
        }
        // Force navigation to sign-in page immediately
        navigate("/sign-in");
        // Force a page reload to clear any lingering state
        setTimeout(() => {
            window.location.href = "/sign-in";
        }, 100);
    };
    const DesktopView = () => (_jsxs(_Fragment, { children: [_jsx(Button, { color: "inherit", onClick: () => navigate("/your-journal"), children: "Your Journal" }), _jsx(Button, { color: "inherit", onClick: () => navigate("/new-entry"), children: "Add Entry" }), _jsx(Button, { color: "inherit", onClick: handleLogout, children: "Logout" })] }));
    const MobileView = () => (_jsxs(_Fragment, { children: [_jsxs(Button, { color: "inherit", onClick: () => navigate("/your-journal"), sx: { textTransform: "none", padding: 0 }, children: [_jsx(BookIcon, { sx: { mr: 1 } }), _jsx(Typography, { children: "Your Journal" })] }), _jsxs(Button, { color: "inherit", onClick: handleLogout, sx: { textTransform: "none", padding: 0 }, children: [_jsx(LogoutIcon, { sx: { mr: 1 } }), _jsx(Typography, { children: "Logout" })] })] }));
    return (_jsx(_Fragment, { children: _jsx(AppBar, { position: "sticky", children: _jsxs(Toolbar, { disableGutters: true, sx: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    px: 2,
                }, children: [_jsx(Box, { sx: { display: "flex", alignItems: "center" }, children: _jsx("img", { src: "/ConcertJournal_logo.png", alt: "Logo", onClick: () => navigate("/"), style: { cursor: "pointer", marginRight: 2 }, 
                            // width="50"
                            height: "50" }) }), isMobile ? (_jsx(MobileView, {})) : (_jsx(Box, { sx: { display: "flex", gap: 2 }, children: _jsx(DesktopView, {}) }))] }) }) }));
};
export default Navbar;
//# sourceMappingURL=Navbar.js.map
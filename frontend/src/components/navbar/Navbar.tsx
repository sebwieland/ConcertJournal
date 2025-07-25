import {AppBar, Toolbar, Typography, useMediaQuery, useTheme} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import BookIcon from '@mui/icons-material/Book'
import React, {useContext, useState} from 'react';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {useNavigate} from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {AuthContext} from "../../contexts/AuthContext";

const Navbar = () => {
    const [anchorElNav, setAnchorElNav] = useState<HTMLElement | null>(null);
    const navigate = useNavigate()
    const {logout} = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error('AuthContext is not provided');
    }
    const { isLoggedIn, setLoggedOut } = authContext;

    // if (!isLoggedIn) return null;

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget as HTMLElement | null);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleLogout = () => {
        // Call setLoggedOut directly from AuthContext first to ensure immediate client-side logout
        setLoggedOut();
        
        // Then call the logout function which handles the API call
        try {
            logout();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Error during logout API call, but client-side logout already completed:', error);
            }
        }
        
        // Force navigation to sign-in page immediately
        navigate('/sign-in');
        
        // Force a page reload to clear any lingering state
        setTimeout(() => {
            window.location.href = '/sign-in';
        }, 100);
    };
    const DesktopView = () => (
        <>
            <Button color="inherit" onClick={() => navigate('/your-journal')}>
                Your Journal
            </Button>
            <Button color="inherit" onClick={() => navigate('/new-entry')}>
                Add Entry
            </Button>
            <Button color="inherit" onClick={handleLogout}>
                Logout
            </Button>
        </>
    );

    const MobileView = () => (
        <>
            <Button
                color="inherit"
                onClick={() => navigate('/your-journal')}
                sx={{textTransform: 'none', padding: 0}}
            >
                <BookIcon sx={{mr: 1}}/>
                <Typography>Your Journal</Typography>
            </Button>
            <Button
                color="inherit"
                onClick={handleLogout}
                sx={{textTransform: 'none', padding: 0}}
            >
                <LogoutIcon sx={{mr: 1}}/>
                <Typography>Logout</Typography>
            </Button>
        </>
    );

    return (
        <>
            <AppBar position="sticky">
                <Toolbar disableGutters sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    px: 2
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <img
                            src="/ConcertJournal_logo.png"
                            alt="Logo"
                            onClick={() => navigate('/')}
                            style={{cursor: 'pointer', marginRight: 2}}
                            // width="50"
                            height="50"/>
                    </Box>

                    {isMobile ? (
                        <MobileView/>
                    ) : (
                        <Box sx={{display: 'flex', gap: 2}}>
                            <DesktopView/>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
        </>
    );
};

export default Navbar;
import {ThemeProvider} from "@mui/material";
import Stack from "@mui/material/Stack";
import useTheme from "./useTheme";
import Navbar from "../components/navbar/Navbar"
import React, {PropsWithChildren, useContext} from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {AuthContext} from "../contexts/AuthContext";
import AddButton from "../components/utilities/AddButton";




const DefaultLayout = ({children}: PropsWithChildren) => {
    const {theme} = useTheme();
    const isLoggedIn = useContext(AuthContext)?.isLoggedIn;

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme/>
            {isLoggedIn && (
                <Navbar />
            )}
            {isLoggedIn && location.pathname !== '/new-entry' && location.pathname !== '/sign-in' && (
                <AddButton/>
            )}

            <Stack
                direction="column"
                component="main"
                sx={[
                    {
                        justifyContent: 'space-between',
                        height: {xs: 'auto', md: '100%'},
                    },
                    () => ({
                        backgroundImage:
                            'radial-gradient(ellipse at 70% 51%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
                        backgroundSize: '100vw 100vh',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '100vh',
                        width: '100vw',
                        height: '100vh',
                        overflow: 'auto',
                    }),
                    (theme) => ({
                        ...theme.applyStyles('light', {
                            backgroundImage:
                                'radial-gradient(at 70% 51%, hsla(210, 100%, 97%, 0.5), hsl(0, 0%, 100%))',
                        }),
                        ...theme.applyStyles('dark', {
                            backgroundImage:
                                'radial-gradient(at 70% 51%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
                        }),
                    }),
                ]}
            >
                <Stack
                    direction={{xs: 'column-reverse', md: 'row'}}
                    sx={{
                        justifyContent: 'center',
                        gap: {xs: 6, sm: 12},
                        p: 2,
                        m: 'auto',
                    }}
                >

                    {children}
                </Stack>
            </Stack>
        </ThemeProvider>
    );
};

export default DefaultLayout;
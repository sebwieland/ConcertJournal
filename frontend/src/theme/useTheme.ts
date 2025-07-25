import { useState, useEffect } from 'react';
import {createTheme, PaletteMode} from "@mui/material/styles";
import getTheme from "./getTheme";

const LIGHT_MODE = 'light';
const DARK_MODE = 'dark';

const useTheme = () => {
    const storedMode = localStorage.getItem('themeMode') || LIGHT_MODE;
    const [mode, setMode] = useState<PaletteMode>(storedMode as PaletteMode);

    useEffect(() => {
        // Check if there is a preferred mode in localStorage
        const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
        if (savedMode) {
            setMode(savedMode);
        } else {
            // If no preference is found, it uses system preference
            const systemPrefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches;
            setMode(systemPrefersDark ? 'dark' : 'light');
        }
    }, []);

    useEffect(() => {
        document.body.classList.toggle('dark-mode', mode === DARK_MODE);
    }, [mode]);

    const toggleColorMode = () => {
        try {
            const newMode = mode === DARK_MODE ? LIGHT_MODE : DARK_MODE;
            setMode(newMode);
            localStorage.setItem('themeMode', newMode);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error toggling color mode:', error);
            }
        }
    };

    const theme = createTheme(getTheme(mode));

    return { theme, mode,  toggleColorMode };
};

export default useTheme;

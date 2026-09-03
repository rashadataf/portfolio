'use client';
import { createContext, useCallback, useMemo, useContext, useEffect, type PropsWithChildren } from 'react';
import { useSafeState } from '@/hooks/useSafeState.hook';
import type { THEME, ThemeContextType } from '@/types';
import { THEME_VALUES } from '@/types';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';



const initialState: ThemeContextType = {
    theme: THEME_VALUES.DARK,
    toggleTheme: () => { },
}

const ThemeContext = createContext<ThemeContextType>(initialState);



export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {

    const [theme, setTheme] = useSafeState<THEME>(THEME_VALUES.DARK);

    useEffect(
        () => {
            const html = document.querySelector('html')
            if (!html) return

            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            const stored = localStorage.getItem('theme')
            const desired = stored === 'dark' || (stored === null && prefersDark) ? THEME_VALUES.DARK : THEME_VALUES.LIGHT

            // Only update if different to avoid mutating DOM/state during hydration
            if (desired !== theme) {
                html.classList.remove(THEME_VALUES.DARK, THEME_VALUES.LIGHT)
                html.classList.add(desired)
                setTheme(desired)
            } else {
                // ensure the html has the class (server might not have set it)
                html.classList.add(desired)
            }
            // run only once on mount
        },
        [setTheme, theme]
    )

    const toggleTheme = useCallback(
        () => {
            if (theme === THEME_VALUES.DARK) {
                localStorage.theme = 'light'
                setTheme(THEME_VALUES.LIGHT);
            } else {
                localStorage.theme = 'dark'
                setTheme(THEME_VALUES.DARK);
            }
        },
        [setTheme, theme]
    );

    const value = useMemo(
        () => (
            {
                theme,
                toggleTheme
            }
        ),
        [theme, toggleTheme]
    );

    const muiTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: theme === THEME_VALUES.DARK ? 'dark' : 'light',
                    primary: { 
                        main: theme === THEME_VALUES.DARK ? '#9c27b0' : '#6B21A8' 
                    },
                    secondary: { 
                        main: theme === THEME_VALUES.DARK ? '#00e5ff' : '#00BFA6' 
                    },
                    background: {
                        default: theme === THEME_VALUES.DARK ? '#1a1a1a' : '#ffffff',
                        paper: theme === THEME_VALUES.DARK ? '#2a2a2a' : '#ffffff'
                    },
                    text: {
                        primary: theme === THEME_VALUES.DARK ? '#ffffff' : '#000000',
                        secondary: theme === THEME_VALUES.DARK ? '#b0b0b0' : '#666666'
                    }
                },
                components: {
                    MuiButton: {
                        defaultProps: {
                            disableElevation: true,
                        },
                    },
                    MuiIconButton: {
                        defaultProps: {
                            size: 'small',
                        },
                    },
                }
            }),
        [theme]
    );

    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <ThemeContext.Provider value={value}>
                {children}
            </ThemeContext.Provider>
        </MuiThemeProvider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useThemeContext must be used within ThemeContext and make sure you are on the client side');
    }

    return context;
};

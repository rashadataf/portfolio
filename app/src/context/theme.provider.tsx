'use client';
import { createContext, useCallback, useMemo, useContext, useEffect, PropsWithChildren } from 'react';
import { useSafeState } from '@/hooks/useSafeState.hook';
import { THEME, ThemeContextType } from '@/types';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';



const initialState: ThemeContextType = {
    theme: THEME.DARK,
    toggleTheme: () => { },
}

const ThemeContext = createContext<ThemeContextType>(initialState);



export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {

    const [theme, setTheme] = useSafeState(THEME.DARK);

    useEffect(
        () => {
            const html = document.querySelector('html')
            if (!html) return

            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            const stored = localStorage.getItem('theme')
            const desired = stored === 'dark' || (stored === null && prefersDark) ? THEME.DARK : THEME.LIGHT

            // Only update if different to avoid mutating DOM/state during hydration
            if (desired !== theme) {
                html.classList.remove(THEME.DARK, THEME.LIGHT)
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
            if (theme === THEME.DARK) {
                localStorage.theme = 'light'
                setTheme(THEME.LIGHT);
            } else {
                localStorage.theme = 'dark'
                setTheme(THEME.DARK);
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
                    mode: theme === THEME.DARK ? 'dark' : 'light',
                    primary: { main: '#6B21A8' },
                    secondary: { main: '#00BFA6' },
                    background: {
                        default: theme === THEME.DARK ? '#0f0f10' : '#ffffff',
                        paper: theme === THEME.DARK ? '#121212' : '#ffffff'
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

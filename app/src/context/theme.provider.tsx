'use client';
import { createContext, useCallback, useMemo, useContext, useEffect, PropsWithChildren } from 'react';
import { useSafeState } from '@/hooks/useSafeState.hook';
import { THEME, ThemeContextType } from '@/types';



const initialState: ThemeContextType = {
    theme: THEME.DARK,
    toggleTheme: () => { },
}

const ThemeContext = createContext<ThemeContextType>(initialState);



export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {

    const [theme, setTheme] = useSafeState(THEME.DARK);

    useEffect(
        () => {
            const html = document.querySelector("html");
            html && html.classList.remove(THEME.DARK);
            html && html.classList.remove(THEME.LIGHT);
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                html && html.classList.add(THEME.DARK);
                setTheme(THEME.DARK);
            } else {
                html && html.classList.add(THEME.LIGHT);
                setTheme(THEME.LIGHT);
            }
        },
        [setTheme, theme]
    );

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

    return <ThemeContext.Provider value={value}>
        {children}
    </ThemeContext.Provider>;
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useThemeContext must be used within ThemeContext and make sure you are on the client side');
    }

    return context;
};

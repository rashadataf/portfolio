// ENUMS
export enum THEME {
    DARK = 'dark',
    LIGHT = 'light'
}

// Types
export type ThemeContextType = {
    theme: THEME,
    toggleTheme: () => void;
}
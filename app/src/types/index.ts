import type { UrlObject } from 'url';

// ENUMS
export enum THEME {
    DARK = 'dark',
    LIGHT = 'light'
}

// Types
type Url = string | UrlObject;

export type ThemeContextType = {
    theme: THEME,
    toggleTheme: () => void;
}

export type NavLinkProp = {
    href: Url;
    title: string;
}
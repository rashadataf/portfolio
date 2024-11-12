import type { UrlObject } from 'url';

// ENUMS
export enum THEME {
    DARK = 'dark',
    LIGHT = 'light'
}

export enum Role {
    User = 'user',
    Admin = 'admin',
}

export enum ArticleStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
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
    className?: string;
}

export type CredentialsType = {
    email: string;
    password: string;
}
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

export enum SaveStatus {
    IDLE = 'idle',
    SAVING = 'saving',
    SAVED = 'saved',
    ERROR = 'error',
}

export type ThemeContextType = {
    theme: THEME,
    toggleTheme: () => void;
}

export type NavLinkProp = {
    href: string;
    title: string;
    className?: string;
}

export type CredentialsType = {
    email: string;
    password: string;
}
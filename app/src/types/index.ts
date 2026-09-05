// ENUMS - using string literal types instead of enums for Turbopack compatibility
export type THEME = "dark" | "light";

export const THEME_VALUES = {
  DARK: "dark" as const,
  LIGHT: "light" as const,
} as const;

export type Role = "user" | "admin";

export const ROLE_VALUES = {
  USER: "user" as const,
  ADMIN: "admin" as const,
} as const;

export type ArticleStatus = "draft" | "published" | "archived";

export const ARTICLE_STATUS_VALUES = {
  DRAFT: "draft" as const,
  PUBLISHED: "published" as const,
  ARCHIVED: "archived" as const,
} as const;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const SAVE_STATUS_VALUES = {
  IDLE: "idle" as const,
  SAVING: "saving" as const,
  SAVED: "saved" as const,
  ERROR: "error" as const,
} as const;

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
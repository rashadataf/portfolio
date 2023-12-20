'use client';
import { useThemeContext } from '@/context/theme.provider';

export const ThemeToggler = () => {
    const { toggleTheme } = useThemeContext();

    return (
        <button
            onClick={toggleTheme}
            className="text-primary hover:text-main focus:outline-none"
        >
            Dark/Light
        </button>
    );
};

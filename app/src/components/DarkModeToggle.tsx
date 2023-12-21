'use client';
import { useThemeContext } from '@/context/theme.provider';
import { THEME } from '@/types';
import { MoonIcon, SunIcon } from './Icons';

const renderIconConditionally: {
    [key in THEME]: JSX.Element;
} = {
    "dark": <SunIcon />,
    "light": <MoonIcon />,
}

export const ThemeToggler = () => {
    const { toggleTheme, theme } = useThemeContext();

    return (
        <button
            onClick={toggleTheme}
            className="text-primary hover:text-main focus:outline-none"
        >
            {renderIconConditionally[theme]}
        </button>
    );
};

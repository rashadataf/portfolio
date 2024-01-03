'use client';
import { useThemeContext } from '@/context/theme.provider';
import { THEME } from '@/types';
import { MoonIcon, SunIcon } from './Icons';

const renderIconConditionally: {
    [key in THEME]: JSX.Element;
} = {
    "dark": <SunIcon className='h-5 w-5' />,
    "light": <MoonIcon className='h-5 w-5' />,
}

type Props = {
    className?: string;
}

export const ThemeToggler = ({ className }: Props) => {
    const { toggleTheme, theme } = useThemeContext();

    return (
        <button
            onClick={toggleTheme}
            className={`text-main hover:text-secondary focus:outline-none ${className}`}
        >
            {renderIconConditionally[theme]}
        </button>
    );
};

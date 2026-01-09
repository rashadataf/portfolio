'use client';
import { useEffect, type ReactElement } from 'react';
import { useThemeContext } from '@/context/theme.provider';
import { THEME } from '@/types';
import { MoonIcon, SunIcon } from '@/components/Icons';
import { useSafeState } from '@/hooks/useSafeState.hook';

const renderIconConditionally: Record<THEME, ReactElement> = {
    "dark": <SunIcon className='h-5 w-5' />,
    "light": <MoonIcon className='h-5 w-5' />,
}

type Props = {
    className?: string;
}

export const ThemeToggler = ({ className }: Props) => {
    const { toggleTheme, theme } = useThemeContext();
    const [isMounted, setIsMounted] = useSafeState(false);

    useEffect(
        () => {
            setIsMounted(true);
        },
        [setIsMounted]
    );

    return (
        <button
            onClick={toggleTheme}
            className={`text-secondary-color hover:text-accent-color focus:outline-none focus:border-primary-color ${className}`}
            aria-label={`The ${theme} Mode Is Active, Press to switch mode`}
        >
            {isMounted ? renderIconConditionally[theme] : null}
        </button>
    );
};

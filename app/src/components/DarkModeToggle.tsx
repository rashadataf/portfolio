'use client';
import { useEffect, type ReactElement } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useThemeContext } from '@/context/theme.provider';
import { THEME } from '@/types';
import { MoonIcon, SunIcon } from '@/components/Icons';
import { useSafeState } from '@/hooks/useSafeState.hook';

const renderIconConditionally: Record<THEME, ReactElement> = {
    "dark": <SunIcon />,
    "light": <MoonIcon />,
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
        <Tooltip title={isMounted ? `Switch to ${theme === THEME.DARK ? 'light' : 'dark'} mode` : 'Toggle theme'}>
            <IconButton
                onClick={toggleTheme}
                color="inherit"
                size="medium"
                aria-label={`The ${theme} Mode Is Active, Press to switch mode`}
                sx={{ ml: 1, color: 'text.primary', '& svg': { width: 20, height: 20 } }}
                className={className}
            >
                {isMounted ? renderIconConditionally[theme] : null}
            </IconButton>
        </Tooltip>
    );
};
